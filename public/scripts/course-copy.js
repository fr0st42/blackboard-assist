
import { safeFetch } from "./safe-fetch.js"

(async () => {
    const p = document.querySelector('p')
    const courseId = 'test-course-id8'
    const name = 'test-course-name8'

    const { result, error } = await safeFetch('/api/v1/courses/copy', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ courseId, name })
	})
    if (error) return p.textContent = JSON.stringify(error, null, 2)

    const json = await result.json()

    p.textContent = JSON.stringify(json, null, 2)
})()
