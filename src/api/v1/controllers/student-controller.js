
const apiUrl = process.env.BLACKBOARD_API_URL

const getStudents = async (accessToken, courseId) => {
	const url = `${apiUrl}/v1/courses/${courseId}/users?expand=user&fields=user,courseRoleId`
	const options = { headers: { Authorization: `Bearer ${accessToken}` } }

	const result = await fetch(url, options)
	const { ok, status } = result

	if (!ok) return { error: { status, message: 'Could not fetch students' } }

	const json = await result.json()
	const students = json.results.map(({ user, courseRoleId }) => {
		const lower = courseRoleId.toLowerCase()
		return [ 'student', 'learner' ].includes(lower) ? user : null
	}).filter(Boolean)

	return { students }
}

module.exports = { getStudents }
