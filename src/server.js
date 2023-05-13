import { App } from './http/App.js'
import { routes } from './routes.js'

const app = new App()

app.use(routes)

app.listen(3333)
