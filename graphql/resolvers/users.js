const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {UserInputError} = require('apollo-server')

const User = require('../../models/User')
const {validateRegisterInput, validateLoginInput} = require('../../util/validators.js')
const {SECRET_KEY} = require('../../config.js')

const generateToken = (res) => jwt.sign({
    id: res.id,
    email: res.email,
    username: res.username
}, SECRET_KEY, {expiresIn: '1h'})

module.exports = {
    Mutation: {
        async login(parent, {username, password}) {
            const {valid, errors} = validateLoginInput(username, password)

            if(!valid) {
                throw new UserInputError('Errors', {errors})
            }

            const user = await User.findOne({username})
            if (!user) {
                errors.general = 'User not found'
                throw new UserInputError('Wrong credentials', {errors})
            }
            
            const match = await bcrypt.compare(password, user.password)

            if (!match) {
                errors.general = 'Wrong credentials'
                throw new UserInputError('Wrong credentials', {errors})
            }

            const token = generateToken(user)

            return {
                ...user._doc,
                token,
                id: user._id
            }
        },


        async register(parent, {registerInput: {username, email, password, confirmPassword}}) {
            // Validate user data
            const {valid, errors} = validateRegisterInput(username, email, password, confirmPassword)

            if (!valid){
                throw new UserInputError('Errors', {errors})
            }
            // Make sure user doesnt exist
            const user = await User.findOne({username})

            if (user) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }
            // Hash password and create an auth token

            password = await bcrypt.hash(password, 12)

            const newUser = new User({
                email,
                username,
                password,
                createdDate: new Date().toISOString()
            })

            const res = await newUser.save()
            
            const token = generateToken(res)

            return {
                ...res._doc,
                id: res._id,
                token,
            }
        }
    }
}