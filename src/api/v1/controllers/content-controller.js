
const apiUrl = process.env.BLACKBOARD_API_URL

const getContents = async (accessToken, courseId, contentId) => {
	const url = `${apiUrl}/v1/courses/${courseId}/contents${contentId ? `/${contentId}/children` : ''}`
	const options = { headers: { Authorization: `Bearer ${accessToken}` } }

	const result = await fetch(url, options)
	const { ok, status } = result

	if (!ok) return { error: { status, message: 'Could not fetch content' } }

	const json = await result.json()
	const contents = json.results
	return { contents }
}

const updateContentTitle = async (accessToken, courseId, contentId, title) => {
	const url = `${apiUrl}/v1/courses/${courseId}/contents/${contentId}?fields=title,description`
	const options = {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ title })
	}

	const result = await fetch(url, options)
	const { ok, status } = result

	if (!ok) return { error: { status, message: 'Could not update content title' } }

	const json = await result.json()
	return { contents: json }
}

const getScormObjects = async (accessToken, courseId, contentId) => {
	const { contents, error } = await getContents(accessToken, courseId, contentId)
	if (error) return { error }

	const isScorm = ({ contentHandler }) => contentHandler && contentHandler?.id === 'resource/x-plugin-scormengine'
	const scorms = contents.filter(isScorm)
	return { scorms }
}

const getGradeInfoForScorm = async (accessToken, courseId, scormId) => {
	const url = `${apiUrl}/v1/courses/${courseId}/gradebook/columns`
	const options = { headers: { Authorization: `Bearer ${accessToken}` } }

	const result = await fetch(url, options)
	const { ok, status } = result

	if (!ok) return { error: { status, message: 'Could not fetch content' } }

	const columns = await result.json()
	const column = columns.results.find(({ contentId }) => contentId === scormId)
	if (!column) return { error: { status, message: 'Could not find scorm column' } }

	const gradeInfo = column
	return { gradeInfo }
}

const markScormObjectComplete = async (accessToken, courseId, scormId, studentIds) => {
	const { gradeInfo, error } = await getGradeInfoForScorm(accessToken, courseId, scormId)
	if (error) return { error }

	const { id, score } = gradeInfo
	const { possible } = score

	const url = `${apiUrl}/v1/courses/${courseId}/gradebook/columns/${id}/users`
	const options = {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ score: possible, feedback: 'Attended class' })
	}

	const promises = studentIds.map(id => fetch(`${url}/${id}`, options))
	const results = await Promise.all(promises)

	const errors = results.filter(result => !result.ok).map(result => result.status)
	if (errors.length) return { error: { status: 500, message: 'Could not mark scorm complete' } }

	return { contents: { message: 'Scorm marked as complete' } }
}


module.exports = { getContents, updateContentTitle, getScormObjects, markScormObjectComplete }
