const imageRouter = require('express').Router()
const multer = require('multer')
const mongoose = require('mongoose')
const connection = mongoose.connection
const sharp = require('sharp')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Image = require('../models/image')
const Product = require('../models/product')


const upload = multer()

imageRouter.post('/', upload.single("photo"), async (request, response) => {
    try {
        const decoded = await jwt.verify(request.token, process.env.SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - user not found' })
        }
        const smallThumbnail = await sharp(request.file.buffer)
            .resize(75, 75, {
                fit: 'inside',
            })
            .toBuffer()
        const largeThumbnail = await sharp(request.file.buffer)
            .resize(200, 200)
            .toBuffer()
        const image = new Image({
            imageData: {
                data: request.file.buffer,
                contentType: request.file.mimetype
            },
            thumbnailSmall: smallThumbnail,
            thumbnailLarge: largeThumbnail,
            name: request.body.name,
            description: request.body.description,
            store: null,
            product: null,
            user: request.body.user
        })
        const savedImage = await image.save()
        user.photos = user.photos.concat(savedImage._id)
        await user.save()
        return response.status(201).send()
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})


imageRouter.get('/:id', async (request, response) => {
    const file = await Image.findById(request.params.id)
    if (!file) {
        return response.status(404).json({ error: 'no files found' })
    }
    return response.status(200).json(file)
})


imageRouter.get('/user/:id', async (request, response) => {
    const images = await Image.find({ user: request.params.id })
    if (images.length === 0) {
        return response.status(404).json({ error: 'no files found' })
    }
    return response.status(200).json(images)
})

imageRouter.delete('/:id', async (request, response) => {
    try {
        const decoded = await jwt.verify(request.token, process.env.SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized - user not found' })
        }
        await Image.findOneAndDelete({ _id: request.params.id })
        await Product.updateMany({ image: request.params.id }, { image: null })
        await User.updateOne({ _id: user._id }, { $pull: { photos: request.params.id } })
        return response.status(200).send()
    } catch (error) {
        console.log(error.message)
        return response.status(400).json({ error: error.message })
    }
})


module.exports = imageRouter