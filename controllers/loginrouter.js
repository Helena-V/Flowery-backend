const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    console.log('login')
    let user = null
    try {
        user = await User.findOne({ username: request.body.username }).populate('stores')
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - invalid username or password' })
        }
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
    const isItCorrect = user === null ? false : await bcryptjs.compareSync(request.body.password, user.passwordHash)
    if (!(user && isItCorrect)) {
        return response.status(401).json({ error: 'Unauthorized - invalid username or password' })
    }
    const forToken = {
        username: user.username,
        id: user._id
    }
    const token = jwt.sign(forToken, process.env.SECRET)
    response.status(200).send({ token, user })
})

module.exports = loginRouter