import { WebSocketServer } from 'ws'
import toc from '../utils/exampleTOC.js'

export function load(app, server) {

    app.use('/rest/chat', (req, res) => {
        let output =
            `<H1>Node.js Web Socket Examples</H1></br>
			<a href="/exerciseChat">/exerciseChat</a> - Chat Application for Web Socket Example</br>`+
            toc()
        res.type("text/html").status(200).send(output)
    })

    try {
        //Create Server
        var wss = new WebSocketServer({
            noServer: true,
            path: "/rest/chatServer"
        })

        //Handle Upgrade Event
        server.on("upgrade", (request, socket, head) => {
            if (request.url === '/rest/chatServer') {
                wss.handleUpgrade(request, socket, head, (ws) => {
                    wss.emit("connection", ws, request)
                })
            }
        })

        //Broadcast function
		wss.broadcast = (data) => {
			wss.clients.forEach((client) => {
				try {
					client.send(data, (error) => {
						if (typeof error !== "undefined") {
							cds.log('nodejs').error(`Send Error: ${error}`)
						}
					})
				} catch (e) {
					cds.log('nodejs').error(`Broadcast Error: ${e}`)
				}
			})
            cds.log('nodejs').info(`Sent: ${data}`)
		}

        //Web Socket Error Handler 
        wss.on("error", (error) => {
            cds.log('nodejs').error(`Web Socket Server Error: ${error}`)
        })
        
        //Web Socket Connection        
        wss.on("connection", (ws) => {
            cds.log('nodejs').info("Connected")
            
            //Web Socket Message Received
            ws.on("message", (message) => {
                cds.log('nodejs').info(`Received: ${message}`)
                wss.broadcast(message)
            })
            
            ws.send(JSON.stringify({
                user: "Node",
                text: "Hello from Node.js Server"
            }))
        })


    } catch (e) {
        cds.log('nodejs').error(e)
    }
    return app
}