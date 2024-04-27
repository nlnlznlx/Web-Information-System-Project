document.getElementById('addForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('addTitle').value;
    const bookBox = document.getElementById('addBookBox').value;
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
