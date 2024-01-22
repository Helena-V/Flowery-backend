const bcryptjs = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Store = require('../models/store')
const Product = require('../models/product')
const Image = require('../models/image')
const jwt = require('jsonwebtoken')


usersRouter.post('/', async (request, response) => {
    try {
        let salt = bcryptjs.genSaltSync(10)
        let hash = bcryptjs.hashSync(request.body.password)
        const unsavedUser = new User({
            name: request.body.name,
            username: request.body.username,
            passwordHash: hash,
            stores: []
        })
        const user = await unsavedUser.save()
        const forToken = {
            username: user.username,
            id: user._id
        }
        const token = jwt.sign(forToken, process.env.SECRET)
        response.status(201).send({ token, user })
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})


usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('stores')
    response.json(users.map(user => user.toJSON()))
})


usersRouter.get('/:id', async (request, response) => {
    const user = await User.findById(request.params.id).populate('stores')
    response.status(200).send(user)
})


usersRouter.get('/:id/stores', async (request, response) => {
    const stores = await Store.find({ owner: request.params.id })
    response.status(200).send(stores.map(store => store.toJSON()))
})


usersRouter.get('/:id/stores/all', async (request, response) => {
    const userWithStores = await User.findById(request.params.id).populate([{ path: 'stores', strictPopulate: false }])
    const ids = userWithStores.stores.map(store => store._id)
    const storesWithProducts = await Store.find({ _id: { $in: ids } }).populate([{ path: 'products', strictPopulate: false }])
    console.log(storesWithProducts)
    response.status(200).send({ userWithStores, storesWithProducts })
})


usersRouter.delete('/:id', async (request, response) => {
    try {
        const decoded = await jwt.verify(request.token, process.env.SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - user not found' })
        }
        const stores = await Store.find({ owner: request.params.id })
        await Store.deleteMany({ owner: request.params.id })
        stores.forEach( async (storeToFind) => {
            await Product.deleteMany({ store: storeToFind._id})
        })
        await Image.deleteMany({ user: request.params.id })
        await User.deleteOne({ _id: request.params.id })
        return response.status(200).send()
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})

module.exports = usersRouter