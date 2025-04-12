
const initializeTheme = () => {
	const themeKey = 'fvtc.software-theme'

	const themePicker = document.querySelector('#theme-picker')
	if (!themePicker) return

	const themeButtons = themePicker.querySelectorAll('button')
	if (!themeButtons) return

	const storedTheme = localStorage.getItem(themeKey) || 'system'
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

	const applyTheme = theme => {
		const isDark = theme === 'dark' || (theme === 'system' && prefersDark.matches)
		document.body.classList.toggle('dark', isDark)
		document.body.classList.toggle('light', !isDark)
		themePicker.querySelector('.selected')?.classList.remove('selected')
		themePicker.querySelector(`button#${theme}-theme`)?.classList.add('selected')
		localStorage.setItem(themeKey, theme)
		console.log(`Theme set to ${theme}`)
	}

	applyTheme(storedTheme)

	themeButtons.forEach(button => {
		button.addEventListener('click', () => {
			const { id } = button
			if (!id) return
			applyTheme(id.split('-')[0])
		})
	})

	prefersDark.addEventListener('change', () => {
		const theme = localStorage.getItem(themeKey) || 'system'
		if (theme === 'system') applyTheme('system')
	})
}

initializeTheme()
