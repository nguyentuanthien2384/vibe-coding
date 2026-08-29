const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const morgan = require("morgan")
const connectDB = require("./connection/database")

dotenv.config({ path: ".env" })

const app = express()
app.use(morgan("tiny"))
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const PORT = process.env.PORT || 3000

app.get("/",(req,res)=>{
    res.status(200).json({
        status: 200,
        message: "API for the e-commerce store.",
        api: `http://localhost:${PORT}/products`
    })
})

app.use("/", require("./routes/products"))

const start = async() => {
    await connectDB()
    app.listen(PORT, () =>{
        console.log(`server started on port http://localhost:${PORT}`)
    })
}

start()