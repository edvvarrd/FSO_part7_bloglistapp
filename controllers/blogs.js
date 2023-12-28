const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', {
		blogs: 0,
	})
	response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
	const blog = new Blog({ ...request.body, user: request.user.id })
	if (!blog.title || !blog.url) {
		return response
			.status(400)
			.json({ error: `Couldn't add a blog, make sure u filled all fields` })
	}
	blog.populate('user', {
		blogs: 0,
	})
	const postedBlog = await blog.save()
	request.user.blogs = request.user.blogs.concat(blog._id)
	await request.user.save()
	response.status(201).json(postedBlog)
})
blogsRouter.get('/:id', async (request, response) => {
	const blog = await Blog.findById(request.params.id)
	if (!blog) {
		return response.send(404).end()
	}
	response.json(blog)
})

blogsRouter.delete(
	'/:id',
	middleware.userExtractor,
	async (request, response) => {
		const blog = await Blog.findOne({ _id: request.params.id })
		if (!blog) {
			response.status(404).end()
		} else if (request.user.id !== blog.user.toString()) {
			return response
				.status(401)
				.json({ error: `to delete a blog, u have to be it's creator.` })
		}
		await Blog.findByIdAndRemove(blog.id)
		request.user.blogs = request.user.blogs.filter(
			usersBlog => usersBlog.toString() !== blog.id.toString()
		)
		await request.user.save()
		response.status(200).json(blog)
	}
)

blogsRouter.put('/:id', async (request, response) => {
	const updatedBlog = await Blog.findByIdAndUpdate(
		request.params.id,
		request.body,
		{
			new: true,
		}
	).populate('user', { blogs: 0 })
	if (!updatedBlog) {
		return response.status(404).end()
	}
	response.json(updatedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
	if (!request.body.content) {
		return response.status(400).json({ error: `content is required` })
	}
	const blogToComment = await Blog.findById(request.params.id)
	if (!blogToComment) {
		return response.status(404).end()
	}
	const result = await Blog.findByIdAndUpdate(
		request.params.id,
		{
			comments: blogToComment.comments.concat(request.body.content),
		},
		{ new: true }
	).populate('user', {
		blogs: 0,
	})
	response.status(200).send(result)
})

module.exports = blogsRouter
