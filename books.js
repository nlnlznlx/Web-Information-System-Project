
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
                const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua'); // Ensure to replace with actual API key
                const data = await performApiRequest(token, 'POST', 'action/find', {
                dataSource: 'book-box',
                database: 'books',
                collection: 'images',
                //filter: {street_name : {"$regex": "(?i)" + "Albert Giraudstraat 28"}}  // change here based on interaction
                } );

                // Clear existing images in the gallery
                imageGallery.innerHTML = '';

                // Create and display image elements
                data["documents"].forEach(item => {

                    const card = document.createElement('div');
                    card.classList.add('card');

                    const title = document.createElement('h2');
                    title.textContent = item.street_name;

                    const img = document.createElement('img'); // Create an <img> element
                    img.src = item.image_url; // Set the image source to the URL
                    card.appendChild(title);
                    card.appendChild(img); // Add the image to the gallery
                    imageGallery.appendChild(card);


                    
                });
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        }

        // Load images when the page loads
        window.addEventListener('load', loadImages);