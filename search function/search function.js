// Fetch bearer token using MongoDB API key
async function fetchBearerToken(apiKey) {
    const url = 'https://services.cloud.mongodb.com/api/client/v2.0/app/data-mqtzj/auth/providers/api-key/login';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: apiKey
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bearer token');
        }

        const responseData = await response.json();
        return responseData.access_token;
    } catch (error) {
        console.error('Error fetching bearer token:', error);
        throw error;
    }
}

// General function to interact with the MongoDB Data API
async function performApiRequest(token, method, path, body) {
    const url = `https://data.mongodb-api.com/app/data-mqtzj/endpoint/data/v1/${path}`;
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error('Failed to execute API request');
    }
    return await response.json();
}

// Handlers for search, add, and delete operations
document.getElementById('searchForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const searchQuery = document.getElementById('searchQuery').value;
    const searchType = document.getElementById('searchType').value;
    const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua'); // Ensure to replace with actual API key

    let filter = {};
    if (searchType === "title") {
        filter = { "Title of the Book": { "$regex": searchQuery, "$options": "i" } };
    } else if (searchType === "author") {
        filter = filter = {
            $or: [
                {"Name of the First Author or Publisher": {"$regex": searchQuery, "$options": "i"}},
                {"Name of the Second Author (optional)": {"$regex": searchQuery, "$options": "i"}},
                {"Name of the Third Author (optional)": {"$regex": searchQuery, "$options": "i"}},
                {"Name of the Fourth Author (optional)": {"$regex": searchQuery, "$options": "i"}},
                {"Name of the Fifth Author (optional)": {"$regex": searchQuery, "$options": "i"}},
                {"Name of the Sixth Author (optional)": {"$regex": searchQuery, "$options": "i"}},
                {"Name of the Seventh Author (optional)": {"$regex": searchQuery, "$options": "i"}}
            ]};

    } else if (searchType === "bookBox") {
        filter = { "Address of the Book Box": { "$regex": searchQuery, "$options": "i" } };
    }

    const data = await performApiRequest(token, 'POST', 'action/find', {
        dataSource: 'book-box',
        database: 'books',
        collection: 'book entries',
        filter: filter
    });
    displaySearchResults(data.documents);
});

document.getElementById('addForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('addTitle').value;
    const author = document.getElementById('addAuthor').value;
    const bookBox = document.getElementById('addBookBox').value;
    const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua'); // Replace 'your-api-key-here' with your actual API key
    await performApiRequest(token, 'POST', 'action/insertOne', {
        dataSource: 'book-box',
        database: 'books',
        collection: 'book entries',
        document: { "Title of the Book": title, "Name of the First Author or Publisher": author, "Address of the Book Box": bookBox }
    });
    alert('Book added successfully!');
});

document.getElementById('deleteForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('deleteTitle').value;
    const author = document.getElementById('deleteAuthor').value;
    const bookBox = document.getElementById('deleteBookBox').value;
    const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua'); // Replace 'your-api-key-here' with your actual API key
    await performApiRequest(token, 'POST', 'action/deleteOne', {
        dataSource: 'book-box',
        database: 'books',
        collection: 'book entries',
        filter: { "Title of the Book": title, "Name of the First Author or Publisher": author, "Address of the Book Box": bookBox }
    });
    alert('Book deleted successfully!');
});

function displaySearchResults(data) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    data.forEach(book => {
        const li = document.createElement('li');
        const title = document.createElement('strong');
        title.textContent = `Title: ${book['Title of the Book']}`;
        li.appendChild(title);

        if (book['Name of the First Author or Publisher']) {
            const author1 = document.createElement('p');
            author1.textContent = `First Author or Publisher: ${book['Name of the First Author or Publisher']}`;
            li.appendChild(author1);
        }

        if (book['Name of the Second Author (optional)']) {
            const author2 = document.createElement('p');
            author2.textContent = `Second Author: ${book['Name of the Second Author (optional)']}`;
            li.appendChild(author2);
        }

        if (book['Name of the Third Author (optional)']) {
            const author3 = document.createElement('p');
            author3.textContent = `Third Author: ${book['Name of the Third Author (optional)']}`;
            li.appendChild(author3);
        }

        if (book['Name of the Fourth Author (optional)']) {
            const author4 = document.createElement('p');
            author4.textContent = `Fourth Author: ${book['Name of the Fourth Author (optional)']}`;
            li.appendChild(author4);
        }

        if (book['Name of the Fifth Author (optional)']) {
            const author5 = document.createElement('p');
            author5.textContent = `Fifth Author: ${book['Name of the Fifth Author (optional)']}`;
            li.appendChild(author5);
        }

        if (book['Name of the Sixth Author (optional)']) {
            const author6 = document.createElement('p');
            author6.textContent = `Sixth Author: ${book['Name of the Sixth Author (optional)']}`;
            li.appendChild(author6);
        }

        if (book['Name of the Seventh Author (optional)']) {
            const author7 = document.createElement('p');
            author7.textContent = `Seventh Author: ${book['Name of the Seventh Author (optional)']}`;
            li.appendChild(author7);
        }

        const bookBox = document.createElement('p');
        bookBox.textContent = `Book Box: ${book['Address of the Book Box']}`;
        li.appendChild(bookBox);

        searchResults.appendChild(li);
    });
}