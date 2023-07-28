import {swagger} from './swagger.js'
import expressSecurity from './expressSecurity.js'
import healthCheck from './healthCheck.js'
import overloadProtection from './overloadProtection.js'
import expressStatusMonitor from 'express-status-monitor'

export async function route(app, cds) {
    app.log = cds.log('nodejs')
    app.log(`Custom Express Startup`)
    app.swagger = new swagger()
    expressSecurity(app)

    healthCheck(app)
    overloadProtection(app)
    // - /status
    app.use(expressStatusMonitor())
}