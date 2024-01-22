const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../index')
const User = require('../models/user')
const Store = require('../models/store')
const Product = require('../models/product')
const server = require('../index')

const api = supertest(app)
let token = null
let store = null
let user = null
let product = null

beforeAll( async () => {
    await User.deleteMany({})
    await Store.deleteMany({})
    await Product.deleteMany({})
    await api.post('/api/users').send({
        username: 'maija',
        name: 'Maija Meikäläinen',
        password: 'tosisalainen'
    })
    const loginResponse = await api.post('/api/login').send({
        username: 'maija',
        password: 'tosisalainen'
    })
    token = loginResponse.body.token
    user = loginResponse.body.user
    const createStoreResponse = await api.post('/api/stores')        
        .set({ Authorization: `Bearer ${token}` })
        .send({
            name: 'Maijan kukka',
            location: 'Helsinki'
        })
    store = createStoreResponse.body
})

describe('Handling products while logged in', () => {

    test('should be able to create a new product', async () => {
        const response = await api.post('/api/products')
        .set({ Authorization: `Bearer ${token}`})
        .send({
            name: 'ruusu',
            price: 4.50,
            amountOfItems: 50,
            store: store._id
        })
        .expect(201)
        product = await Product.findOne({ _id: response.body.products[0] })
        expect(product).toBeDefined()
        expect(product).not.toBeNull()
        expect(product.name).toEqual('ruusu')
        expect(product.price).toEqual(4.50)
        expect(product.amountOfItems).toEqual(50)

    })

    test('should be able to find products with a product id', async() => {
        const response = await api.get(`/api/products/${product._id}`)
            .expect(200)
        expect(response.body).toBeDefined()
        expect(response.body.name).toEqual('ruusu')
        expect(response.body.price).toEqual(4.50)
        expect(response.body.store).toEqual(store._id)
    })

    test('should not find anything with wrong id', async() => {
        const id = new mongoose.Types.ObjectId()
        const response = await api.get(`/api/products/${id}`)
            .expect(404)
    })

    test('should be able to delete the product created', async () => {
        const response = await api.delete(`/api/products/${product._id}`)
            .set({ Authorization: `Bearer ${token}`})
            .expect(200)
    })

})

afterAll(async() => {
    await mongoose.connection.close()
    await server.close()
})