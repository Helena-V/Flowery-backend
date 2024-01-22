const mongoose = require('mongoose')

const storeSchema = mongoose.Schema({
    name: {
        type: String,
        text: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String,
        text: true
    },
    location: String,
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    },
    email: String,
    webpage: String,
    phone: String
})

module.exports = mongoose.model('Store', storeSchema)