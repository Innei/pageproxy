import { FastifyInstance } from 'fastify'

export const registerRoutes = (app: FastifyInstance) => {
  app.get('/api/master', (_, reply) => {
    reply.send({
      message: '来自本地',
      username: 'innei',
    })
  })

  // 简单鉴权
  app.post('/api/login', async (req, reply) => {
    req.session.set(
      'user',
      JSON.stringify({
        username: 'innei',
      }),
    )
    reply.send({ message: 'success' })
  })
}
