
require('dotenv').config()

const assert = require('node:assert')
const { describe, it, after } = require('node:test')
const controller = require('../src/api/v1/controllers/content-controller')
const { restoreFetch } = require('./services/restore-fetch-service')

const result200 = { ok: true, status: 200 }
const result400 = { ok: false, status: 400 }

describe('Content Controller', () => {

	after(restoreFetch)

	describe('getContents', () => {
		it('should return top-level content for a valid course id', async () => {
			global.fetch = async () => ({
				...result200, json: async () => ({ results: [ ] })
			})
			const { getContents } = controller
			const { contents } = await getContents('valid-token', 'course-id')
			assert.ok(contents)
		})

		it('should return inner content for a valid course and content id', async () => {
			global.fetch = async () => ({
				...result200, json: async () => ({ results: [ ] })
			})
			const { getContents } = controller
			const { contents } = await getContents('valid-token', 'course-id', 'content-id')
			assert.ok(contents)
		})

		it('should return an error if content cannot be fetched', async () => {
			global.fetch = async () => result400
			const { getContents } = controller
			const { error } = await getContents('invalid-token', 'invalid-course-id', 'invalid-content-id')
			assert.ok(error)
		})
	})

})