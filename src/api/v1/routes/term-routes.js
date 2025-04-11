
const router = require('express').Router()

const termController = require('../controllers/term-controller')
const { checkAuthentication } = require('../middleware/auth-middleware')

const authMiddleware = checkAuthentication()

const handleError = (response, error) => {
	const { status, message } = error
	return response.status(status).send(message)
}

router.get('/', authMiddleware, async (request, response) => {
	const { accessToken } = request.session
	const { getTerms } = termController
	const { terms, error } = await getTerms(accessToken)
	if (error) return handleError(response, error)
	response.json(terms)
})
