// @ts-check
import cds_swagger from 'cds-swagger-ui-express'
import cds from '@sap/cds'
import * as path from 'path'
import { existsSync as fileExists } from 'fs'
import { fileURLToPath } from 'url'
// @ts-ignore
const __dirname = fileURLToPath(new URL('.', import.meta.url))
let app

cds
  .on('bootstrap', async function (_app) {
    app = _app
    app.use(cds_swagger())
    let expressFile = path.join(__dirname, './server/express.js')
    if (fileExists(expressFile)) {
      const expressFileExc = await import(`file://${expressFile}`)
      expressFileExc.route(app, cds)
    }

  })
  .on('serving', service => {
    // @ts-ignore
    const apiPath = '/api-docs' + service.path
    console.log(`[Open API] - serving ${service.name} at ${apiPath}`)
    addLinkToGraphQl(service)
    addCustomLinks(service)

    app.use('/model/', async (req, res) => {
      const csn = await cds.load('db')
      const model = cds.reflect(csn)
      res.type('json')
      res.send(JSON.stringify(model))
    })
  })

function addLinkToGraphQl(service) {
  const provider = (entity) => {
    if (entity) return // avoid link on entity level, looks too messy
    return { href: 'graphql', name: 'GraphQL', title: 'Show in GraphQL' }
  }
  // Needs @sap/cds >= 4.4.0
  service.$linkProviders ? service.$linkProviders.push(provider) : service.$linkProviders = [provider]
}

function addCustomLinks(service) {
  const providerStatus = (entity) => {
    if (entity) return // avoid link on entity level, looks too messy
    return { href: 'status', name: 'Express Status', title: 'Show realtime Express status' }
  }
  const providerHealth = (entity) => {
    if (entity) return // avoid link on entity level, looks too messy
    return { href: 'healthcheck', name: 'Health Check', title: 'Health Check Status'}
  }
  service.$linkProviders ? service.$linkProviders.push(providerStatus) : service.$linkProviders = [providerStatus]
  service.$linkProviders ? service.$linkProviders.push(providerHealth) : service.$linkProviders = [providerHealth]
}

export const server = cds.server