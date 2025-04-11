
const originalFetch = global.fetch
const restoreFetch = () => global.fetch = originalFetch

module.exports = { restoreFetch }
