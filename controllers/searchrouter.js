const searchRouter = require('express').Router()
const Product = require('../models/product')
const Image = require('../models/image')
const Store = require('../models/store')

searchRouter.post('/products', async (request, response) => {
    const word = request.body.word
    try {
        const products = await Product.find({ $text: { $search: word } }).populate('image').populate('store')
        console.log(products)
        if (products.length < 1) {
            return response.status(404).json({ error: 'no matching results found' })
        }
        return response.status(200).json(products)
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})


searchRouter.post('/stores', async (request, response) => {
    const word = request.body.word
    try {
        const stores = await Store.find({ $text: { $search: word } }).populate('image').populate('products')
        console.log(stores)
        if (stores.length < 1) {
            return response.status(404).json({ error: 'no matching results found' })
        }
        return response.status(200).json(stores)
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})

searchRouter.post('/all', async (request, response) => {
    const word = request.body.word
    try {
        console.log('search all')
        const stores = await Store.find({ $text: { $search: word } }).populate('image')
        const products = await Product.find({ $text: { $search: word } }).populate('image').populate('store')       
        if (stores.length < 1 && products.length < 1) {
            return response.status(404).json({ error: 'no matching results found' })
        }
        return response.status(200).json({ stores, products })
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    } 
})

module.exports = searchRouter