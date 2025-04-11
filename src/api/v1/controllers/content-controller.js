
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


module.exports = { getContents, updateContentTitle }
