import { registerRoutes } from './api'
import fastify from 'fastify'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { URL } from 'url'
import 'fastify-express'
import 'fastify-secure-session'
import { Readable } from 'stream'
const app = fastify()
app.register(require('fastify-secure-session'), {
  // the name of the session cookie, defaults to 'session'
  cookieName: 'my-session-cookie',
  // adapt this to point to the directory where secret-key is located
  key: fs.readFileSync(path.join(__dirname, 'secret-key')),
  cookie: {
    path: '/',
    // options for setCookie, see https://github.com/fastify/fastify-cookie
  },
})

// 假设线上地址
const onlineUrl = 'http://localhost:5000'

registerRoutes(app)

// page proxy route
app.get('/*', async (req, reply) => {
  let { __apiUrl, __debug = req.session.get('__debug') } = req.query as any
  if (__debug) {
    req.session.set('__debug', __debug)

    if (__debug === 'false' || __debug === 'null') {
      __debug = undefined
      req.session.set('__debug', null)
    }
  }

  if (__apiUrl) {
    req.session.set('__apiUrl', __apiUrl)

    if (__apiUrl === 'false' || __apiUrl === 'null') {
      __apiUrl = undefined
      req.session.set('__apiUrl', null)
    }
  }

  const baseUrl = __debug ?? onlineUrl
  const url = new URL(baseUrl)
  const path = req.url
  const rp = parseRelativePath(path)
  Object.assign(url, rp)

  const fullUrl = url.toString()

  const res = fetch(fullUrl)
  const blob = await (await res).clone().blob()
  const contentType =
    (await res).clone().headers.get('content-type') ?? blob.type
  console.log(fullUrl + '  ' + contentType)
  if (!contentType.startsWith('text/html')) {
    // TODO contentType compatible
    if (contentType.startsWith('text') || contentType === 'application/javascript') {
      reply.type(contentType).send(await (await res).text())
      return
    }
    const buffer = await (await res).clone().buffer()
    const stream = new Readable()

    stream.push(buffer)
    stream.push(null)

    reply.type(contentType).send(stream)

    return
  }
  const html = await res.then((r) => r.text())

  const dom = new JSDOM(html)
  const { window } = dom

  const scripts = [...window.document.getElementsByTagName('script')]

  scripts.map((script) => {
    if (script.getAttribute('type') === 'module') {
      const src = script.getAttribute('src')

      if (src && src.startsWith('/')) {
        // @ts-ignore
        script.src = baseUrl + src
        script.setAttribute('src', baseUrl + src)
      }
    }
    return script
  })

  const links = [...window.document.getElementsByTagName('link')]

  links.map((link) => {
    const href = link.getAttribute('href')
    if (href && href.startsWith('/')) {
      // @ts-ignore
      link.href = baseUrl + href
      link.setAttribute('href', baseUrl + href)
    }
    return link
  })
  function injectHeader() {
    const context = {
      apiUrl: __apiUrl ?? '/api',
    }
    const $inject = dom.window.document.getElementById('PAGEPROXY_INJECT')
    if ($inject) {
      $inject.innerHTML = `window.context = ${JSON.stringify(context)}`
    }

    if (__debug) {
      const head = dom.window.document.head
      const headText = head.innerHTML
      const debugInject = VITE_DEBUG_SCRIPT_INJECT(__debug)
      head.innerHTML = `${debugInject}${headText}`
    }
  }
  injectHeader()

  const serializeHtml = dom.serialize()
  reply.type('text/html').send(serializeHtml)
})
app.setErrorHandler(function (error, request, reply) {
  console.error(error)

  reply.send(error)
})
app.listen(2323, () => {
  console.log('listen on http://localhost:2323')
})

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

function parseRelativePath(path: string): Partial<URL> {
  const relative = new URL('https://a.com' + path)

  return {
    hash: relative.hash,
    pathname: relative.pathname,
    search: relative.search,
  }
}
