import pandas as pd
from io import StringIO
import os

# Load CSV data into a DataFrame
csv_data = "/subpage/updated1.csv"  # Replace with your actual CSV file path
df = pd.read_csv(csv_data)

# Group books by address
grouped_by_address = df.groupby("Address of the Book Box")

# HTML template to use for generating pages
html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Book Box {{ address }}</title>
    <link rel="stylesheet" href="style2.css">
    <link rel="stylesheet" 
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
          integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
          crossorigin="anonymous">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="anonymous"></script>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="#">LOGO</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item active">
                    <a class="nav-link" href="index.html">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="map.html">Map</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="books.html">Book Boxes</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="about.html">About Us</a>
                </li>
            </ul>
        </div>
    </nav>
    
    <header>
        <h1>Book Box {{ address }}</h1>
    </header>

    <div class="container">
        <div class="book-box-image">
            <img src="{{ image_link }}" alt="Book Box {{ address }}">
        </div>

        <div class="book-list">
            <ul>
                {{ book_list }}
            </ul>
        </div>

        <div id="bookBoxMap" class="book-box-map">
            <!-- Leaflet Map -->
        </div>
    </div>

    <footer class="container-fluid text-center">
        <p>&copy; 2024 Book Exchange</p>
    </footer>

    <script>
        var map = L.map('bookBoxMap').setView([{{ latitude }}, {{ longitude }}], 14);
        L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=Elai0T56rsYOsxHkJPwp',
            {attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'}).addTo(map);
        L.marker([{{ latitude }}, {{ longitude }}]).addTo(map).bindPopup('{{ address }}');
    </script>
</body>
</html>
"""

# Function to create an HTML page for each address with the provided template
def create_html_page(address, latitude, longitude, books):
    # Get the representative image link
    image_link = books["Image Link"].iloc[0]

    # Create the list of book titles with links and authors
    book_list = ""
    for _, book in books.iterrows():
        title = book["Title of the Book"]
        book_url = book["Book URL"]
        author = book["Name of the First Author or Publisher"]

        # Create the book entry with a link if valid
        if book_url == "No link found":
            book_entry = f"<li><strong>{title}</strong> by {author}</li>"
        else:
            book_entry = f"<li><a href='{book_url}'>{title}</a> by {author}</li>"

        book_list += book_entry

    # Replace placeholders in the template with actual data
    html_content = html_template.replace("{{ address }}", address)
    html_content = html_content.replace("{{ latitude }}", str(latitude))
    
    html_content = html_template.replace("{{ longitude }}", str(longitude))
    html_content = html_template.replace("{{ image_link }}", image_link)
    html_content = html_template.replace("{{ book_list }}", book_list)
    
    return html_content

# Create the output directory if it doesn't exist
output_dir = "/subpage/"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Create and save HTML pages for each unique address
file_paths = []
for address, data in grouped_by_address:
    # Get the latitude and longitude for the map
    latitude = data["Latitude"].iloc[0]
    longitude = data["Longitude"].iloc[0]

    # Generate the HTML content with the provided template
    html_content = create_html_page(address, latitude, longitude, data)
    
    
    file_name = address + ".html"
    file_path = os.path.join(output_dir, file_name)
    
    # Write the HTML content to a file
    with open(file_path, 'w', encoding='utf-8') as html_file:
        html_file.write(html_content)
    
    # Store the path of the file created
    file_paths.append(file_path)

file_paths  # Return the list of file paths to verify the created HTML files
