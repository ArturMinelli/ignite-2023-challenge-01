import http from 'node:http'
import { RequestParser } from './RequestParser.js'

export class App {
    #server = http.createServer(this.#handleRequest.bind(this))
    #routes = []
    #requestParser

    use (router) {
        this.#routes.push(...router.getRegisteredRoutes())
    }

    listen (port) {
        this.#server.listen(port)
    }

    #findRoute (req) {
        return this.#routes.find((route) => route.method === req.method && this.#requestParser.testPath(route.path))
    }

    async #handleRequest (req, res) {
        this.#requestParser = new RequestParser(req)

        const route = this.#findRoute(req)

        if (!route) {
            res.statusCode = 404
            res.end()
            return
        }

        await this.#requestParser.parse(route.path)

        res.setHeader('Content-type', 'application/json')

        route.handler(req, res)
    }
}
