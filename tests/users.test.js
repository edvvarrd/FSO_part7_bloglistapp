const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../utils/users_helper.js')
const app = require('../app.js')
const api = supertest(app)

const User = require('../models/user.js')

beforeEach(async () => {
	await User.deleteMany({})
	await User.create({
		username: 'testusername',
		name: 'test',
		password: 'testpassword',
	})
})

describe(`new user`, () => {
	test(`can be added`, async () => {
		const usersAtStart = await helper.usersInDb()
		const testUser = {
			username: 'testusername2',
			name: 'test2',
			password: 'test2',
		}
		const response = await api
			.post('/api/users')
			.send(testUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)
		expect(response.body).toMatchObject({
			username: 'testusername2',
			name: 'test2',
		})
		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
	})
	test(`can't be added if username is not unique`, async () => {
		const testUser = {
			username: 'testusername',
			name: 'test',
			password: 'test',
		}
		const response = await api
			.post('/api/users')
			.send(testUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		expect(response.error.text).toContain(
			'User validation failed: username: Error, expected `username` to be unique.'
		)
	})
	test(`can't be added if username is too short`, async () => {
		const testUser = {
			username: 'te',
			name: 'test',
			password: 'test',
		}
		const response = await api
			.post('/api/users')
			.send(testUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		expect(response.error.text).toContain(
			'User validation failed: username: username is too short.'
		)
	})
	test(`can't be added if username is missing`, async () => {
		const testUser = {
			username: '',
			name: 'test',
			password: 'test',
		}
		const response = await api
			.post('/api/users')
			.send(testUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		expect(response.error.text).toContain(
			'User validation failed: username: username is required.'
		)
	})
	test(`can't be added if password is too short`, async () => {
		const testUser = {
			username: 'testusername2',
			name: 'test',
			password: 'te',
		}
		const response = await api
			.post('/api/users')
			.send(testUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		expect(response.error.text).toContain(
			'User validation failed: password: password is too short.'
		)
	})
	test(`can't be added if password is missing`, async () => {
		const testUser = {
			username: 'testusername2',
			name: 'test',
			password: '',
		}
		const response = await api
			.post('/api/users')
			.send(testUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		expect(response.error.text).toContain(
			'User validation failed: password: password is required.'
		)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})
