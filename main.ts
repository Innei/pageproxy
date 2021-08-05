import { registerRoutes } from './api'
import fastify from 'fastify'
const app = fastify()
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'
// 假设线上地址
const onlineUrl = 'http://localhost:5000'

registerRoutes(app)

// page proxy route
app.get('/*', async (req, reply) => {
  const { __apiUrl, __debug } = req.query as any
  const replaceUrl = __debug ?? onlineUrl
  const res = fetch(replaceUrl)
  const html = await res.then((r) => r.text())
  // const res = got.get(__debug ?? onlineUrl)

  // const html = await res.text()

  const dom = new JSDOM(html)
  const { window } = dom

  const scripts = [...window.document.getElementsByTagName('script')]

  scripts.map((script) => {
    if (script.getAttribute('type') === 'module') {
      const src = script.getAttribute('src')

      if (src && src.startsWith('/')) {
        // @ts-ignore
        script.src = replaceUrl + src
        script.setAttribute('src', replaceUrl + src)
      }
    }
    return script
  })

  const links = [...window.document.getElementsByTagName('link')]

  links.map((link) => {
    const href = link.getAttribute('href')
    if (href && href.startsWith('/')) {
      // @ts-ignore
      link.href = replaceUrl + href
      link.setAttribute('href', replaceUrl + href)
    }
    return link
  })
  function injectHeader() {
    const context = {
      apiUrl: __apiUrl ?? '/api',
    }
    dom.window.document.getElementById(
      'PAGEPROXY_INJECT',
    ).innerHTML = `window.context = ${JSON.stringify(context)}`

    if (__debug) {
      const head = dom.window.document.head
      const headText = head.innerHTML
      const debugInject = VITE_DEBUG_SCRIPT_INJECT(__debug)
      head.innerHTML = `${debugInject}${headText}`
    }
  }
  injectHeader()

  const serializeHtml = dom.serialize()
  reply
    .header('content-type', (await res).headers['content-type'])
    .send(serializeHtml)
})
app.setErrorHandler(function (error, request, reply) {
  console.error(error)

  reply.send(error)
})
app.listen(2323, () => {
  console.log('listen on http://localhost:2323')
})

const INJECT_HEADER_TEXT = `<!-- PAGEPROXY_INJECT -->`
const INJECT_SCRIPT_TEXT = `<!-- PAGEPROXY_INJECT_SCRIPT -->`

const VITE_DEBUG_SCRIPT_INJECT = (
  devUrl: string,
) => `<script type="module" src="${devUrl}/@vite/client"></script>
<script type="module">
import RefreshRuntime from "${devUrl}/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
</script>`
