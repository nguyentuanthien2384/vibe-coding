const Product = require("../models/Product")

exports.getProducts = async(req, res) => {
    try {
        const { page = 1, limit = 20, category } = req.query
        const filter = {}
        if (category) filter.category = { $regex: new RegExp(category, "i") }

        const skip = (Number(page) - 1) * Number(limit)
        const [items, total] = await Promise.all([
            Product.find(filter).skip(skip).limit(Number(limit)),
            Product.countDocuments(filter),
        ])

        return res.status(200).json({
            status: 200,
            data: items,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        })
    } catch(error) {
        console.error(error.message)
        return res.status(500).json({ status: 500, message: "Server error" })
    }
}

exports.getProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ status: 404, message: "Product not found" })
        return res.status(200).json({ status: 200, data: product })
    } catch(error) {
        console.error(error.message)
        return res.status(500).json({ status: 500, message: "Server error" })
    }
}