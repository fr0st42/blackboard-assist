
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

const startCourseCopy = async (accessToken, course) => {
	const { name, courseId } = course

	const body = {
		name,
		courseId
	}

	const url = `${apiUrl}/v3/courses`
	const options = {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	}

	const result = await fetch(url, options)
	const { ok, status } = result

	//if (!ok) return { error: { status, message: 'Could not create course' } }

	const json = await result.json()
	return json
}

const getCourseNames = async (accessToken, termId) => {
	const { courses, error } = await getCourses(accessToken, termId)
	if (error) return error

	const names = courses.map(({ id, name }) => ({ id, name }))
	return { names }
}


module.exports = { getCourses, getCourseNames, startCourseCopy }
