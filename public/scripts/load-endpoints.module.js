
import { safeFetch } from './safe-fetch.module.js'

export const loadCourses = async () => {
	const { result, error } = await safeFetch('/api/v1/courses')
	if (error) return { error }

	const allCourses = await result.json()
	const courses = allCourses.filter(({ ultraStatus }) => ultraStatus === 'Ultra')
	return { courses, error }
}

export const loadModules = async courseId => {
	const { result, error } = await safeFetch(`/api/v1/courses/${courseId}/contents`)
	if (error) return { error }

	const modules = await result.json()
	return { modules, error }
}

export const loadTerms = async () => {
	const { result, error } = await safeFetch('/api/v1/terms')
	if (error) return { error }

	const terms = await result.json()
	return { terms, error }
}
