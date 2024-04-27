import pandas as pd

# Load CSV data into a DataFrame
csv_data = "/subpage/updated1.csv"
df = pd.read_csv(pd.compat.StringIO(csv_data))

# Group books by address
grouped_by_address = df.groupby("Address of the Book Box")

# Function to create an HTML page for each address
def create_html_page(address, book_titles):
    html_content = f"<html><head><title>Books at {address}</title></head><body>"
    html_content += f"<h1>Books at {address}</h1><ul>"
    
    for title in book_titles:
        html_content += f"<li>{title}</li>"
    
    html_content += "</ul></body></html>"
    
    return html_content

# Create HTML pages for each unique address
html_pages = {}
for address, data in grouped_by_address:
    book_titles = data["Title of the Book"].tolist()
    html_content = create_html_page(address, book_titles)
    
    # Store the HTML content with the address as the key
    html_pages[address] = html_content

# Output the HTML content for each address
for address, html_content in html_pages.items():
    print(f"HTML content for {address}:")
    print(html_content)
    print()
