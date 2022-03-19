const {gql} = require('graphql-tag')

module.exports = gql`
    type Comment{
        id: ID!
        createdDate: String!
        username: String!
        body: String!
    }
    type Like{
        id: ID!
        username: String!
        createdDate: String!
    }
    type Post{
        id: ID!
        body: String!
        username: String!
        createdDate: String!
        comments: [Comment]!
        likes: [Like]!
        likeCount: Int!
        commentCount: Int!
    }
    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        createdDate: String!
    }
    input RegisterInput{
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }
    type Query{
        getPosts: [Post]
        getPost(postId: ID!): Post
    }
    type Mutation{
        register(registerInput: RegisterInput): User!
        login(username: String, password: String): User!
        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        createComment(postId: ID!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
    }
    type Subscription{
        newPost: Post
    }
`