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

    const data = await performApiRequest(token, 'POST', 'action/find', {
        dataSource: 'book-box',
        database: 'books',
        collection: 'books_csv',
        filter: filter
    });

    displaySearchResults(data.documents);
});

function displaySearchResults(data) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    data.forEach(book => {
        const li = document.createElement('li');
        const title = document.createElement('a');
        title.href = `${book['Book URL']}`
        title.innerText = `Title: ${book['Title of the Book']}`;
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
        getButton.textContent = 'remove';
        getButton.onclick = () => deleteBook(book['Title of the Book'], book['Name of the First Author or Publisher'], book['Address of the Book Box']);
        li.appendChild(getButton);

        searchResults.appendChild(li);
    });
}
