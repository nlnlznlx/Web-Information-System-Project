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

async function postForm(insertObject){
    const token = await fetchBearerToken('87gOLgck9Xw5eDxNMcIYW8zat9sE9nNeS5u2R76hyKZ6YOww8Qf1Jv07POHmc2Ua'); // Ensure to replace with actual API key
    const data = await performApiRequest(token, 'POST', 'action/insertOne', {
                    dataSource: 'book-box',
                    database: 'books',
                    collection: 'contact form',
                    "document": {
                    "name": insertObject.name,
                    "email": insertObject.email,
                    "message" : insertObject.message_body
                    }
    } );
}

console.log('Form Script .....')

// Get search term
let form = document.getElementById("ContactForm");
console.log(form)

form.addEventListener("submit",(e)=>{
    e.preventDefault();

    let insertObject = {
        name : form["name"].value,
        email: form["email"].value,
        message_body : form["message"].value
    }

    console.log(insertObject)
    postForm(insertObject)
    

    form.reset(); // change here to show a message after submission
});