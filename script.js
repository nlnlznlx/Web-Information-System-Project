// index.html: to search a book, return a book
// Generate Bearer Token for REST API authentication
async function fetchBearerToken(apiKey) {
    const url = 'https://services.cloud.mongodb.com/api/client/v2.0/app/data-mqtzj/auth/providers/api-key/login'; //use your Client App ID e.g. 'data-mqtzj'

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
        //console.log(responseData);
        return responseData.access_token;
    } catch (error) {
        console.error('Error fetching bearer token:', error);
        throw error;
    }
}

// Call API to retrieve data from MongoDB
async function fetchDataWithBearerToken(searchTerm) {
    //const apiKey = 'oB2wTC0KRWMhtHJiPBx7czhDViWrsaWAP3was9D59XpXcmQUUo6TyNgD0CkBJFwA'; // my "book" api key - for test
    const apiKey = '87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua'

    try {
        const bearerToken = await fetchBearerToken(apiKey);

        //const url = 'https://data.mongodb-api.com/app/data-rzcbn/endpoint/data/v1/action/find'; // my url - for test
        const url = 'https://eu-central-1.aws.data.mongodb-api.com/app/data-mqtzj/endpoint/data/v1/action/find';
        const requestData = {
            dataSource: 'book-box',
            database: 'books',
            collection: 'book entries',
            filter: {
                "Title of the Book": { "$regex": "(?i)" + searchTerm }
            },
            sort: { "completedAt": 1 } // 1: ascending order; -1: descending order
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ejson',
                'Accept': 'application/json',
                'Authorization': `Bearer ${bearerToken}` //two-step authentication
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        //console.log(responseData);
        return responseData;
    } catch (error) {
        console.error('Error:', error);
    }
}

// create a dropdown menu of locations for book return
function populateBookBoxSelect() {
    fetch("coordinates.json")
        .then(response=> {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const selectElement = document.querySelector('select[name="bookBoxSelect"]');

            // Sort the data array alphabetically by the 'name' property
            const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

            sortedData.forEach(box => {
                const option = document.createElement('option');
                option.value = box.name; // Use the name as the value to identify the book box
                option.textContent = box.name;
                selectElement.appendChild(option);
            });
        });
}

// This function sets up the form handlers
function setupFormHandlers() {
    const searchForm = document.getElementById('searchForm');
    const returnForm = document.getElementById('returnForm');

    // Handle the search form submission for borrowing books
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const searchInput = document.querySelector('input[name="bookSearch"]').value;
        //const searchInput = document.getElementById('searchInput').value;

        fetchDataWithBearerToken(searchInput).then(data => {
            // Process the response data here
            if (data.documents && data.documents.length > 0) {
                const bookBoxAddress = encodeURIComponent(data.documents[0]["Address of the Book Box"]);
                window.location.href = `/subpage/${bookBoxAddress}.html`; // Redirect to the subpage for the book box
                //window.location.href = `/subpage/template1.html`; //test
            } else {
                // Display a message if the book is not found
                const messageElement = document.getElementById('searchMessage');
                messageElement.style.display = 'block'; // Show the message element
            }
        }).catch(error => {
            console.error('Search failed:', error);
        });
    });

    // Handle the return form submission
    returnForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const selectedBox = returnForm.querySelector('select[name="bookBoxSelect"]').value;
        window.location.href = `/subpage/${encodeURIComponent(selectedBox)}.html`;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    populateBookBoxSelect();
    setupFormHandlers();
});


// forum.html
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Retrieve form data
        const formData = new FormData(form);

        // Construct email message
        const emailMessage = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // You can implement email sending logic here, for demonstration purposes, let's just log the message
        console.log('Email Message:', emailMessage);

        // Clear form fields
        form.reset();
    });
});

