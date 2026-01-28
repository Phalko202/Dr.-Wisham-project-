"""
Icon Generator for Lab Test Extractor Extension
Generates simple placeholder icons in different sizes
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple medical-themed icon"""
    # Create a new image with a gradient-like background
    img = Image.new('RGBA', (size, size), (46, 125, 50, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw a white cross/plus symbol (medical symbol)
    margin = size // 4
    thickness = size // 6
    
    # Horizontal bar
    draw.rectangle(
        [margin, size//2 - thickness//2, size - margin, size//2 + thickness//2],
        fill=(255, 255, 255, 255)
    )
    
    # Vertical bar
    draw.rectangle(
        [size//2 - thickness//2, margin, size//2 + thickness//2, size - margin],
        fill=(255, 255, 255, 255)
    )
    
    # Add a border
    border_width = max(1, size // 32)
    draw.rectangle(
        [0, 0, size-1, size-1],
        outline=(27, 94, 32, 255),
        width=border_width
    )
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    # Create icons directory if it doesn't exist
    icons_dir = 'icons'
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)
    
    # Generate icons in different sizes
    sizes = {
        'icon16.png': 16,
        'icon48.png': 48,
        'icon128.png': 128
    }
    
    for filename, size in sizes.items():
        filepath = os.path.join(icons_dir, filename)
        create_icon(size, filepath)
    
    print("\n✅ All icons generated successfully!")
    print("Icons are located in the 'icons' folder")

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print("⚠️ PIL (Pillow) is not installed.")
        print("Install it using: pip install Pillow")
        print("\nAlternatively, you can:")
        print("1. Use any image editor to create PNG files")
        print("2. Use an online icon generator")
        print("3. Download free medical icons from icon websites")
