export class Router {
    #routes = []

    get (urlPattern, handler) {
        this.#routes.push({
            method: 'GET',
            path: urlPattern,
            handler
        })
    }

    post (urlPattern, handler) {
        this.#routes.push({
            method: 'POST',
            path: urlPattern,
            handler
        })
    }

    put (urlPattern, handler) {
        this.#routes.push({
            method: 'PUT',
            path: urlPattern,
            handler
        })
    }

    delete (urlPattern, handler) {
        this.#routes.push({
            method: 'DELETE',
            path: urlPattern,
            handler
        })
    }

    patch (urlPattern, handler) {
        this.#routes.push({
            method: 'PATCH',
            path: urlPattern,
            handler
        })
    }

    getRegisteredRoutes () {
        return this.#routes
    }
}
