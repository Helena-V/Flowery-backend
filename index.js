const cors = require('cors')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const middleware = require('./utils/middleware')
const config = require('./utils/config')
const usersRouter = require('./controllers/usersrouter')
const loginRouter = require('./controllers/loginrouter')
const storesRouter = require('./controllers/storesrouter')
const productRouter = require('./controllers/productrouter')
const imageRouter = require('./controllers/imagerouter')
const searchRouter = require('./controllers/searchrouter')
const paymentRouter = require('./controllers/paymentrouter')
const testRouter = require('./controllers/testrouter')
const mongoose = require('mongoose')


const createConnection = async () => {
    try {
        const connection = await mongoose.connect(config.MONGODB_URI) 
        console.log('yhdistetty mongoDb:hen')
    } catch (error) {
        console.log('virhe yhdistettäessä: ', error.message)        
    }
}
createConnection()


app.options('*', cors())
app.use(cors())
app.use(bodyParser.json({ limit: '200mb' }))

app.use(middleware.extractToken)

app.get('/', (req, res) => {
    res.send('Hello!')
})

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/stores', storesRouter)
app.use('/api/products', productRouter)
app.use('/api/images', imageRouter)
app.use('/api/search', searchRouter)
app.use('/api/payments', paymentRouter)

if (process.env.NODE_ENV === 'test') {
    app.use('/api/testing', testRouter)
}

const PORT = config.PORT || 3003
const server = app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})

module.exports = server