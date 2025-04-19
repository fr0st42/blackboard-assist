
import { safeFetch } from './safe-fetch.module.js'
import { loadCourses } from './load-endpoints.module.js'

const loadTermCourses = async () => {
	const { result, error } = await safeFetch('/api/v1/terms/courses', {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	})
	const availableCourses = await result.json()
	return { availableCourses, error }
}

const copyCourse = async (courseId, name, templateId) => {
	const url = '/api/v1/terms/courses/copy'
	const { result, error } = await safeFetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, courseId, templateId })
	})

	if (error) displayPageError('Error copying course.')

	const json = await result.json()
	return json
}

const displayPageError = message => {
	const coursesDiv = document.querySelector('#courses')
	coursesDiv.innerHTML = ''
	coursesDiv.textContent = message
}


;(async () => {
	const { availableCourses, error: availableCoursesError } = await loadTermCourses()
	if (availableCoursesError || !availableCourses.length) return displayPageError('No available courses')

	const { courses, error: coursesError } = await loadCourses()
	if (coursesError || !courses.length) return displayPageError('No courses found to copy')

	const coursesDiv = document.querySelector('#courses')
	coursesDiv.innerHTML = ''

	availableCourses.forEach(({ courseId, name }) => {
		const courseDiv = document.createElement('div')
		courseDiv.classList.add('course')
		courseDiv.innerHTML = `
				<h2>${name}</h2>
				<p>${courseId}</p>
				<select>
					<option value="">Select a course</option>
					${courses.map(({ id, name }) => `<option value="${id}">${name}</option>`).join('')}
				</select>
				<button>Copy</button>
				<p class="error"></p>
		`
		coursesDiv.appendChild(courseDiv)
		const select = courseDiv.querySelector('select')
		const errorDiv = courseDiv.querySelector('.error')
		const button = courseDiv.querySelector('button')

		const displayCourseError = message => errorDiv.textContent = message

		button.addEventListener('click', async () => {
			const selectedCourseId = select.value
			if (!selectedCourseId) return displayCourseError('Please select a course to copy.')
			const json = await copyCourse(courseId, name, selectedCourseId)
			console.log({ json })
		})
	})
})()
