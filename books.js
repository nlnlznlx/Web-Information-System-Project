
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
            'Content-Type': 'application/ejson',
            'Accept':'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error('Failed to execute API request');
    }
    response_data = await response.json();
    return response_data
}


// Reference to the image gallery container
const imageGallery = document.getElementById('image-gallery');

// Function to load images from the server and display them
async function loadImages() {
    try {
        const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua');
        const data = await performApiRequest(token, 'POST', 'action/find', {
            dataSource: 'book-box',
            database: 'books',
            collection: 'images',
        });

        const row = document.querySelector('.row'); // Select the row for cards
        row.innerHTML = ''; // Clear existing content

        data.documents.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col card-column mb-4';

            // Create the anchor tag to wrap the card content
            const cardLink = document.createElement('a');
            cardLink.href = `subpage/${encodeURIComponent(item.street_name)}.html`; // Update the path as needed
            cardLink.className = 'card-link-styling'; // Add this class to style the anchor tag

            const card = document.createElement('div');
            card.className = 'card';

            const img = document.createElement('img');
            img.className = 'card-img-top'; // Bootstrap class for card images
            img.src = 'img/' + item.street_name + '.jpg'//item.image_url; // Assume each item has an image_url
            img.alt = `Cover image of ${item.street_name}`;

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            // Create a flex container for the icon and the title
            const titleContainer = document.createElement('div');
            titleContainer.className = 'd-flex align-items-center'; // Bootstrap flexbox classes

            const icon = document.createElement('img');
            icon.className = 'icon mr-2'; // 'mr-2' class adds a margin to the right
            icon.src = "img/location_pin.png";
            icon.alt = `location pin`;

            const title = document.createElement('h8');
            title.className = 'card-title mb-0';
            title.textContent = item.street_name;

            titleContainer.appendChild(icon);
            titleContainer.appendChild(title);

            card.appendChild(img);
            cardBody.appendChild(titleContainer);
            card.appendChild(cardBody);
            cardLink.appendChild(card);
            col.appendChild(cardLink);
            row.appendChild(col);
        });
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}
// Load images when the page loads
window.addEventListener('load', loadImages);