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

function getAddressFromTitle() {
    const titleText = document.getElementById('bookBox').textContent;
    const addressPattern = /Book Box at (.+)/;
    const match = addressPattern.exec(titleText);
    return match ? match[1] : null; // This will extract "Albert Giraudstraat 28" from the title
}

document.getElementById('toggleAddBookForm').addEventListener('click', function() {
    const bookList = document.querySelector('.book-list');
    const addBookFormContainer = document.getElementById('addBookFormContainer');
    const bookBox = getAddressFromTitle();

    if (addBookFormContainer.style.display === 'none') {
        // Hide the book list and show the add book form
        bookList.style.display = 'none';
        addBookFormContainer.style.display = 'block';
        addBookFormContainer.innerHTML = `
            <h2>Add New Book</h2>
            <form id="addForm">
                <label for="addTitle">Title:</label>
                <input type="text" id="addTitle" name="title" required><br>
                <label for="addAuthor1">Author 1 (Primary):</label>
                <input type="text" id="addAuthor1" name="author1"><br>
                <label for="addAuthor2">Author 2 (Optional):</label>
                <input type="text" id="addAuthor2" name="author2"><br>
                <label for="addAuthor3">Author 3 (Optional):</label>
                <input type="text" id="addAuthor3" name="author3"><br>
                <label for="addAuthor4">Author 4 (Optional):</label>
                <input type="text" id="addAuthor4" name="author4"><br>
                <label for="addAuthor5">Author 5 (Optional):</label>
                <input type="text" id="addAuthor5" name="author5"><br>
                <label for="addAuthor6">Author 6 (Optional):</label>
                <input type="text" id="addAuthor6" name="author6"><br>
                <label for="addAuthor7">Author 7 (Optional):</label>
                <input type="text" id="addAuthor7" name="author7"><br>

                <button class="btn btn-success" type="submit">Submit</button>
                <button class="btn btn-secondary" type="button" id="cancelAddBook">Cancel</button>
            </form>
        `;


        // Add form submission handler here, similar to your existing form handler
        document.getElementById('addForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const title = document.getElementById('addTitle').value;

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
            document.getElementById('addForm').reset();

            // Hide the Add Book form and show the book list
            const addBookFormContainer = document.getElementById('addBookFormContainer');
            const bookList = document.querySelector('.book-list');
            addBookFormContainer.style.display = 'none';
            bookList.style.display = 'block';
        });

        // Handle the cancel button click
        document.getElementById('cancelAddBook').addEventListener('click', function() {
            // Clear the form HTML and hide it
            addBookFormContainer.innerHTML = '';
            addBookFormContainer.style.display = 'none';

            // Show the book list again
            bookListDiv.style.display = 'block';
        });

    } else {
        // Hide the add book form and show the book list
        addBookFormContainer.style.display = 'none';
        bookList.style.display = 'block';
    }
});

// Listen for cancellation of the add book process
document.addEventListener('click', function(event) {
    if (event.target.id === 'cancelAddBook') {
        const addBookFormContainer = document.getElementById('addBookFormContainer');
        const bookList = document.querySelector('.book-list');
        // Hide the add book form and show the book list
        addBookFormContainer.style.display = 'none';
        bookList.style.display = 'block';
    }
});
