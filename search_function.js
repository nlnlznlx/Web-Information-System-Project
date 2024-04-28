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


function buildSearchFilter(searchQuery, searchType) {
    let filter = {};
    if (searchType === "title") {
        filter = {"Title of the Book": {"$regex": searchQuery, "$options": "i"}};
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
            ]
        };

    } else if (searchType === "bookBox") {
        filter = {"Address of the Book Box": {"$regex": searchQuery, "$options": "i"}};
    }
    return filter;
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
        getButton.textContent = 'remove';
        getButton.onclick = () => deleteBook(book['Title of the Book'], book['Name of the First Author or Publisher'], book['Address of the Book Box']);
        li.appendChild(getButton);

        searchResults.appendChild(li);
    });
}

let currentPage=1
async function changePage(newPage) {
    currentPage = newPage;
    await fetchSearchResults(currentPage);
}

async function fetchSearchResults(page) {
    const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua');
    const searchQuery = document.getElementById('searchQuery').value;
    const searchType = document.getElementById('searchType').value;
    const filter = buildSearchFilter(searchQuery, searchType);
    const resultsPerPage = 10;
    const skip = (page - 1) * resultsPerPage;
    const data = await performApiRequest(token, 'POST', 'action/find', {
        dataSource: 'book-box', // Replace with your dataSource
        database: 'books',
        collection: 'book entries',
        filter: filter,
        limit: resultsPerPage,
        skip: skip
    });

    displaySearchResults(data.documents);
    const totalPages = Math.ceil(data.totalCount / resultsPerPage);
    updatePaginationControls(totalPages, currentPage);
}

// Function to update pagination controls
function updatePaginationControls(totalPages, currentPage) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = ''; // Clear existing pagination controls

    // Previous Button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.innerText = 'Previous';
    prevLink.onclick = () => changePage(currentPage - 1);
    prevLi.appendChild(prevLink);
    paginationDiv.appendChild(prevLi);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.innerText = i;
        pageLink.onclick = (e) => {
            e.preventDefault();
            changePage(i);
        };
        pageLi.appendChild(pageLink);
        paginationDiv.appendChild(pageLi);
    }

    // Next Button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.innerText = 'Next';
    nextLink.onclick = () => changePage(currentPage + 1);
    nextLi.appendChild(nextLink);
    paginationDiv.appendChild(nextLi);
}

// Event listener for the search form
document.getElementById('searchForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission
    changePage(1); // Always search from the first page
});

// Load initial search results
document.addEventListener('DOMContentLoaded', () => {
    fetchSearchResults(currentPage);
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