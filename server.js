
const app = require('./app')
const port = process.env.PORT || 3000
const message = `Server running at http://localhost:${port}`
app.listen(port, () => console.log(message))
