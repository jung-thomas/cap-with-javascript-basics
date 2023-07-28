import helmet from 'helmet'
export default function (app) {
    app.log(`Add Helmet`)
    app.use(helmet())
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", "*.hana.ondemand.com"],
            styleSrc: ["'self'", "*.hana.ondemand.com", "'unsafe-inline'"],
            scriptSrc: ["'self'", "*.hana.ondemand.com", "'unsafe-inline'", "'unsafe-eval'", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "*.hana.ondemand.com", "www.loc.gov", "data:"]
        }
    }))
    // Sets "Referrer-Policy: no-referrer".
    app.use(helmet.referrerPolicy({ policy: "no-referrer" }))
}