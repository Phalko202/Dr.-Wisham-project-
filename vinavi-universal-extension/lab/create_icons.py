#!/usr/bin/env python3
"""
Create PNG icons for the Chrome extension using PIL
Since SVG to PNG conversion requires system libraries, we'll create the icons directly with PIL
"""

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Installing Pillow...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pillow'])
    from PIL import Image, ImageDraw

def create_lab_icon(size):
    """Create a medical lab icon with test tube and cross"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor for different sizes
    scale = size / 128
    
    # Background gradient (simulated with solid color)
    bg_color = (59, 130, 246, 255)  # Blue #3b82f6
    corner_radius = int(26 * scale)
    
    # Draw rounded rectangle background
    draw.rounded_rectangle(
        [(0, 0), (size, size)],
        radius=corner_radius,
        fill=bg_color
    )
    
    # Test tube
    tube_left = int(50 * scale)
    tube_right = int(78 * scale)
    tube_top = int(30 * scale)
    tube_bottom = int(98 * scale)
    tube_color = (255, 255, 255, 242)  # White with slight transparency
    
    # Test tube body
    draw.rounded_rectangle(
        [(tube_left, tube_top), (tube_right, tube_bottom)],
        radius=int(2 * scale),
        fill=tube_color
    )
    
    # Test tube cap
    cap_top = int(26 * scale)
    cap_height = int(8 * scale)
    draw.rounded_rectangle(
        [(int(48 * scale), cap_top), (int(80 * scale), cap_top + cap_height)],
        radius=int(2 * scale),
        fill=tube_color
    )
    
    # Liquid in tube
    liquid_color = (96, 165, 250, 153)  # Light blue with transparency
    liquid_top = int(70 * scale)
    liquid_bottom = int(94 * scale)
    draw.rounded_rectangle(
        [(int(52 * scale), liquid_top), (int(76 * scale), liquid_bottom)],
        radius=int(2 * scale),
        fill=liquid_color
    )
    
    # Medical cross circle
    cross_center_x = int(88 * scale)
    cross_center_y = int(20 * scale)
    cross_radius = int(13 * scale)
    cross_color = (255, 255, 255, 230)
    
    # Draw cross circle outline
    circle_thickness = max(1, int(2.5 * scale))
    for i in range(circle_thickness):
        draw.ellipse(
            [(cross_center_x - cross_radius + i, cross_center_y - cross_radius + i),
             (cross_center_x + cross_radius - i, cross_center_y + cross_radius - i)],
            outline=cross_color
        )
    
    # Draw cross
    cross_width = int(6 * scale)
    cross_height = int(20 * scale)
    # Vertical bar
    draw.rounded_rectangle(
        [(cross_center_x - cross_width//2, cross_center_y - cross_height//2),
         (cross_center_x + cross_width//2, cross_center_y + cross_height//2)],
        radius=int(1.5 * scale),
        fill=cross_color
    )
    # Horizontal bar
    draw.rounded_rectangle(
        [(cross_center_x - cross_height//2, cross_center_y - cross_width//2),
         (cross_center_x + cross_height//2, cross_center_y + cross_width//2)],
        radius=int(1.5 * scale),
        fill=cross_color
    )
    
    # Measurement marks on test tube
    mark_color = (59, 130, 246, 128)
    mark_positions = [45, 55, 65]
    mark_thickness = max(1, int(1.5 * scale))
    for pos in mark_positions:
        y = int(pos * scale)
        draw.line(
            [(int(52 * scale), y), (int(60 * scale), y)],
            fill=mark_color,
            width=mark_thickness
        )
    
    # Decorative circles at bottom
    accent_color = (255, 255, 255, 38)  # White with low opacity
    accent_radius = int(6 * scale)
    draw.ellipse(
        [(int(32 * scale) - accent_radius, int(100 * scale) - accent_radius),
         (int(32 * scale) + accent_radius, int(100 * scale) + accent_radius)],
        fill=accent_color
    )
    draw.ellipse(
        [(int(96 * scale) - accent_radius, int(100 * scale) - accent_radius),
         (int(96 * scale) + accent_radius, int(100 * scale) + accent_radius)],
        fill=accent_color
    )
    
    return img

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    icons_dir = script_dir / 'icons'
    
    if not icons_dir.exists():
        icons_dir.mkdir(parents=True)
    
    # Create PNG icons in different sizes
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        output_path = icons_dir / f'icon{size}.png'
        try:
            print(f"Creating {size}x{size} icon...")
            img = create_lab_icon(size)
            img.save(output_path, 'PNG', optimize=True)
            print(f"✓ Created {output_path}")
        except Exception as e:
            print(f"Error creating {size}x{size} icon: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n✓ All icons created successfully!")
    print(f"Icons saved to: {icons_dir}")

if __name__ == '__main__':
    main()
