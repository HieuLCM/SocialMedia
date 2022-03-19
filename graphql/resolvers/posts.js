const {UserInputError ,AuthenticationError } = require('apollo-server')
const Post = require('../../models/Post')
const checkAuth = require('../../util/check-auth')

module.exports = {
    Query: {
        async getPosts(){
            try{
                const posts = await Post.find().sort({createdDate: -1})
                return posts
            } catch (error) {
                throw new Error(err)
            }
        },
        async getPost(parent, {postId}){
            try{
                const post = await Post.findById(postId)
                if (post) {
                    return post
                }
                else {
                    throw new Error('Post not found')
                }
            } catch (err){
                throw new Error(err)
            }
        }
    },
    Mutation :{
        async createPost(parent, {body}, context) {
            const user = checkAuth(context)

            if (body.trim() ==='') {
                throw new Error('Post must not be empty')
            }

            const newPost = new Post({
                body,
                user: user.indexOf,
                username: user.username,
                createdDate: new Date().toISOString()
            })

            const post = await newPost.save()

            context.pubsub.publish('NEW_POST', {
                newPost: post
            })
            return post
        },

        async deletePost(parent, {postId}, context) {
            const user= checkAuth(context)

            try {
                const post = await Post.findById(postId)
                if (user.username === post.username) {
                    await post.delete()
                    return 'Post deleted successfully'
                }
                else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async likePost(parent, {postId}, context) {
            const user = checkAuth(context)
            const post = await Post.findById(postId)

            if (post) {
                const likedUser = post.likes.find(like => like.username === user.username)
                if (likedUser) {
                    post.likes = post.likes.filter(like => like.username !== user.username)
                } else {
                    post.likes.unshift({
                        username: user.username,
                        createdDate: new Date().toISOString()
                    })
                }
                await post.save()
                return post
            } else {
                throw new UserInputError('Post not found', {
                    error: {
                        postId: 'postId not found'
                    }
                })
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (parent, args, {pubsub}) => pubsub.asyncIterator(['NEW_POST'])
        }
    }
}