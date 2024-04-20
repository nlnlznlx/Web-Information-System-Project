// JavaScript to handle the pop-up and initialize the map

document.addEventListener('DOMContentLoaded', function() {
    var bookBoxImage = document.querySelector('.book-box img');
    var popup = document.querySelector('.popup');

    // Initialize the popup with book titles (this part will be dynamic based on your data)
    var bookTitles = ['Book title 1', 'Book title 2', 'Book title 3']; // Example titles
    bookTitles.forEach(function(title) {
        var div = document.createElement('div');
        div.textContent = title;
        popup.appendChild(div);
    });

    // Event listener to show/hide the popup
    bookBoxImage.addEventListener('mouseenter', function() {
        popup.style.display = 'block';
    });
    bookBoxImage.addEventListener('mouseleave', function() {
        popup.style.display = 'none';
    });

    // Initialize the map (use the provided Leaflet code here)
    var map = L.map('bookBoxMap').setView([50.879263, 4.702140], 14);
    // ... rest of your Leaflet map initialization code
});
