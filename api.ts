import { FastifyInstance } from 'fastify'

export const registerRoutes = (app: FastifyInstance) => {
  app.get('/api/master', (_, reply) => {
    reply.send({
      message: '来自本地',
      username: 'innei',
    })
  })
}
