
const path = require('path')
const csv = require('csv-parser')
const multer = require('multer')
const { Readable } = require('stream')
const router = require('express').Router()

const termController = require('../controllers/term-controller')
const { checkAuthentication } = require('../middleware/auth-middleware')

const authMiddleware = checkAuthentication()

const storage = multer.memoryStorage()
const upload = multer({
	storage,
	fileFilter: (_, file, callback) => {
		const ext = path.extname(file.originalname).toLowerCase()
		if (ext === '.csv') return callback(null, true)
		return callback(new Error('Only CSV files are allowed'), false)
	}
})

const handleError = (response, error) => {
	const { status, message } = error
	return response.status(status).send(message)
}

router.get('/', authMiddleware, async (request, response) => {
	const { accessToken } = request.session
	const { getTerms } = termController
	const { terms, error } = await getTerms(accessToken)
	if (error) return handleError(response, error)
	response.json(terms)
})

const parseCSV = buffer => {
	return new Promise((resolve, reject) => {
		const results = []
		const stream = Readable.from(buffer)

		stream.pipe(csv())
			.on('data', data => results.push(data))
			.on('end', () => resolve(results))
			.on('error', reject)
	})
}

router.post('/upload', authMiddleware, upload.single('file'), async (request, response) => {
	const { file } = request
	if (!file) return response.status(400).send('No file uploaded')

	try {
		const results = await parseCSV(file.buffer)
		const reduced = results.reduce((acc, { Code, Username, Title, UserTypeID }) => {
			if (UserTypeID !== '3') return acc // Skip non-instructors
			const courseId = Code.replace(/^[a-zA-Z]+(?=\d)/, '').toLowerCase()
			const instructorId = Username
			const section = courseId.split('-')[1]
			const name = `${Title} (Section ${section})`
			return [ ...acc, { instructorId, courseId, name } ]
		}, [ ])

		console.log('CSV data:', reduced)
		return response.status(200).send('File processed successfully')
	} catch (error) {
		return response.status(500).send('Error reading file')
	}
})

module.exports = router
