const mongoose = require('mongoose')

const customerSchema = mongoose.Schema({
    name: String,
    email: String,
    streetAddress: String,
    city: String,
    state: String,
    country: String,
    postalcode: String,
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]
})

module.exports = mongoose.model('Customer', customerSchema)