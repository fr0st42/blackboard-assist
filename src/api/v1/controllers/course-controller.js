
const apiUrl = process.env.BLACKBOARD_API_URL

const getCourses = async (accessToken, termId) => {
	const params = { expand: 'course', fields: 'course,courseRoleId' }
	const queryString = new URLSearchParams(params).toString()
	const url = `${apiUrl}/v1/users/me/courses?${queryString}`
	const options = { headers: { Authorization: `Bearer ${accessToken}` } }

	const result = await fetch(url, options)
	const { ok, status } = result

	if (!ok) return { error: { status, message: 'Could not fetch courses' } }

	const roles = [ 'instructor', 'coursebuilder', 'bbfacilitator' ]
	const json = await result.json()
	const courses = json.results.map(({ course, courseRoleId }) => {
		if (termId && course.termId !== termId) return null
		return roles.includes(courseRoleId.toLowerCase()) ? course : null
	}).filter(Boolean)

	return { courses }
}

// PUT {{apiV1}}/courses/_9163_1/users/_522472_1
// Authorization: Bearer {{accessToken}}
// Content-Type: application/json

// {
//     "courseRoleId": "Instructor"
// }

const getUserId = async accessToken => {
	const url = `${apiUrl}/v1/users/me`
	const options = { headers: { Authorization: `Bearer ${accessToken}` } }
	const result = await fetch(url, options)
	const { ok, status } = result
	if (!ok) return { error: { status, message: 'Could not find logged in user' } }
	const { id } = await result.json()
	return { userId: id }
}

const assignInstructor = async (accessToken, courseId, instructorId) => {
	const url = `${apiUrl}/v1/courses/${courseId}/users/${instructorId}`
	const options = {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ courseRoleId: 'Instructor' })
	}

	const result = await fetch(url, options)
	const { ok, status } = result
	const json = await result.json()
	if (!ok) return { error: { status, message: 'Could not assign instructor to course', json } }
	return { json }
}

const startCourseCopy = async (adminToken, accessToken, course) => {
	const { name, courseId } = course
	const { userId } = await getUserId(accessToken)

	const url = `${apiUrl}/v3/courses`
	const options = {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${adminToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ name, courseId })
	}

	const result = await fetch(url, options)
	const { ok, status } = result
	if (!ok) return { error: { status, message: 'Could not create course' } }

	const { id } = await result.json()
	console.log({ id, userId })

	const { error } = await assignInstructor(adminToken, id, userId)
	if (error) return { error }

	return { id }
}

const getCourseNames = async (accessToken, termId) => {
	const { courses, error } = await getCourses(accessToken, termId)
	if (error) return error

	const names = courses.map(({ id, name }) => ({ id, name }))
	return { names }
}


module.exports = { getCourses, getCourseNames, startCourseCopy }
