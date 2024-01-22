const mongoose = require('mongoose')

const instructionSchema = mongoose.Schema({
    name: String,
    light: String,
    watering: String,
    description: String
})

module.exports = mongoose.model('Instructions', instructionSchema)