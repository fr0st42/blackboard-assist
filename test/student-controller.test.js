
require('dotenv').config()

const assert = require('node:assert')
const { describe, it, after } = require('node:test')
const controller = require('../src/api/v1/controllers/student-controller')
const { restoreFetch } = require('./services/restore-fetch-service')


// Mocking response results
const result200 = { ok: true, status: 200 }
const result400 = { ok: false, status: 400 }


describe('Student Controller', () => {
	after(restoreFetch)

	describe('getStudents', () => {
		const { getStudents } = controller

		it('should return students for a valid course', async () => {
			global.fetch = async () => ({
				...result200, json: async () => ({ results: [] })
			})
			const { students } = await getStudents('valid-token', 'course-id')
			assert.ok(students)
			assert.strictEqual(students.length, 0)
		})

		it('should return an error if students cannot be fetched', async () => {
			global.fetch = async () => result400
			const { error } = await getStudents('invalid-token', 'invalid-course-id')
			assert.ok(error)
		})

		it('need to test with mock student data', { todo: true }, () => { })
	})
})
