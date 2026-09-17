import re
import sys
import os
import pathlib
from playwright.sync_api import sync_playwright

def export_svg(html_path: pathlib.Path, svg_path: pathlib.Path):
    content = html_path.read_text(encoding="utf-8")
    match = re.search(r"(<svg\b[^>]*>.*?</svg>)", content, re.DOTALL)
    if not match:
        raise ValueError(f"No <svg> block found in {html_path}")
    
    svg_str = match.group(1)
    
    # 1. Ensure xmlns
    if 'xmlns="http://www.w3.org/2000/svg"' not in svg_str:
        svg_str = re.sub(r"<svg\b", '<svg xmlns="http://www.w3.org/2000/svg"', svg_str, count=1)
        
    # 2. Check viewBox
    if "viewBox=" not in svg_str:
        print(f"Warning: No viewBox in {html_path}")
        
    # 3. Ensure fonts @import in defs with &amp;
    font_import = "@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&amp;family=Geist:wght@400;500;600&amp;family=Geist+Mono:wght@400;500;600&amp;family=Prompt:wght@300;400;500;600&amp;display=swap');"
    
    if "<defs>" in svg_str:
        if font_import not in svg_str:
            svg_str = svg_str.replace("<defs>", f"<defs>\n    <style>{font_import}</style>")
    else:
        first_child_match = re.search(r"(<svg\b[^>]*>(\s*<title\b[^>]*>.*?</title>)?(\s*<desc\b[^>]*>.*?</desc>)?)", svg_str, re.DOTALL)
        if first_child_match:
            insert_pos = first_child_match.end()
            svg_str = svg_str[:insert_pos] + f"\n  <defs>\n    <style>{font_import}</style>\n  </defs>" + svg_str[insert_pos:]
            
    # 4. Prepend XML declaration
    xml_header = '<?xml version="1.0" encoding="UTF-8"?>\n'
    full_svg = xml_header + svg_str
    
    svg_path.write_text(full_svg, encoding="utf-8")
    print(f"Exported SVG: {svg_path}")

def export_png(html_path: pathlib.Path, png_path: pathlib.Path, scale: int = 2):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(device_scale_factor=scale)
        page.goto(f"file://{html_path.resolve()}")
        page.wait_for_load_state("networkidle")
        # Ensure fonts loaded
        page.evaluate("document.fonts.ready")
        svg_elem = page.locator("svg").first
        svg_elem.screenshot(path=str(png_path), omit_background=True)
        browser.close()
    print(f"Exported PNG: {png_path} (scale={scale})")

def process_diagram(html_path_str: str):
    html_path = pathlib.Path(html_path_str).resolve()
    base = html_path.with_suffix("")
    svg_path = base.with_suffix(".svg")
    png_path = base.with_suffix(".png")
    
    export_svg(html_path, svg_path)
    export_png(html_path, png_path, scale=2)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python export_tools.py <diagram.html>")
        sys.exit(1)
    for arg in sys.argv[1:]:
        process_diagram(arg)
