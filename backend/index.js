require("dotenv").config(); 
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

//database connection with mongodb

mongoose 
  .connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB Connected");
  }).catch((err) => {
    console.log("MongoDB Error:", err);
  });

app.get("/", (req, res) => {
  res.send("Express App is running");
});

//text image storage engine

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({ storage: storage });

//creating upload Endpoint for images

app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

//schema for creating products

const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

app.post("/addproduct", async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    let id = lastProduct ? lastProduct.id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Add product error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//create api for deleting products

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({
    id: req.body.id,
  });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

//creating api for getting all products

app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products");
  res.send(products);
});

//schema creating for user model

const Users = mongoose.model("Users", {
  name: {
    type: String,
  },

  email: {
    type: String,
    unique: true,
  },

  password: {
    type: String,
  },

  cartData: {
    type: Object,
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

//creating End point registering the user

app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "existing" });
  }

  let cart = {};

  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

//creating endpoint for user login

app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({ success: true, token });
    } else {
      res.json({ success: false, error: "wrong password" });
    }
  } else {
    res.json({ success: false, errors: "wrong email-id" });
  }
});

//creating endpoint for newcollection data

app.get('/newcollections', async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("NewCollections fetched");
  res.send(newcollection);
})

//creating endpoint for popular in women section

app.get('/popularinwomen' , async(req, res)=>{
     let products= await Product.find({category:"women"})
     let popular_in_women=products.slice(0,4);
     console.log("popular in women fetched")
     res.send(popular_in_women);
})

//creating middleware to fetch user

const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({
      error: "Please authenticate using a valid token"
    });
  }

  try {
    const data = jwt.verify(token, 'secret_ecom');
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Please authenticate using a valid token"
    });
  }
};

//creating endpoint for adding products in cart data


app.post('/addtocart',fetchUser, async(req, res)=>{
   console.log("added", req.body.itemId);
    let userData=await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdates({_id:req.user.id}, {cartData:userData.cartData})
    res.send("Added")
})

//creating endpoint to remove product from cartData

app.post('/removefromcart', fetchUser, async(req, res)=>{
  console.log("removed", req.body.itemId);
   let userData=await Users.findOne({_id:req.user.id});
   if( userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId]-=1;
    await Users.findOneAndUpdates({_id:req.user.id}, {cartData:userData.cartData})
    res.send("Removed")
})

// creating endpoint to get cartdata

app.post('/getcart', fetchUser , async(req,res)=>{
    console.log("getCart")
    let userData= await Users.findOne({_id:req.user.id})
    res.json(userData.cartData);
})

app.listen(port, () => {
  console.log("Server running on port " + port);
});
