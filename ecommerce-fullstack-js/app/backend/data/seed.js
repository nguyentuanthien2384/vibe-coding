const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Product = require("../models/Product")

dotenv.config({ path: ".env" })

const products = [
    {
        product: "Lenovo laptop",
        category: "laptops",
        price: "UGX. 970,000",
        stock: 50,
        details: "Lenovo Yoga Slim 7 82A2008VIN AMD Ryzen 7 4800U 14-Inch Full HD Laptop (8GB/512GB SSD/Windows 10).",
        image: "https://kanzucode-iconic.netlify.app//assets/images/lenovo.jpg"
    },
    {
        product: "Xiaomi Redmi Note 11",
        category: "phones",
        price: "UGX. 570,000",
        stock: 150,
        details: "Enjoy technologically advanced features and functions on the Xiaomi Redmi Note 11 4G 64 GB (Horizon Blue, 4 GB RAM).",
        image: "https://kanzucode-iconic.netlify.app//assets/images/redminote.jpg"
    },
    {
        product: "boAt Headphones",
        category: "Headsets",
        price: "UGX. 370,000",
        stock: 450,
        details: "Battery: Rockerz 370 offers a playback time of up to 12 hours. Impedance 32Ω, Sensitivity (dB) 79dB±3DB, Frequency Response 20Hz-20KHz Bluetooth: v5.0 with a range of 10m.",
        image: "https://kanzucode-iconic.netlify.app//assets/images/boat.jpg"
    },
    {
        product: "Samsung Galaxy",
        category: "phones",
        price: "UGX. 870,000",
        stock: 50,
        details: "The mobile comes with a 6.6 inches (16.76 cm) screen that has a resolution of 1080 x 2400 Pixels with a pixel density of 399 ppi.",
        image: "https://kanzucode-iconic.netlify.app//assets/images/galaxy.jpg"
    },
    {
        product: "Acer laptop",
        category: "laptops",
        price: "UGX. 1,670,000",
        stock: 150,
        details: "Acer Aspire 5 A514 UN.HZ6SI.003 Laptop (10th Gen Core I3/4GB RAM/512GB SSD + 32GB Optane Memory/15.6/Integrated Graphics/Windows 10).",
        image: "https://kanzucode-iconic.netlify.app//assets/images/acer.jpg"
    },
    {
        product: "boAt Headsets",
        category: "Headsets",
        price: "UGX. 70,000",
        stock: 20,
        details: "boAt Rockerz 245v2 in Ear Bluetooth Neckband with Upto 8 Hours Playback, 12mm Drivers, IPX5, Magnetic Eartips, Integrated Controls and Lightweight Design(Active Black).",
        image: "https://kanzucode-iconic.netlify.app//assets/images/booat.jpg"
    },
    {
        product: "Nikon D3500 DSLR",
        category: "Cameras",
        price: "UGX. 370,000",
        stock: 80,
        details: "Nikon D3500 DSLR AF-P DX Nikkor 18-55mm F/3.5-5.6G VR And AF-P DX Nikkor 70-300mm F/4.5-6.3G ED (Black).",
        image: "https://kanzucode-iconic.netlify.app//assets/images/nikon.jpg"
    },
    {
        product: "Asus Flip 14",
        category: "laptops",
        price: "UGX. 1,970,000",
        stock: 50,
        details: "Asus Flip 14 TP412FA-EC372TS Laptop Intel Core I3 10th Gen-10110U Intel UHD 4GB 512GB SSD Windows 10 Home Basic.",
        image: "https://kanzucode-iconic.netlify.app//assets/images/asus.jpg"
    },
    {
        product: "Panasonic 296 L",
        category: "Fridges",
        price: "UGX. 2,970,000",
        stock: 10,
        details: "Panasonic presents Panasonic Refrigerator offering a capacity along with defrosting technology in a stunning colour.",
        image: "https://kanzucode-iconic.netlify.app//assets/images/panasonic.jpg"
    },
    {
        product: "Whirlpool 265 L",
        category: "Fridges",
        price: "UGX. 3,970,000",
        stock: 40,
        details: "Whirlpool 265 L Frost Free Double Door 3 Star (2020) Convertible Refrigerator (Magnum Steel, IF INV CNV 278 MAGNUM STEEL (3s)-N).",
        image: "https://kanzucode-iconic.netlify.app//assets/images/Whirlpool.jpg"
    },
    {
        product: "OPPO Mobile",
        category: "phones",
        price: "UGX. 970,000",
        stock: 250,
        details: "Stay ahead of the trend with the OPPO A9 2020 128 GB (Space Purple, 8 GB RAM) that comes with a sleek design and attractive looks.",
        image: "https://kanzucode-iconic.netlify.app//assets/images/oppo.jpg"
    },
    {
        product: "Fujifilm",
        category: "Cameras",
        price: "UGX. 570,000",
        stock: 350,
        details: "Fujifilm X Series X-A7 (XC 15-45mm F/3.5-F/5.6 OIS PZ Kit Lens) Mirrorless Camera.",
        image: "https://kanzucode-iconic.netlify.app//assets/images/pz.jpg"
    }
]

const seed = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected")

        const existing = await Product.countDocuments()
        if (existing > 0) {
            console.log(`Found ${existing} products already in DB. Dropping and re-seeding...`)
            await Product.deleteMany({})
        }

        const inserted = await Product.insertMany(products)
        console.log(`✅ Seeded ${inserted.length} products successfully`)
    } catch(err) {
        console.error("❌ Seed failed:", err.message)
    } finally {
        await mongoose.disconnect()
        console.log("MongoDB disconnected")
    }
}

seed()
