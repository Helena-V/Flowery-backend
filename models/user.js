const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    passwordHash: String,
    stores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    }],
    photos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.passwordHash
    }
})

module.exports = mongoose.model('User', userSchema)