const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')

require('express-async-errors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

if (process.env.NODE_ENV === 'test') {
	const testingRouter = require('./controllers/testing')
	app.use('/api/testing', testingRouter)
}

const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

logger.info(`connecting to DB`)

mongoose
	.connect(config.mongoURL)
	.then(() => {
		logger.info(`connected to DB`)
	})
	.catch(error => {
		logger.error(`error connecting to DB: ${error}`)
	})

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', middleware.tokenExtractor, blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(express.static('dist'))
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
