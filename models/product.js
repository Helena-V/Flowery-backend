const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type: String,
        text: true
    },
    description: {
        type: String,
        text: true
    },
    keyWords: {
        type: String,
        text: true
    },
    price: Number,
    onSale: Boolean,
    amountOfDiscount: Number,
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    },
    amountOfItems: Number,
    instructions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructions'
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }
})

module.exports = mongoose.model('Product', productSchema)