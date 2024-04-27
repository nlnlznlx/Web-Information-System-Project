import pandas as pd
from io import StringIO
import os

# Corrected CSV data with proper handling of embedded delimiters
csv_data = "/subpage/updated1.csv"

# Read the CSV data into a DataFrame
df = pd.read_csv(StringIO(csv_data), quotechar='"', escapechar='\\', delimiter=',')

# Group books by address
grouped_by_address = df.groupby("Address of the Book Box")

# Directory to save the HTML files
output_dir = "/subpage/"

# Create the output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# HTML template with placeholders for address, books, and map data
html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Book Box {{ address }}</title>
    <link rel="stylesheet" href="style2.css">
    <link rel= "stylesheet"
          href= "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
          integrity= "sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
          crossorigin= "anonymous">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Book Box at {{ address }}</h1>
        </header>

        <div class="book-box-image">
            <img src="{{ image_link }}" alt="Book Box {{ address }}">
        </div>

        <div class="book-list">
            <ul>
                {{ book_list }}
            </ul>
        </div>

        <div id="bookBoxMap" class="book-box-map">
            <!-- Leaflet Map will be embedded here -->
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

# Function to create an HTML page for each address
def create_html_page(address, latitude, longitude, books):
    # Get the representative image link
    image_link = books["Image Link"].iloc[0]

    # Create the list of book titles with links and authors
    book_list = ""
    for _, book in books.iterrows():
        title = book["Title of the Book"]
        book_url = book["Book URL"]
        author = book["Name of the First Author or Publisher"]

        # Create the book link with a title
        if book_url == "No link found":
            # If no link, just display the title
            book_entry = f"<li><strong>{title}</strong> by {author}</li>"
        else:
            # If a valid URL, create a link
            book_entry = f"<li><a href='{book_url}'>{title}</a> by {author}</li>"

        book_list += book_entry

    # Replace the placeholders in the template
    html_content = html_template.replace("{{ address }}", address)
    html_content = html_content.replace("{{ image_link }}", image_link)
    html_content = html_content.replace("{{ latitude }}", str(latitude))
    html_content = html_content.replace("{{ longitude }}", str(longitude))
    html_content = html_content.replace("{{ book_list }}", book_list)

    return html_content

# Create and save HTML pages for each unique address
file_paths = []
for address, data in grouped_by_address:
    # Extract the latitude and longitude for the map
    latitude = data["Latitude"].iloc[0]
    longitude = data["Longitude"].iloc[0]

    html_content = create_html_page(address, latitude, longitude, data)

    # Sanitize the file name to remove special characters and spaces
    file_name = address + ".html"
    file_path = os.path.join(output_dir, file_name)
    
    # Write the HTML content to a file
    with open(file_path, 'w') as html_file:
        html_file.write(html_content)
    
    # Store the path of the file created
    file_paths.append(file_path)

file_paths  # Return the list of file paths to verify the created HTML files
