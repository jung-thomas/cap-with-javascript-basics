// @ts-check
import cds from '@sap/cds'
import * as path from 'path'
import { existsSync as fileExists } from 'fs'
import { fileURLToPath } from 'url'
import upath from 'upath'
import { glob } from 'glob'

// @ts-ignore
const __dirname = fileURLToPath(new URL('.', import.meta.url))
let app

cds
  .on('bootstrap', async function (_app) {
    app = _app
    let expressFile = path.join(__dirname, './server/express.js')
    if (fileExists(expressFile)) {
      const { default: expressFileExc } = await import(`file://${expressFile}`)
      expressFileExc(app, cds)
    }

    //Load routes
    let routesDir = path.join(__dirname, './routes/**/*.js')
    let files = await glob(upath.normalize(routesDir))
    if (files.length !== 0) {
      for (let file of files) {
        app.log(`Loading: ${file}`)
        const { default: Route } = await import(`file://${file}`)
        Route(app, server)
      }
    }

  })
  .on('serving', service => {
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
    return { href: 'healthcheck', name: 'Health Check', title: 'Health Check Status' }
  }
  const providerSwagger = (entity) => {
    if (entity) return // avoid link on entity level, looks too messy
    return { href: 'apiJS/api-docs', name: 'Swagger UI', title: 'Test Node.js Endpoints with Swagger' }
  }
  service.$linkProviders ? service.$linkProviders.push(providerStatus) : service.$linkProviders = [providerStatus]
  service.$linkProviders ? service.$linkProviders.push(providerHealth) : service.$linkProviders = [providerHealth]
  service.$linkProviders ? service.$linkProviders.push(providerSwagger) : service.$linkProviders = [providerSwagger]

}

export const server = cds.server