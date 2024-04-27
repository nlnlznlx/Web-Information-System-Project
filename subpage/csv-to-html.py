import pandas as pd
from io import StringIO
import os

# Load CSV data into a DataFrame
csv_data = "/subpage/updated1.csv"
df = pd.read_csv(pd.compat.StringIO(csv_data))

# Group books by address
grouped_by_address = df.groupby("Address of the Book Box")

# Function to create an HTML page for each address
def create_html_page(address, books):
    html_content = f"<html><head><title>Books at {address}</title></head><body>"

    # Include a representative image for each address at the top of the page
    image_link = books["Image Link"].iloc[0]
    html_content += f"<img src='{image_link}' alt='{address}' style='width:100%;height:auto;'>"
    
    html_content += f"<h1>Books at {address}</h1><ul>"
    
    # Create list items with clickable links and image references
    for _, book in books.iterrows():
        title = book["Title of the Book"]
        book_url = book["Book URL"]
        image_link = book["Image Link"]

        # Create the book link with a title
        if book_url == "No link found":
            # If no link, just display the title
            book_entry = f"<strong>{title}</strong>"
        else:
            # If a valid URL, create a link
            book_entry = f"<a href='{book_url}'>{title}</a>"

        html_content += f"<li>{book_entry}</li>"
    
    html_content += "</ul></body></html>"
    
    return html_content

# Directory to save the HTML files
output_dir = "/subpage/"

# Create the output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Create and save HTML pages for each unique address
file_paths = []
for address, data in grouped_by_address:
    html_content = create_html_page(address, data)
    
    # Sanitize the file name to remove special characters and spaces
    file_name = address + ".html"
    file_path = os.path.join(output_dir, file_name)
    
    # Write the HTML content to a file
    with open(file_path, 'w') as html_file:
        html_file.write(html_content)
    
    # Store the path of the file created
    file_paths.append(file_path)

file_paths  # Return the list of file paths to verify the created HTML files
