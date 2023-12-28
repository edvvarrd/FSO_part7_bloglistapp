const _ = require('lodash')

const dummy = () => {
	return 1
}

const totalLikes = blogs => {
	if (blogs.length === 0) {
		const result = 0
		return result
	} else if (blogs.length === 1) {
		const result = blogs[0].likes
		return result
	} else {
		return blogs.reduce((a, b) => a + b.likes, 0)
	}
}

const favoriteBlog = blogs => {
	if (blogs.length === 0) {
		const result = 0
		return result
	} else if (blogs.length === 1) {
		const result = {
			title: blogs[0].title,
			author: blogs[0].author,
			likes: blogs[0].likes,
		}
		return result
	} else {
		const favBlog = blogs.reduce((prev, current) => {
			return prev.likes > current.likes ? prev : current
		})
		return {
			title: favBlog.title,
			author: favBlog.author,
			likes: favBlog.likes,
		}
	}
}

const mostBlogs = blogs => {
	if (blogs.length === 0) {
		const result = 0
		return result
	} else if (blogs.length === 1) {
		const result = {
			author: blogs[0].author,
			blogs: 1,
		}
		return result
	} else {
		const mostWrittenAuthor = _.maxBy(
			_.entries(_.countBy(blogs, 'author')),
			_.last
		)
		const result = {
			author: mostWrittenAuthor[0],
			blogs: mostWrittenAuthor[1],
		}
		return result
	}
}
const mostLikes = blogs => {
	if (blogs.length === 0) {
		const result = 0
		return result
	} else if (blogs.length === 1) {
		const result = {
			author: blogs[0].author,
			likes: blogs[0].likes,
		}
		return result
	} else {
		const countedAuthors = _.map(_.groupBy(blogs, 'author'), (author, name) => {
			return {
				author: name,
				likes: _.sumBy(author, 'likes'),
			}
		})
		const result = _.maxBy(countedAuthors, 'likes')
		return result
	}
}
module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes,
}
