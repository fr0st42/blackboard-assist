
const path = require('path')
const express = require('express')

const router = express.Router()
const root = path.join(__dirname, '..', 'public')

const redirectIfNotAuthenticated = (request, response, next) => {
	const accessToken = request?.session?.accessToken
	if (accessToken) return next()

	const siteUrl = process.env.SITE_URL
	const apiUrl = process.env.BLACKBOARD_API_URL
	const clientId = process.env.BLACKBOARD_CLIENT_ID

	const params = [
		'response_type=code',
		`client_id=${clientId}`,
		`redirect_uri=${siteUrl}/api/v1/auth/code`
	].join('&')

	const loginUrl = `${apiUrl}/v1/oauth2/authorizationcode?${params}`
	response.redirect(loginUrl)
}

router.use(express.static(root))

router.get('/', redirectIfNotAuthenticated, (_, response) => {
	response.sendFile('index.html', { root })
})

router.get('/scorm', redirectIfNotAuthenticated, (_, response) => {
	response.sendFile('scorm.html', { root })
})

router.post('/scorm/generate', redirectIfNotAuthenticated, (_, response) => {
	response.status(404).send('Not yet implemented')
})

router.get('/module-rename', redirectIfNotAuthenticated, (_, response) => {
	response.sendFile('module-rename.html', { root })
})

router.get('/developer', redirectIfNotAuthenticated, (_, response) => {
	response.sendFile('developer.html', { root })
})

router.get('/scorm/complete', redirectIfNotAuthenticated, (_, response) => {
	response.sendFile('scorm/complete.html', { root })
})

module.exports = router
