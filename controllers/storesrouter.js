const storesRouter = require('express').Router()
const User = require('../models/user')
const Store = require('../models/store')
const Product = require('../models/product')
const Image = require('../models/image')
const jwt = require('jsonwebtoken')


storesRouter.post('/', async (request, response) => {
    var storeToCreate = request.body
    console.log(storeToCreate)
    try {
        const decoded = await jwt.verify(request.token, process.env.SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - user not found'})
        }
        if (!storeToCreate.name || !storeToCreate.location) {
            return response.status(400).json({error: 'Name and location are required'})
        }
        storeToCreate.owner = user._id
        console.log('owner:', storeToCreate.owner)
        const store = new Store(storeToCreate)
        const storeToAdd = await store.save()
        console.log(storeToAdd)
        await User.findOneAndUpdate({ _id: user._id }, { $push: { stores: storeToAdd._id  } })
        response.status(201).json(storeToAdd).end()
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})


storesRouter.get('/', async (request, response) => {
    const stores = await Store.find({}).populate('image').sort({ _id: -1 }).limit(20)
    return response.status(200).json(stores)
})


storesRouter.get('/:id', async (request, response) => {
    const store = await Store.findOne({ _id: request.params.id }).populate('products').populate('images')
    return response.status(200).json(store)
})


storesRouter.get('/:id/products', async (request, response) => {
    const products = await Product.find({ store: request.params.id }).populate('image')
    return response.status(200).json(products)
})


storesRouter.put('/:id', async (request, response) => {
    const store = request.body
    try {
        const decoded = await jwt.verify(request.token, process.env.SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - wrong credentials' })
        }
        const updatedStore = await Store.findByIdAndUpdate(request.params.id, store)
        return response.status(201).json(updatedStore) 
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})


storesRouter.delete('/:id', async (request, response) => {
    try {
        const decoded = await jwt.verify(request.token, process.env.SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - user not found'})
        }
        const store = await Store.findById(request.params.id)
        if (!store.owner === user._id) {
            return response.status(401).json({ error: 'Unauthorized - not the owner of the store'})
        }
        await Store.deleteOne({ _id: request.params.id })
        await User.findOneAndUpdate({ _id: user._id }, { $pull: { stores: request.params.id } })
        const ids = await Product.find({ store: request.params.id }).select('_id')
        await Product.deleteMany({ _id: { $in: ids } })
        await Image.updateMany({ product: { $in: ids } }, { product: null })
        return response.status(200).send()
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})

module.exports = storesRouter