
const router = require('express').Router()

const contentController = require('../controllers/content-controller')
const { checkAuthentication } = require('../middleware/auth-middleware')

const authMiddleware = checkAuthentication()

const handleError = (response, error) => {
	const { status, message } = error
	return response.status(status).send(message)
}

router.get('/:courseId/contents', authMiddleware, async (request, response) => {
	const { accessToken } = request.session
	const { courseId } = request.params
	const { getContents } = contentController
	const { contents, error } = await getContents(accessToken, courseId)
	if (error) return handleError(response, error)
	response.json(contents)
})

router.get('/:courseId/contents/:contentId', authMiddleware, async (request, response) => {
	const { accessToken } = request.session
	const { courseId, contentId } = request.params
	const { getContents } = contentController
	const { contents, error } = await getContents(accessToken, courseId, contentId)
	if (error) return handleError(response, error)
	response.json(contents)
})

router.patch('/:courseId/contents/:contentId', authMiddleware, async (request, response) => {
	const { accessToken } = request.session
	const { courseId, contentId } = request.params
	const { title } = request.body
	const { updateContentTitle } = contentController
	const { contents, error } = await updateContentTitle(accessToken, courseId, contentId, title)
	if (error) return handleError(response, error)
	response.json(contents)
})