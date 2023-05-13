import { randomUUID } from 'node:crypto'
import { Router } from "./http/Router.js";
import { Database } from './database.js'

export const routes = new Router()

const database = new Database()

routes.get('/tasks', (req, res) => {
    const { search } = req.query

    const tasks = database.select('tasks', search ? {
        name: search,
        email: search
    } : null)

    return res.end(JSON.stringify(tasks))
})

routes.post('/tasks', (req, res) => {
    const {
        title,
        description,
    } = req.body

    if (!title) {
        return res.writeHead(400).end(JSON.stringify({
            message: 'Parameter title is required'
        }))
    }

    if (!description) {
        return res.writeHead(400).end(JSON.stringify({
            message: 'Parameter description is required'
        }))
    }

    const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date()
    }

    database.insert('tasks', task)

    return res.writeHead(201).end()
})

routes.put('/tasks/:id', (req, res) => {
    const { id } = req.params
    const { title, description } = req.body

    const taskExists = database.findById('tasks', id)
    if (!taskExists) {
        return res.writeHead(404).end(JSON.stringify({
            message: 'Task not found'
        }))
    }

    database.update('tasks', id, {
        title,
        description,
        updated_at: new Date()
    })

    return res.writeHead(204).end()
})

routes.delete('/tasks/:id', (req, res) => {
    const { id } = req.params

    const taskExists = database.findById('tasks', id)
    if (!taskExists) {
        return res.writeHead(404).end(JSON.stringify({
            message: 'Task not found'
        }))
    }

    database.delete('tasks', id)

    return res.writeHead(204).end()
})

routes.patch('/tasks/:id/complete', (req, res) => {
    const { id } = req.params

    const task = database.findById('tasks', id)
    if (!task) {
        return res.writeHead(404).end(JSON.stringify({
            message: 'Task not found'
        }))
    }

    database.update('tasks', id, {
        updated_at: new Date(),
        completed_at: task.completed_at ? null : new Date()
    })

    return res.writeHead(204).end()
})

routes.post('/tasks/import', (req, res) => {
    const { files } = req

    if (files.length === 0) {
        return res.writeHead(400).end(JSON.stringify({
            message: 'No file was sent'
        }))
    }

    if (files.length > 1) {
        return res.writeHead(400).end(JSON.stringify({
            message: 'Please send one file at a time'
        }))
    }

    const fileContent = files[0].content

    try {
        const rows = fileContent.split('\n')

        const headers = rows[0].trim().split(',')
        const columnsAmount = headers.length

        rows.shift()

        rows.map((row) => {
            if (!row.replace(/\s/g, '').length) {
                return null
            }

            const values = row.trim().split(',')
            let task = {}

            for (let i = 0; i < columnsAmount; i++) {
                task[headers[i]] = values[i]
            }

            if (!task.title) {
                return res.writeHead(400).end(JSON.stringify({
                    message: 'Parameter title is required'
                }))
            }

            if (!task.description) {
                return res.writeHead(400).end(JSON.stringify({
                    message: 'Parameter description is required'
                }))
            }

            task = {
                id: randomUUID(),
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date(),
                ...task
            }

            database.insert('tasks', task)
        })

        return res.writeHead(201).end()
    } catch {
        return res.writeHead(400).end(JSON.stringify({
            message: 'Error while parsing CSV file'
        }))
    }
})
