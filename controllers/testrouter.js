const testRouter = require('express').Router()
const User = require('../models/user')
const Store = require('../models/store')
const Product = require('../models/product')
const Customer = require('../models/customer')
const Image = require('../models/image')
const Order = require('../models/order')

testRouter.post('/reset', async (request, response) => {
    await User.deleteMany({})
    await Store.deleteMany({})
    await Product.deleteMany({})
    await Customer.deleteMany({})
    await Image.deleteMany({})
    await Order.deleteMany({})
    response.status(204).end()
})

module.exports = testRouter