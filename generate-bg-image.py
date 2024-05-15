import os
from PIL import Image, ExifTags

# Path to the folder containing images
folder_path = "img" 

# Get a list of all image file paths in the folder that contain at least one space
image_paths = [os.path.join(folder_path, filename) for filename in os.listdir(folder_path) if ' ' in filename and filename.endswith(('.jpg', '.jpeg', '.png', '.gif'))]

# Function to correct the orientation of an image based on EXIF data
def correct_orientation(img):
    try:
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break
        exif = img._getexif()
        if exif[orientation] == 3:
            img = img.rotate(180, expand=True)
        elif exif[orientation] == 6:
            img = img.rotate(270, expand=True)
        elif exif[orientation] == 8:
            img = img.rotate(90, expand=True)
    except (AttributeError, KeyError, IndexError, TypeError):
        # Cases: image doesn't have getexif, no EXIF data, no orientation tag, etc
        pass
    return img

# Open each image, correct orientation, resize it, and append it to a list
images = []
min_width = min_height = float('inf')
for path in image_paths:
    img = Image.open(path)
    img = correct_orientation(img)
    images.append(img)
    min_width = min(min_width, img.width)
    min_height = min(min_height, img.height)

# Resize images to the smallest dimension found
resized_images = [img.resize((min_width, min_height), Image.LANCZOS) for img in images]

# Calculate the number of rows and columns for the grid layout
num_columns = int(len(resized_images) ** 0.6)
num_rows = (len(resized_images) + num_columns - 1) // num_columns

# Create a new blank image with the calculated dimensions
concatenated_image = Image.new("RGB", (num_columns * min_width, num_rows * min_height))

# Paste each image into the blank image at the appropriate position
for i, img in enumerate(resized_images):
    row = i // num_columns
    col = i % num_columns
    x_offset = col * min_width
    y_offset = row * min_height
    concatenated_image.paste(img, (x_offset, y_offset))

# Save the concatenated image
concatenated_image.save("bg_image.jpg")  # Replace with your desired output file path
