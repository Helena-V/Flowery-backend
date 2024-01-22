const mongoose = require('mongoose')

const imageSchema = mongoose.Schema({
    imageData: { 
        data: Buffer, 
        contentType: String
    },
    thumbnailSmall: Buffer,
    thumbnailLarge: Buffer,
    name: String,
    description: String,
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Image', imageSchema)