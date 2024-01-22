const productRouter = require('express').Router()
const Product = require('../models/product')
const Store = require('../models/store')
const User = require('../models/user')
const Image = require('../models/image')
const jwt = require('jsonwebtoken')


productRouter.post('/', async (request, response) => {
    const productToCreate = request.body
    try {
        const decoded = await jwt.verify(request.token, process.env.SECRET)
        const user = await User.findById(decoded.id)
        const store = await Store.findById(productToCreate.store)
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - wrong credentials' })
        }
        if (!store) {
            return response.status(400).json({ error: 'Store not found' })
        }
        if (!store.owner === user._id) {
            return response.status(401).json({ error: 'Unauthorized - owner does not match'})
        }
        if(!productToCreate.name || !productToCreate.price || !productToCreate.amountOfItems) {
            return response.status(400).json({ error: 'name, price and amount of items are required'})
        }
        const productToSave = await new Product(productToCreate)
        const savedProduct = await productToSave.save()
        const updatedStore = await Store.findOneAndUpdate({ _id: store._id }, { $push: { products: savedProduct._id }}, { new: true })
        return response.status(201).json(updatedStore)
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})


productRouter.get('/', async (request, response) => {
    const products = await Product.find({}).populate('image')
    if (products.length === 0) {
        return response.status(404).json({ error: 'no products found' })
    }
    return response.status(200).json(products.map(product => product.toJSON()))
})


productRouter.get('/:id', async (request, response) => {
    const product = await Product.findOne({ _id: request.params.id }).populate('image')
    if (!product) {
        return response.status(404).json({ error: 'no product found' })
    }
    return response.status(200).json(product)
})


productRouter.put('/:id', async (request, response) => {
    const product = request.body
    try {
        const decoded = await jwt.verify(request.token, process.env.SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - wrong credentials' })
        }
        await Product.updateOne({ _id: request.params.id }, { image: product.image })
        await Image.updateOne({ _id: product.image }, { product: product._id })
        return response.status(201).end() 
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})


productRouter.delete('/:id', async (request, response) => {
    try {
        const decoded = await jwt.verify(request.token, process.env.SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - user not found' })
        }         
        const product = await Product.findOne({ _id: request.params.id }).populate([{ path: 'store', strictPopulate: false }])
        if (!product) {
            return response.status(404).json({ error: 'Product not found' })
        }
        if (!user._id === product.store.owner) {
            return response.status(401).json({ error: 'Unauthorized - user does not own the store'})
        }
        await Store.updateOne({ _id: product.store._id }, { $pull: { products: product._id } })
        await Image.updateOne({ product: product._id }, { product: null })
        await Product.deleteOne({ _id: request.params.id })
        return response.status(200).send()
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }    
})

module.exports = productRouter