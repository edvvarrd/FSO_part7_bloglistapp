const Blog = require('../models/blog')

const initialBlogs = [
	{
		title: 'test1',
		author: 'test1',
		url: 'test1.com',
		likes: 2,
	},
	{
		title: 'test2',
		author: 'test2',
		url: 'test2.com',
		likes: 3,
	},
]

const testUser = {
	username: 'testUser',
	name: 'testUser',
	password: 'testPassword',
}

const blogsInDb = async () => {
	const blogs = await Blog.find({})
	return blogs.map(blog => blog.toJSON())
}
module.exports = {
	blogsInDb,
	initialBlogs,
	testUser,
}
