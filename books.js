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

app.get('/images', async (req, res) => {
    try {
        // Retrieve all image documents from the collection
        const images = await imagesCollection.find().toArray();
        
        // Extract URLs from the retrieved documents
        const urls = images.map(image => image.url);
        
        // Respond with the list of URLs
        res.json(urls);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

fetch('/images')
    .then(response => response.json())
    .then(urls => {
        // Display images on the page using the retrieved URLs
        const imageContainer = document.getElementById('image-container');
        urls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            imageContainer.appendChild(img);
        });
    })
    .catch(error => console.error('Error fetching image URLs:', error))