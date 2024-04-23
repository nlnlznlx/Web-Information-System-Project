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

app.post('/threads', upload.none(), async (req, res) => {
    try {
        const { title, content, author } = req.body;

        // Insert a new thread into the threads collection
        await threads.insertOne({ title, content, author, timestamp: new Date() });

        res.status(201).send('Thread posted successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/threads', async (req, res) => {
    try {
        const allThreads = await threads.find().toArray();
        res.json(allThreads);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});