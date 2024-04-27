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
document.addEventListener('DOMContentLoaded', async (event) => {
    const params = new URLSearchParams(window.location.search);
    const searchType = params.get('type');
    const searchQuery = params.get('query');

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
    const bookBox = document.getElementById('addBookBox').value;
    const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua'); // Replace with your actual API key

    // Prepare the document to send
    const bookData = {
        "Title of the Book": title,
        "Address of the Book Box": bookBox
    };

    // Collect authors from the form
    const authors = [];
    for (let i = 1; i <= 7; i++) { // Assuming you have up to 7 author inputs
        const authorInput = document.getElementById(`addAuthor${i}`);
        if (authorInput && authorInput.value.trim() !== "") {
            authors.push(authorInput.value);
        }
    }

    // Map each author to the correct property in bookData
    authors.forEach((author, index) => {
        switch (index) {
            case 0:
                bookData["Name of the First Author or Publisher"] = author;
                break;
            case 1:
                bookData["Name of the Second Author (optional)"] = author;
                break;
            case 2:
                bookData["Name of the Third Author (optional)"] = author;
                break;
            case 3:
                bookData["Name of the Fourth Author (optional)"] = author;
                break;
            case 4:
                bookData["Name of the Fifth Author (optional)"] = author;
                break;
            case 5:
                bookData["Name of the Sixth Author (optional)"] = author;
                break;
            case 6:
                bookData["Name of the Seventh Author (optional)"] = author;
                break;
            default:
                // Handle unexpected cases
                break;
        }
    });


    await performApiRequest(token, 'POST', 'action/insertOne', {
        dataSource: 'book-box',
        database: 'books',
        collection: 'book entries',
        document: bookData  // Changed to use 'bookData'
    });
    alert('Book added successfully!');
});


async function deleteBook(title, author, bookBox) {
    const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua'); // Ensure to replace with your actual API key
    const filter = {
        "Title of the Book": title,
        "Name of the First Author or Publisher": author,
        "Address of the Book Box": bookBox
    };
    const response = await performApiRequest(token, 'POST', 'action/deleteOne', {
        dataSource: 'book-box',
        database: 'books',
        collection: 'book entries',
        filter: filter
    });
    if (response.deletedCount === 1) {
        alert('Book retrieved and deleted successfully!');
        document.getElementById('searchForm').submit(); // Refresh the search results to reflect the deletion
    } else {
        alert('Failed to delete the book. Please ensure the details are correct and try again.');
    }
}

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

        const getButton = document.createElement('button');
        getButton.textContent = 'get the book';
        getButton.onclick = () => deleteBook(book['Title of the Book'], book['Name of the First Author or Publisher'], book['Address of the Book Box']);
        li.appendChild(getButton);

        searchResults.appendChild(li);
    });
}