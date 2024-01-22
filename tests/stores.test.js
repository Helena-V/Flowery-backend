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

beforeAll( async () => {
    await User.deleteMany({})
    await Store.deleteMany({})
    await Product.deleteMany({})
    await api.post('/api/users').send({
        username: 'maija',
        name: 'Maija Meikäläinen',
        password: 'tosisalainen',
    })
    const loginResponse = await api.post('/api/login').send({
        username: 'maija',
        password: 'tosisalainen'
    })
    token = loginResponse.body.token
    user = loginResponse.body.user  
})


describe('Handling a new store', () => {

    test('should be able to create a new store', async () => {
        const response = await api.post('/api/stores')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                name: 'Maijan kukka',
                location: 'Helsinki'
            })
            .expect(201)
        expect(response.body.name).toEqual('Maijan kukka')
        store = await Store.findOne({ _id: response.body._id })
        expect(store).toBeDefined()
        expect(store).not.toBeNull()
    })

    test('should be able to add a product to the store created', async () => {
        const response = await api.post('/api/products')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                name: 'tulppaani',
                price: 7.90,
                amountOfItems: 30,
                store: store._id
            })
            .expect(201)
        expect(response.body.products.length).toEqual(1)
        const product = await Product.findOne({ _id: response.body.products[0] })
        expect(product).toBeDefined()         
    })

    test('should be able to find all the stores added by the user', async () => {
        const response = await api.get(`/api/users/${user._id}/stores`)
             .expect(200)
        expect(response.body[0].name).toEqual('Maijan kukka')
        expect(response.body.length).toEqual(1)
    })

    test('should be able to find all the products added to a store', async () => {
        const response = await api.get(`/api/stores/${store._id}/products`)
            .expect(200)
        expect(response.body[0].name).toEqual('tulppaani')
        expect(response.body.length).toEqual(1)
    })

    test('should not be able to delete the store without authorization', async () => {
        const response = await api.delete(`/api/stores/${store._id}`)
            .expect(400)
        const storeInDb = Store.findById(store._id)
        expect(storeInDb).toBeDefined()
    })

    test('should be able to delete the store created', async () => {
        const response = await api.delete(`/api/stores/${store._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .expect(200)
        const userFound = User.findById(user._id)
        expect(userFound.stores).toBeUndefined()
    })

})

afterAll(async () => {
    await mongoose.connection.close()
    await server.close()
})