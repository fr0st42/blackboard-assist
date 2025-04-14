
require('dotenv').config()

const express = require('express')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./src/api/docs/swagger')

const apiRoutes = require('./src/api/v1/api-routes')
const publicRoutes = require('./src/public-routes')

const app = express()
const oneDay = 1000 * 60 * 60 * 24

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: new MemoryStore({ checkPeriod: oneDay }),
	cookie: { maxAge: oneDay }
}))

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api/v1', apiRoutes)
app.use('/', publicRoutes)

module.exports = app
