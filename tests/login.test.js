const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../index')
const User = require('../models/user')
const server = require('../index')

const api = supertest(app)

beforeAll( async () => {
    await User.deleteMany({})
})

describe('Creating a user and logging in', () => {

  test('should be able to create a new user', async () => {
    const response = await api.post('/api/users')
      .send({
        username: 'maija',
        name: 'Maija Meikäläinen',
        password: 'tosisalainen',
      }).expect(201)
        .expect('Content-Type', /application\/json/)

    expect(response.body.token.length).toBeTruthy()
    expect(response.body.token.length).toBe(173)
    expect(response.body.user).toBeTruthy()
    expect(response.body.user.name).toEqual('Maija Meikäläinen')
    const user = await User.findOne({ username: 'maija' })
    expect(user).toBeTruthy()
    expect(user.name).toContain('Maija Meikäläinen')
  })

  test('should be able to log in with credentials created', async () => {
        const response = await api.post('/api/login')
                    .send({
                        username: 'maija',
                        password: 'tosisalainen'
                    })
                    .expect(200)
                    .expect('Content-Type', /application\/json/)

        expect(response.body.token.length).toBe(173)
        expect(response.body.user).toBeTruthy()
        expect(response.body.user.name).toEqual('Maija Meikäläinen')
  })

  test('should not be able to log in with wrong credentials', async() => {
    const response = await api.post('/api/login')
                      .send({
                        username: 'maijaliisa',
                        password: 'jotainsalaista'
                      })
                      .expect(401)
      expect(response.body.token).toBeUndefined()
      expect(response.body.user).toBeUndefined()
  })

    test('should be able to delete the account just created', async () => {
        const loginResponse = await api.post('/api/login')
                                        .send({
                                            username: 'maija',
                                            password: 'tosisalainen'
                                        })               
        const response = await api.delete(`/api/users/${loginResponse.body.user._id}`)
                        .set({ Authorization: `Bearer ${loginResponse.body.token}`})
                        .expect(200)
        const newUser = await User.find({ _id: loginResponse.body.user._id})
        expect(newUser[0]).toBeUndefined()
  })

})

afterAll(async () => {
    await mongoose.connection.close()
    await server.close()
})