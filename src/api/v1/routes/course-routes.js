
const router = require('express').Router()

const courseController = require('../controllers/course-controller')
const { checkAuthentication } = require('../middleware/auth-middleware')

const authMiddleware = checkAuthentication()

const handleError = (response, error) => {
	const { status, message } = error
	return response.status(status).send(message)
}

router.get('/', authMiddleware, async (request, response) => {
	const { accessToken } = request.session
	const { getCourses } = courseController
	const { courses, error } = await getCourses(accessToken)
	if (error) return handleError(response, error)
	response.json(courses)
})

router.get('/names', authMiddleware, async (request, response) => {
	const { accessToken } = request.session
	const { getCourseNames } = courseController
	const { names, error } = await getCourseNames(accessToken)
	if (error) return handleError(response, error)
	response.json(names)
})

router.get('/:courseId/students', authMiddleware, async (request, response) => {
	const { accessToken } = request.session
	const { courseId } = request.params
	const { getStudents } = courseController
	const { students, error } = await getStudents(accessToken, courseId)
	if (error) return handleError(response, error)
	response.json(students)
})

module.exports = router
