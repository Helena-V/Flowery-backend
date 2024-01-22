const paymentRouter = require('express').Router()
const Customer = require('../models/customer')
const Order = require('../models/order')
const Product = require('../models/product')
const stripe = require('stripe')(process.env.sk_stripe)

const calculateAmount = (items) => {
  const prices = items.map(product => {
    if (product.onSale) {
      const total = product.price - (product.amountOfDiscount * product.price)
      if (product.itemsInCart) {
        return product.itemsInCart * total
      } else {
        return total
      }
    } else {
      if (product.itemsInCart) {
        return product.price * product.itemsInCart
      } else {
        return product.price
      }
    }
  })
  const totalInCents = (prices.reduce((a, b) => a + b, 0)) * 100
  return totalInCents
}

paymentRouter.post("/create-payment-intent", async (request, response) => {
  console.log(request.body)
    const amount = calculateAmount(request.body)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      metadata: { integration_check: 'accept_a_payment' }
    })
    return response.json({
      clientSecret: paymentIntent.client_secret
    })
  })

  paymentRouter.post('/collect-order-details', async (request, response) => {
    console.log(request.body)
    let items = []
    request.body.items.map(product => {
      if (product.itemsInCart) {
        let times = product.itemsInCart
        while (times > 0) {
          items.push(product._id)
          times --
        }
      } else {
        items.push(product._id)
      }
    })
    const newCustomer = new Customer(request.body.customer)
    const savedCustomer = await newCustomer.save()
    console.log('savedCustomer: ', savedCustomer)
    const order = new Order({
      customer: savedCustomer._id,
      products: items
    })
    const savedOrder = await order.save()
    await Customer.findOneAndUpdate({ _id: savedCustomer._id }, { $push: { orders: savedOrder._id }})
    return response.status(200).json({ savedOrder, savedCustomer })
  })

module.exports = paymentRouter