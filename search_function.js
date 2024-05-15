// Constants and Initial State
let currentPage = 1;

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

// Constructs a filter based on search query and type for MongoDB queries
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

// Fetches a book cover image using the Google Books API
async function fetchBookCover(title) {
    const apiKey = 'AIzaSyB7aJsr4Xk4etBAeFrBXirIjTAaimQzhmE';
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const book = data.items[0];  // Taking the first book found
            const coverImageUrl = book.volumeInfo.imageLinks?.thumbnail;  // Using optional chaining in case imageLinks is undefined
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

async function fetchSearchResults(page) {
    // Attempt to get search parameters from the URL
    const params = new URLSearchParams(window.location.search);
    const searchQueryFromParams = params.get('searchQuery');
    const searchTypeFromParams = params.get('searchType');

    let searchQuery, searchType;

    if (searchQueryFromParams && searchTypeFromParams) {
        // If there are URL parameters, use them (coming from index.html)
        searchQuery = searchQueryFromParams;
        searchType = searchTypeFromParams;
    } else {
        // Otherwise, use values from the DOM elements (direct search on search_function.html)
        const searchQueryElement = document.getElementById('searchQuery');
        const searchTypeElement = document.getElementById('searchType');

        if (searchQueryElement && searchTypeElement) {
            searchQuery = searchQueryElement.value;
            searchType = searchTypeElement.value;
        } else {
            console.error('No search parameters or input fields found.');
            return; // Exit function if no inputs are available
        }
    }

    const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua');
    const filter = buildSearchFilter(searchQuery, searchType);
    const totalCount = await fetchTotalCount(token, filter); // Fetch total count
    const resultsPerPage = 10;
    const skip = (page - 1) * resultsPerPage;
    const data = await performApiRequest(token, 'POST', 'action/find', {
        dataSource: 'book-box',
        database: 'books',
        collection: 'book entries',
        filter: filter,
        limit: resultsPerPage,
        skip: skip
    });

    displaySearchResults(data.documents, totalCount);
    const totalPages = Math.ceil(totalCount / resultsPerPage);
    updatePaginationControls(totalPages, currentPage);
}

async function fetchTotalCount(token, filter) {
    const url = `https://data.mongodb-api.com/app/data-mqtzj/endpoint/data/v1/action/aggregate`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "dataSource": "book-box",
            "database": "books",
            "collection": "book entries",
            "pipeline": [
                { "$match": filter },
                { "$group": { "_id": null, "totalCount": { "$sum": 1 } } }
            ]
        })
    });

    const result = await response.json();
    if (response.ok && result.documents && result.documents.length > 0) {
        return result.documents[0].totalCount;
    } else {
        console.error('No results found or bad response:', result);
        return 0;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    if (new URLSearchParams(window.location.search).has('searchQuery')) {
        await fetchSearchResults(1);
    }
});

document.getElementById('searchForm')?.addEventListener('submit', (event) => {
    //event.preventDefault();
    changePage(1); // Always search from the first page
});

// Displays search results on the page
async function displaySearchResults(data, totalCount) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    const booksCount = document.getElementById('books_count');
    let countText = '';
    console.log(totalCount);
    if (totalCount === 0) {
        countText = 'No books found';
    } else if (totalCount === 1) {
        countText = '1 book found';
    } else {
        countText = `${totalCount} books found`;
    }
    booksCount.textContent = countText;

    for (const book of data) {
        const li = document.createElement('li');
        li.classList.add('book-entry');

        const coverImage = document.createElement('img');
        coverImage.alt = "Cover image";
        // Fetch the book cover using the title of the book
        const imageUrl = await fetchBookCover(book['Title of the Book']);
        if (imageUrl && imageUrl.startsWith('http')) {  // Check if the URL is valid
            coverImage.src = imageUrl;
            coverImage.alt = `Cover image of ${book['Title of the Book']}`;
        } else {
            coverImage.alt = 'No cover image available';
            coverImage.style.display = 'none';  // Optionally hide the image element
        }
        li.appendChild(coverImage);

        const bookInfo = document.createElement('div');
        bookInfo.className = 'book-info';

        const title = document.createElement('p');
        title.textContent = `Title: ${book['Title of the Book']}`;
        bookInfo.appendChild(title);

        if (book['Name of the First Author or Publisher']) {
            const author1 = document.createElement('p');
            author1.textContent = `First Author or Publisher: ${book['Name of the First Author or Publisher']}`;
            bookInfo.appendChild(author1);
        }

        if (book['Name of the Second Author (optional)']) {
            const author2 = document.createElement('p');
            author2.textContent = `Second Author: ${book['Name of the Second Author (optional)']}`;
            bookInfo.appendChild(author2);
        }

        if (book['Name of the Third Author (optional)']) {
            const author3 = document.createElement('p');
            author3.textContent = `Third Author: ${book['Name of the Third Author (optional)']}`;
            bookInfo.appendChild(author3);
        }

        if (book['Name of the Fourth Author (optional)']) {
            const author4 = document.createElement('p');
            author4.textContent = `Fourth Author: ${book['Name of the Fourth Author (optional)']}`;
            bookInfo.appendChild(author4);
        }

        if (book['Name of the Fifth Author (optional)']) {
            const author5 = document.createElement('p');
            author5.textContent = `Fifth Author: ${book['Name of the Fifth Author (optional)']}`;
            bookInfo.appendChild(author5);
        }

        if (book['Name of the Sixth Author (optional)']) {
            const author6 = document.createElement('p');
            author6.textContent = `Sixth Author: ${book['Name of the Sixth Author (optional)']}`;
            bookInfo.appendChild(author6);
        }

        if (book['Name of the Seventh Author (optional)']) {
            const author7 = document.createElement('p');
            author7.textContent = `Seventh Author: ${book['Name of the Seventh Author (optional)']}`;
            bookInfo.appendChild(author7);
        }

        const bookBox = document.createElement('p');
        bookBox.textContent = `Book Box: ${book['Address of the Book Box']}`;
        bookInfo.appendChild(bookBox);

        const getButton = document.createElement('button');
        getButton.textContent = 'remove';
        getButton.onclick = () => deleteBook(book['Title of the Book'], book['Name of the First Author or Publisher'], book['Address of the Book Box']);
        bookInfo.appendChild(getButton);

        li.appendChild(bookInfo);
        searchResults.appendChild(li);
    }
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


async function changePage(newPage) {
    currentPage = newPage;
    await fetchSearchResults(currentPage);
}

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