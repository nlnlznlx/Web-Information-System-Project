const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

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
            query["Name of the First Author or Publisher"] = { $regex: author, $options: 'i' };
        }
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
        const database = client.db('books');
        const collection = database.collection('book entries');
        const result = await collection.insertOne(req.body);
        res.status(201).json({ message: 'Book added successfully', id: result.insertedId });
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a book by ID
app.delete('/api/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const database = client.db('books');
        const collection = database.collection('book entries');
        const result = await collection.deleteOne({ _id: ObjectId(id) });
        res.json({ message: `${result.deletedCount} book deleted` });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
