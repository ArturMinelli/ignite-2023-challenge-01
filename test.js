function getPathRegex (path) {
    const routeParametersRegex = /:([a-zA-Z]+)/g
    const routeWithParams = path.replaceAll(routeParametersRegex, '(?<$1>[a-z0-9\-_]+)') + '$'

    const pathRegex = new RegExp(`^${routeWithParams}`)

    return pathRegex
}

const url = '/tasks'
const path = '/tasks'

const pathRegex = getPathRegex(path)

console.log(pathRegex.test(url)) // true
