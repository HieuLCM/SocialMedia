const jwt = require('jsonwebtoken')
const {SECRET_KEY} = require('../config')
const {AuthenticationError} = require('apollo-server')

module.exports = (context) => {
    // context.req = { ... headers}
    const authHeader = context.req.headers.authorization;
    if (authHeader) {
        // Bearer ...
        const token = authHeader.split('Bearer ')[1]
        if (token) {
            try {
                const user = jwt.verify(token, SECRET_KEY)
                return user
            } catch(err) {
                throw new AuthenticationError('Invalid/Expired token')
            }
        }
        throw new Error('Authetication token must be \'Bearer [token]')
    }
    throw new Error('Autherization header must be provided')
}