import { zValidator } from '@hono/zod-validator'
import type { Env } from 'hono'
import { Hono } from 'hono'
import type { Schema } from 'hono/types'

import {
  type FolderContractService,
  folderCreateSchema,
  folderIdParamSchema,
  folderSelectSchema,
  folderUpdateSchema,
} from '@nicenote/shared'

import { AppError } from './app-error'

export type FolderContractFactory<E extends Env> = (
  bindings: E['Bindings']
) => FolderContractService

export function registerFolderRoutes<E extends Env, S extends Schema, BasePath extends string>(
  app: Hono<E, S, BasePath>,
  createService: FolderContractFactory<E>
) {
  return app
    .get('/folders', async (c) => {
      const service = createService(c.env as E['Bindings'])
      const data = await service.list()
      return c.json({ data: folderSelectSchema.array().parse(data) })
    })
    .get('/folders/:id', zValidator('param', folderIdParamSchema), async (c) => {
      const service = createService(c.env as E['Bindings'])
      const { id } = c.req.valid('param')
      const result = await service.getById(id)
      if (!result) throw new AppError('notFound', 404)
      return c.json(folderSelectSchema.parse(result))
    })
    .post('/folders', zValidator('json', folderCreateSchema), async (c) => {
      const service = createService(c.env as E['Bindings'])
      const body = c.req.valid('json')
      const result = await service.create(body)
      return c.json(folderSelectSchema.parse(result))
    })
    .patch(
      '/folders/:id',
      zValidator('param', folderIdParamSchema),
      zValidator('json', folderUpdateSchema),
      async (c) => {
        const service = createService(c.env as E['Bindings'])
        const { id } = c.req.valid('param')
        const body = c.req.valid('json')
        const result = await service.update(id, body)
        if (!result) throw new AppError('notFound', 404)
        return c.json(folderSelectSchema.parse(result))
      }
    )
    .delete('/folders/:id', zValidator('param', folderIdParamSchema), async (c) => {
      const service = createService(c.env as E['Bindings'])
      const { id } = c.req.valid('param')
      const deleted = await service.remove(id)
      if (!deleted) throw new AppError('notFound', 404)
      return c.json({ success: true })
    })
}
