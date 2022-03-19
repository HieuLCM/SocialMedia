const checkAuth = require('../../util/check-auth')
const Post = require('../../models/Post')
const {UserInputError, AuthenticationError} = require('apollo-server')

module.exports = {
    Mutation: {
        async createComment(parent, {postId, body}, context) {
            const user = checkAuth(context)

            if (body.trim() === ""){
                throw new UserInputError('Empty comment', {
                    error: {
                        body: 'Comment must not be empty'
                    }
                })
            }

            const post = await Post.findById(postId)

            if (post){
                post.comments.unshift({
                    body,
                    username: user.username,
                    createdDate: new Date().toISOString()
                })
                await post.save()
                return post
            }
            else {
                throw new UserInputError('Post not found', {
                    error: {
                        postId: 'postId not found'
                    }
                })
            }
        },
        async deleteComment(parent, {postId, commentId}, context) {
            const user = checkAuth(context)
            const post = await Post.findById(postId)

            if (!post) {
                throw new UserInputError('Post not found', {
                    error: {
                        postId: 'postId not found'
                    }
                })
            }

            const comment = post.comments.find(comment => comment.id === commentId)

            if (!comment) {
                throw new UserInputError('Comment not found', {
                    error: {
                        commentId: 'commentId not found'
                    }
                })
            }
            if (user.username !== post.username && user.username !== comment.username) {
                throw new AuthenticationError('Action not allowed')
            }
            
            post.comments = post.comments.filter(comment => comment.id !== commentId)
            await post.save()
            return post
        },
    }
}