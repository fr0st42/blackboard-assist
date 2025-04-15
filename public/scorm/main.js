
(async () => {
	const courseSelect = document.querySelector('#courses')
	const moduleSelect = document.querySelector('#modules')
	const studentsDiv = document.querySelector('#students')
	const scormsDiv = document.querySelector('#scorms')
	const addLinkButton = document.querySelector('#add-link')

	const getReferrer = () => (new URL(location.href)).searchParams.get('referrer')

	addLinkButton.addEventListener('click', async () => {
		const courseId = courseSelect.value
		const moduleId = moduleSelect.value
		const url = `/api/v1/courses/${courseId}/contents/${moduleId}/scorms/add-link`
		const result = await fetch(url, { method: 'POST' })
		const { status } = result
		if (status !== 200) {
			const { message } = await result.json()
			return alert(`Error: ${message}`)
		}
		const { message } = await result.json()
		alert(message)
	})

	const safeFetch = async (url, options) => {
		try {
			const result = await fetch(url, options)
			if (!result.ok) throw new Error(`Error: ${result.status}`)
			const json = await result.json()
			return { result: json }
		} catch (error) {
			return { error: error.message }
		}
	}

	const getCourseAndModuleIds = () => {
		return Object.fromEntries(new URLSearchParams(location.search))
	}

	courseSelect.addEventListener('change', async event => {
		const { target, isTrusted } = event
		const courseId = target.value
		const baseUrl = new URL(location.href)
		const referrer = getReferrer()
		const ref = referrer && !isTrusted ? `&referrer=${referrer}` : ''
		history.replaceState({}, '', `${baseUrl.pathname}?courseId=${courseId}${ref}`)
		addLinkButton.style.display = ref ? 'none' : 'block'

		const modules = await loadModules(courseId)
		if (!modules || !modules.length) return (studentsDiv.innerHTML = '<p>No modules found</p>')
		await fillModuleSelect(modules)
	})

	moduleSelect.addEventListener('change', async event => {
		const { target, isTrusted } = event
		const moduleId = target.value
		const courseId = courseSelect.value
		const baseUrl = new URL(location.href)
		const referrer = getReferrer()
		const ref = referrer && !isTrusted ? `&referrer=${referrer}` : ''
		history.replaceState({}, '', `${baseUrl.pathname}?courseId=${courseId}&moduleId=${moduleId}${ref}`)
		addLinkButton.style.display = ref ? 'none' : 'block'

		const scorms = await loadScorms(courseId, moduleId)
		if (!scorms || !scorms.length) return (scormsDiv.innerHTML = '<p>No SCORM objects found</p>')

		const students = await loadStudents(courseId)
		if (!students || !students.length) return (studentsDiv.innerHTML = '<p>No students found</p>')

		renderContent(students, scorms)
	})

	const fillCourseSelect = async courses => {
		courseSelect.innerHTML = ''
		courses.forEach(({ id, name }) => {
			const option = document.createElement('option')
			option.value = id
			option.textContent = name
			courseSelect.append(option)
		})

		const { courseId } = getCourseAndModuleIds()

		courseSelect.value = courseId || courses[0].id
		courseSelect.dispatchEvent(new Event('change'))
	}

	const fillModuleSelect = async modules => {
		moduleSelect.innerHTML = ''
		modules.forEach(({ id, title }) => {
			const option = document.createElement('option')
			option.value = id
			option.textContent = title
			moduleSelect.append(option)
		})
		const { moduleId } = getCourseAndModuleIds()
		moduleSelect.value = moduleId || modules[0].id
		moduleSelect.dispatchEvent(new Event('change'))
	}

	const loadCourses = async () => {
		const { result, error } = await safeFetch('/api/v1/courses/names')
		if (error || !result || !result.length) return null
		return result
	}

	const loadModules = async courseId => {
		const { result, error } = await safeFetch(`/api/v1/courses/${courseId}/contents`)
		if (error || !result || !result.length) return
		return result
	}

	const loadScorms = async (courseId, moduleId) => {
		const result = await fetch(`/api/v1/courses/${courseId}/contents/${moduleId}/scorms`)
		const scorms = await result.json()
		if (!scorms || !scorms.length) return null
		return scorms
	}

	const loadStudents = async courseId => {
		const result = await fetch(`/api/v1/courses/${courseId}/students`)
		const students = await result.json()
		if (!students || !students.length) return null
		return students
	}

	const courses = await loadCourses()
	if (!courses || !courses.length) return (studentsDiv.innerHTML = '<p>No courses found</p>')
	await fillCourseSelect(courses)

	const renderContent = (students, scorms) => {
		studentsDiv.innerHTML = '<ul></ul>'
		scormsDiv.innerHTML = ''

		// checkbox list of students
		const studentsList = studentsDiv.querySelector('ul')
		students.forEach(({ id, name }) => {
			const li = document.createElement('li')
			const label = document.createElement('label')
			label.className = 'checkbox'
			const { family, given } = name
			const fullName = `${given} ${family}`
			label.textContent = fullName
			const checkbox = document.createElement('input')
			checkbox.type = 'checkbox'
			checkbox.value = id
			label.prepend(checkbox)
			li.append(label)
			studentsList.append(li)
			label.addEventListener('click', e => {
				if (e.target.tagName !== 'INPUT') {
					e.preventDefault()
					checkbox.checked = !checkbox.checked
				}
			})
		})

		const getCheckedStudentIds = () => {
			const checkboxes = studentsDiv.querySelectorAll('input[type="checkbox"]:checked')
			return Array.from(checkboxes).map(checkbox => checkbox.value)
		}

		const { courseId } = getCourseAndModuleIds()
		// list of buttons with scorm titles
		scorms.forEach(({ id, title }) => {
			const button = document.createElement('button')
			button.textContent = title
			button.addEventListener('click', async () => {
				const url = `/api/v1/courses/${courseId}/contents/scorms/${id}/completed`
				const studentIds = getCheckedStudentIds()
				if (!studentIds.length) return alert('Please select at least one student')
				const result = await fetch(url, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ studentIds })
				})

				const { status } = result
				if (status !== 200) {
					const { message } = await result.json()
					return alert(`Error: ${message}`)
				}

				button.textContent = `${title} (Completed)`
				button.disabled = true
				button.classList.add('disabled')
			})
			scormsDiv.append(button)
		})
	}
})()
