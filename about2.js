const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser')
const multer = require('multer') // v1.0.5
const upload = multer() // for parsing multipart/form-data

const app = express();
const port = 3001;

const uri = 'mongodb+srv://yiyaojin:jinyiyao1996@book-box.wwzodjl.mongodb.net/?retryWrites=true&w=majority&appName=book-box';
const client = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB', err);
    }
}
connectToMongoDB();

// Enable CORS manually
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/contact', upload.none(), async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Insert contact data into MongoDB
        await contacts.insertOne({ name, email, message });
        
        res.status(201).send('Thank you for sending your question(s)');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});