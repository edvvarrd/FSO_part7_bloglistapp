const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../utils/blogs_helper.js')
const app = require('../app.js')
const api = supertest(app)

const Blog = require('../models/blog.js')
const User = require('../models/user.js')

beforeEach(async () => {
	await Blog.deleteMany({})
	await User.deleteMany({})

	const createdUser = await api.post('/api/users').send(helper.testUser)

	const blogsArray = helper.initialBlogs.map(
		blog => new Blog({ ...blog, user: createdUser.body.id })
	)
	await Blog.insertMany(blogsArray)
})

describe(`All blogs in the database`, () => {
	test(`are returned as a JSON files and have a proper amount`, async () => {
		const blogs = await api
			.get(`/api/blogs`)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		expect(blogs.body).toHaveLength(helper.initialBlogs.length)
	})

	test(`are properly marked by "id"`, async () => {
		const blogsInDb = await helper.blogsInDb()
		const resultBlog = await api
			.get(`/api/blogs/${blogsInDb[0].id}`)
			.expect(200)
		expect(resultBlog.body.id).toBeDefined()
	})
})
describe(`A single blog`, () => {
	let token
	beforeEach(async () => {
		const loggedUser = await api.post('/api/login').send({
			username: helper.testUser.username,
			password: helper.testUser.password,
		})
		token = loggedUser.body.token
	})
	test(`can be succesfully and properly posted`, async () => {
		const testBlog = {
			title: 'test',
			author: 'test',
			url: 'test.com',
			likes: 3,
		}
		const response = await api
			.post('/api/blogs')
			.send(testBlog)
			.set(`Authorization`, `Bearer ${token}`)
			.expect(201)
			.expect('Content-Type', /application\/json/)
		expect(response.body).toMatchObject(testBlog)
		const blogsInDb = await helper.blogsInDb()
		expect(blogsInDb).toHaveLength(helper.initialBlogs.length + 1)
	})

	test(`have a default value of likes as 0 if it's missing in the request`, async () => {
		const testBlog = {
			title: 'test',
			author: 'test',
			url: 'test.com',
		}
		const response = await api
			.post('/api/blogs')
			.send(testBlog)
			.set(`Authorization`, `Bearer ${token}`)
			.expect(201)
			.expect('Content-Type', /application\/json/)
		expect(response.body).toHaveProperty('likes', 0)
	})
	test(`won't be added if title or url is missing`, async () => {
		const testBlog = {
			author: 'test',
		}
		await api
			.post('/api/blogs')
			.send(testBlog)
			.set(`Authorization`, `Bearer ${token}`)
			.expect(400)
	})

	test(`can be deleted from the database`, async () => {
		const blogsInDb = await helper.blogsInDb()
		await api
			.delete(`/api/blogs/${blogsInDb[0].id}`)
			.set(`Authorization`, `Bearer ${token}`)
			.expect(200)
	})
	test(`can be updated in the database`, async () => {
		const testBlog = {
			likes: 30,
		}
		const blogsInDb = await helper.blogsInDb()
		const response = await api
			.put(`/api/blogs/${blogsInDb[0].id}`)
			.send(testBlog)
		expect(response.body).toMatchObject(testBlog)
	})
	test(`won't be added with proper status if token is wrong / no token`, async () => {
		const testBlog = {
			title: 'test',
			author: 'test',
			url: 'test.com',
		}
		const response = await api.post('/api/blogs').send(testBlog).expect(401)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})
