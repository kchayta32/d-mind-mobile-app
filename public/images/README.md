# Image Assets

Store your static images here.

## Structure
- `/backgrounds`: Large background images, gradients, or hero banners.
- `/icons`: SVG or PNG icons that aren't available in lucide-react.
- `/placeholders`: Temporary images for development.

## Usage in Code
Since these files are in `public/`, you can reference them directly with a leading slash:

```tsx
// Using a background image
<img src="/images/backgrounds/hero-bg.jpg" alt="Hero" />

// Using an icon
<img src="/images/icons/custom-logo.png" alt="Logo" />
```

## Tips
- Optimize images before uploading (WebP is recommended for photos).
- Keep filenames lowercase and use hyphens (e.g., `my-image.png`).
