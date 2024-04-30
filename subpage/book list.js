async function fetchBearerToken() {
    const apiKey = '87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua';  // Replace with your actual API key
    const url = 'https://services.cloud.mongodb.com/api/client/v2.0/app/data-mqtzj/auth/providers/api-key/login';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: apiKey })
        });
        if (!response.ok) throw new Error('Failed to fetch bearer token');
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error fetching bearer token:', error);
        throw error;
    }
}

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
    if (!response.ok) throw new Error('Failed to execute API request');
    return await response.json();
}

async function fetchBooksForBox(address) {
    const token = await fetchBearerToken();
    const filter = { "Address of the Book Box": address };
    const data = await performApiRequest(token, 'POST', 'action/find', {
        dataSource: 'book-box',
        database: 'books',
        collection: 'book entries',
        filter: filter
    });
    displayBooks(data.documents);
}

function displayBooks(books) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';

    books.forEach(book => {
        const listItem = document.createElement('li');
        const title = document.createElement('strong'); // Create a strong tag for bold text
        title.textContent = book['Title of the Book'];

        listItem.appendChild(title);
        listItem.innerHTML += ` by ${book['Name of the First Author or Publisher'] || 'Unknown Author'}`;
        bookList.appendChild(listItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Assuming the address can be derived from the document title or a hidden field
    const address = document.title.split(' at ')[1];
    fetchBooksForBox(address);
});
