export class RequestParser {
    #req
    #content

    constructor (req) {
        this.#req = req
    }

    testPath (path) {
        const pathRegex = this.#getPathRegex(path)

        return pathRegex.test(this.#req.url)
    }

    async parse (path) {
        this.#req.params = this.#extractUrlParams(path)
        this.#req.query = this.#extractQueryParams()

        this.#content = await this.#waitAllChunks()

        this.#parseBody()
    }
    
    #extractUrlParams (path) {
         const pathRegex = this.#getPathRegex(path)

         return this.#req.url.match(pathRegex).groups
    }

    #extractQueryParams () {
        const urlString = this.#req.url

        const queryParams = {};
        const queryString = urlString.split('?')[1];
        
        if (!queryString) {
            return queryParams;
        }

        const pairs = queryString.split('&');
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            const key = decodeURIComponent(pair[0]);
            const value = decodeURIComponent(pair[1] || '');
            queryParams[key] = value;
        }

        return queryParams;
    }

    async #waitAllChunks () {
        const chunks = []

        for await (const chunk of this.#req) {
            chunks.push(chunk)
        }

        return Buffer.concat(chunks).toString() 
    }

    #getPathRegex (path) {
        const routeParametersRegex = /:([a-zA-Z]+)/g
        const routeWithParams = path.replaceAll(routeParametersRegex, '(?<$1>[a-z0-9\-_]+)') + '$'
    
        const pathRegex = new RegExp(`^${routeWithParams}`)
    
        return pathRegex
    }

    #parseBody () {
        const contentType = this.#req.headers['content-type']
        this.#req.body = null
        this.#req.files = null

        if (!contentType) {
            return null
        }

        if (contentType.includes('application/json')) {
            this.#req.body = JSON.parse(this.#content)
        } else if (contentType.includes('multipart/form-data')) {
            this.#req.files = this.#getRequestFiles()
        }
    }

    #getRequestFiles () {
        const boundaryRegex = /--(.*)\r?\n/g
        const matches = this.#content.matchAll(boundaryRegex)
        const boundaries = [...matches].map(match => match[1])
        
        const fileStrings = this.#content.split(new RegExp(`--${boundaries[0]}(?:--)?`, 'g')).filter(str => str.trim().length > 0)
        
        const files = fileStrings.map((fileString) => {
          const filenameRegex = /filename="([^"]+)"/
          const filenameMatch = fileString.match(filenameRegex)
          const filename = filenameMatch ? filenameMatch[1] : null
    
          const contentTypeRegex = /Content-Type: ([^\n]+)/
          const contentTypeMatch = fileString.match(contentTypeRegex)
          const contentType = contentTypeMatch ? contentTypeMatch[1] : null
    
          const fileContentRegex = /(?<=^(?:.*?\n){4}).*/s;
          const fileContentMatch = fileString.match(fileContentRegex);
          const fileContent = fileContentMatch ? fileContentMatch[0] : null;
    
          return {
            name: filename,
            content: fileContent,
            contentType
          }
        })

        return files
    }
}
