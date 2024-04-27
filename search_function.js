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
    const searchType = params.get('searchType');
    const searchQuery = params.get('searchQuery');

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

function displaySearchResults(data) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    data.forEach(async (book) => {
        const li = document.createElement('li');

        const coverImage = document.createElement('img');
        coverImage.alt = "Loading cover...";
        li.appendChild(coverImage);
        // Fetch the book cover using the title of the book
        const imageUrl = await fetchBookCover(book['Title of the Book']);
        if (imageUrl && imageUrl.startsWith('http')) {  // Check if the URL is valid
            coverImage.src = imageUrl;
            coverImage.alt = `Cover image of ${book['Title of the Book']}`;
        } else {
            coverImage.alt = 'No cover image available';
            coverImage.style.display = 'none';  // Optionally hide the image element
        }

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

async function fetchBookCover(title) {
    const apiKey = 'AIzaSyDoEKU8_2pYMFFNXjSO2mPHmhv3rl-SYQo';
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const book = data.items[0];  // Taking the first book found
            const coverImageUrl = book.volumeInfo.imageLinks?.thumbnail;  // Using optional chaining in case imageLinks is undefined

            console.log(coverImageUrl);  // Log the URL of the book cover image
            return coverImageUrl;  // Return the URL
        } else {
            console.log("No books found with that title.");
            return "No books found";
        }
    } catch (error) {
        console.error("Failed to fetch book cover image:", error);
        return "Error fetching data";
    }
}

