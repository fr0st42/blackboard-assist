
const path = require('path')
const express = require('express')

const router = express.Router()
const root = path.join(__dirname, '..', 'public')

router.get('/', (request, response) => {
	const accessToken = request?.session?.accessToken
	if (accessToken) return response.sendFile('index.html', { root })

	const siteUrl = process.env.SITE_URL
	const apiUrl = process.env.BLACKBOARD_API_URL
	const clientId = process.env.BLACKBOARD_CLIENT_ID

	const params = [
		`response_type=code`,
		`client_id=${clientId}`,
		`redirect_uri=${siteUrl}/api/v1/auth/code`
	].join('&')
	
	const loginUrl = `${apiUrl}/v1/oauth2/authorizationcode?${params}`
	response.redirect(loginUrl)
})

router.use(express.static(root))

module.exports = router