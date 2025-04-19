
export const safeFetch = async (...options) => {
	try {
		const result = await fetch(...options)
		const { ok, status } = result
		if (!ok) return { error: { status } }
		return { result }
	} catch (error) {
		return { error }
	}
}
