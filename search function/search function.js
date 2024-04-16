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

// Search for books by title, author and book box
app.get('/api/search', async (req, res) => {
    try {
        const { title, author, bookBox } = req.query;
        const database = client.db('books');
        const collection = database.collection('book entries');
        const query = {};
        if (title) {
            query["Title of the Book"] = { $regex: title, $options: 'i' };
        }
        if (author) {
            query["$or"] = [
                { "Name of the First Author or Publisher": { $regex: author, $options: 'i' } },
                { "Name of the Second Author (optional)": { $regex: author, $options: 'i' } },
                { "Name of the Third Author (optional)": { $regex: author, $options: 'i' } },
                { "Name of the Fourth Author (optional)": { $regex: author, $options: 'i' } },
                { "Name of the Fifth Author (optional)": { $regex: author, $options: 'i' } },
                { "Name of the Sixth Author (optional)": { $regex: author, $options: 'i' } },
                { "Name of the Seventh Author (optional)": { $regex: author, $options: 'i' } },
                // Add more fields for additional authors as needed
            ]};
        if (bookBox) {
            query["Address of the Book Box"] = { $regex: bookBox, $options: 'i' };
        }
        const books = await collection.find(query).toArray();
        res.json(books);
    } catch (err) {
        console.error('Error searching for books:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new book
app.post('/api/add', async (req, res) => {
    try {
        const { title, author, bookBox } = req.body; // Extract title, author, and bookBox from req.body
        const database = client.db('books');
        const collection = database.collection('book entries');

        // Define the properties for the new book entry
        const newBook = {
            "Title of the Book": title,
            "Name of the First Author or Publisher": author,
            "Address of the Book Box": bookBox
        };

        // Insert the new book entry into the collection
        const result = await collection.insertOne(newBook);

        // Send a response indicating success
        res.status(201).json({ message: 'Book added successfully', id: result.insertedId });
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a book
app.delete('/api/delete', async (req, res) => {
    try {
        const database = client.db('books');
        const collection = database.collection('book entries');
        console.log('receiving data ...');
        console.log('body is ',req.body);
        const result = await collection.deleteOne(req.body);
        res.status(200).json({ message: 'Book deleted successfully', id: result.deletedId });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
