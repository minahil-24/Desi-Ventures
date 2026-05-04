const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const multer = require('multer');
dotenv.config();
const User = require('./models/User');
const app = express();
const uploads = multer({ dest: 'uploads/' }); // Specify the directory to store uploaded files
// Set up session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

// Check file type for multer
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Define the FoodItem schema and model
const foodItemSchema = new mongoose.Schema({
 
    price: Number,
    imagePath: String
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

// Endpoint for uploading image and saving food item
app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        const { name, price } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded!' });
        }

        const newFoodItem = new FoodItem({
            name,
            price,
            imagePath: `/uploads/${req.file.filename}`
        });

        try {
            await newFoodItem.save();
            res.status(200).json({ message: 'File uploaded and path saved!', newFoodItem });
        } catch (error) {
            console.error('Error saving food item:', error);
            res.status(500).json({ error: 'Failed to save item' });
        }
    });
});

app.get('/menu', async (req, res) => {
    try {
        const foodItems = await FoodItem.find();
        res.render('Menu', { foodItems });
    } catch (error) {
        console.log('Error fetching food items:', error);
        res.status(500).send('Error fetching food items');
    }
});

mongoose.connect("mongodb://localhost:27017/Product", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.log('Connection Error:', err);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.set('view engine', 'ejs');

const indexRoutes = require('./routes/index'); 
const authRoutes = require('./routes/auth');
app.use('/', indexRoutes); 
app.use('/auth', authRoutes); 

const CartItemSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number,
    totalAmount: Number,
    date: String
});

const CartItem = mongoose.model('CartItem', CartItemSchema);

const orderSchema = new mongoose.Schema({
    mobile: String,
    fullname: String,
    email: String,
    orderType: String,
    address: String,
    instructions: String,
    tipAmount: Number,
    paymentMethod: String,
    cashChangeRequest: Number,
    totalAmount: Number
});

const Order = mongoose.model('Order', orderSchema);

app.post('/place-order', async (req, res) => {
    const { mobile, fullname, email, address, instructions, tipAmount, paymentMethod, totalAmount } = req.body;

    try {
        const newOrder = new Order({
            mobile,
            fullname,
            email,
            address,
            instructions, 
            tipAmount,
            paymentMethod,
            totalAmount
        });

        await newOrder.save();
        res.json({ message: 'Order placed successfully' });
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

app.get('/home', (req, res) => {
    res.render('Home', { });
});

app.get('/contact', (req, res) => {
    res.render('Contact', { });
});

app.get('/admin', (req, res) => {
    res.render('admin', { });
});

app.get('/placeorder', (req, res) => {
    res.render('checkout', { });
});

app.get('/menu', async (req, res) => {
    try {
        const cartItems = await CartItem.find(); // Retrieve cart items from MongoDB
        const foodItems = await FoodItem.find(); // Retrieve food items from MongoDB

        res.render('Menu', { cartItems, foodItems }); // Pass both cartItems and foodItems to the template
    } catch (error) {
        console.log('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});



app.get("/fetch", (req, res) => {
    try {
        res.render('Contact');
    } catch (error) {
        console.log("Error occurred while fetching:", error);
        res.send("Error occurred while fetching data");
    }
});

app.get("/c", async (req, res) => {
    try {
        res.render('checkout');
    } catch (error) {
        console.log("Error occurred while fetching:", error);
        res.send("Error occurred while fetching data");
    }
});

app.post('/add-to-cart', async (req, res) => {
    const { name, quantity, price, totalAmount, date } = req.body;

    const newCartItem = new CartItem({
        name,
        quantity,
        price,
        totalAmount,
        date   
    });

    try {
        await newCartItem.save();
        res.status(200).json({ message: 'Item added to cart' });
    } catch (error) {
        console.log('Error occurred while adding to cart:', error);
        res.status(500).json({ message: 'Error occurred while adding to cart' });
    }
});

app.get('/admin/cart', async (req, res) => {
    try {
        const cartItems = await CartItem.find();
        const users = await User.find();
        const orders = await Order.find();
        const foodItems = await FoodItem.find();
        console.log(cartItems); 
        console.log(users);   
        console.log(orders); 
        
        res.render('admin', { cartItems, users, orders, foodItems });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

app.delete('/cartitems/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await CartItem.findByIdAndDelete(id);
        console.log('Item deleted from cart');
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item from cart:', error);
        res.status(500).json({ message: 'Error deleting item from cart' });
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

app.get('/get-cart-items', async (req, res) => {
    try {
        const cartItems = await CartItem.find();
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }
});

app.put('/update-cart-item/:id', async (req, res) => {
    const { id } = req.params;
    const { quantity, totalAmount } = req.body;

    try {
        const updatedItem = await CartItem.findByIdAndUpdate(id, { quantity, totalAmount }, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Failed to update cart item' });
    }
});

app.post("/delete/:id", async (req, res) => {
    const id = req.params.id;

    try {
        await CartItem.findByIdAndDelete(id);
        console.log(`Deleted item with ID: ${id}`);
        res.redirect("/admin/cart");
    } catch (error) {
        console.error("Error occurred while deleting:", error);
        res.status(500).send("Error occurred while deleting item.");
    }
});

// Render the update form
// Render the update form
// Handle the update form submission
app.post('/update/:itemId', upload.single('image'), async (req, res) => {
    const { itemId } = req.params;
    const { price } = req.body;
    const image = req.file; // The uploaded file

    try {
        const updatedData = { price };

        if (image) {
            updatedData.imagePath = `/uploads/${image.filename}`;
        }

        // Convert itemId to ObjectId explicitly
        const mongoose = require('mongoose');
        const ObjectId = mongoose.Types.ObjectId;

        const updatedItem = await FoodItem.findByIdAndUpdate(ObjectId(itemId), updatedData, { new: true });

        if (!updatedItem) {
            return res.status(404).send('Item not found');
        }

        res.redirect('/menu'); // Redirect to menu page or wherever appropriate after successful update
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('An error occurred while updating the item');
    }
});

app.put('/update-total-amount', (req, res) => {
    totalAmount = req.body.totalAmount;
    console.log('Total amount updated on server:', totalAmount);
    res.json({ message: 'Total amount updated successfully', totalAmount: totalAmount });
});
