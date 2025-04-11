
const { refreshAccessToken, updateSessionAuth } = require('../controllers/auth-controller')

const defaultDependencies = { refreshAccessToken, updateSessionAuth }

const handleError = (response, error) => {
	const { status, message } = error
	return response.status(status).send(message)
}

const checkAuthentication = dependencies => async (request, response, next) => {
	const { refreshAccessToken, updateSessionAuth } = dependencies || defaultDependencies

	const { session } = request
	if (!session) return response.status(401).send('Unauthorized')

	const { accessToken, refreshToken, accessExpiration } = session
	if (!accessToken) return response.status(401).send('Unauthorized')

	if (accessExpiration < Date.now()) {
		const { authData, error } = await refreshAccessToken(refreshToken)
		if (error) return handleError(response, error)
		updateSessionAuth(request, authData)
	}
	next()
}

module.exports = { checkAuthentication }

