import pandas as pd

# Load CSV data into a DataFrame
csv_data = "/subpage/updated1.csv"
df = pd.read_csv(pd.compat.StringIO(csv_data))

# Group books by address
grouped_by_address = df.groupby("Address of the Book Box")

# Function to create an HTML page for each address
def create_html_page(address, books):
    html_content = f"<html><head><title>Books at {address}</title></head><body>"
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

        # Include the image if it exists
        if image_link != "img/":
            book_entry += f"<br><img src='{image_link}' alt='{title}'>"

        html_content += f"<li>{book_entry}</li>"
    
    html_content += "</ul></body></html>"
    
    return html_content

# Create HTML pages for each unique address
html_pages = {}
for address, data in grouped_by_address:
    html_content = create_html_page(address, data)
    
    # Store the HTML content with the address as the key
    html_pages[address] = html_content

# Display the HTML content for each address
for address, html_content in html_pages.items():
    print(f"HTML content for {address}:")
    print(html_content)
    print()
