const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
    rating:  { type: Number, required: true },
    text:    { type: String, default: "" },
},{_id: false})

const ProductSchema = new mongoose.Schema({
    product:  { type: String, required: true },
    category: { type: String, required: true },
    price:    { type: String, required: true },
    stock:    { type: Number, default: 0 },
    details:  { type: String, default: "" },
    image:    { type: String, default: "" },
    reviews:  { type: [reviewSchema], default: [] },
    avgRating:{ type: Number, default: 0 },
},{ timestamps: true })

module.exports = mongoose.model("Product", ProductSchema)
