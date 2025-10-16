# Electron App Icons

This directory should contain the application icons for the Electron app.

## Required Files

- `icon.png` - PNG icon (512x512 or larger)
- `icon.icns` - macOS icon file
- `icon.ico` - Windows icon file

## How to Generate Icons

### From a PNG Image

1. **Get a high-quality PNG** (512x512 or larger)

2. **Generate .icns (macOS)**:
   ```bash
   # Install iconutil (macOS only) or use online converter
   # Or use: npm install -g png2icons
   png2icons icon.png icon.icns
   ```

3. **Generate .ico (Windows)**:
   ```bash
   # Use ImageMagick
   convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
   
   # Or use online converter: https://convertico.com/
   ```

## Placeholder Icon

For development, you can use a simple placeholder. The build process will warn you if icons are missing but won't fail.

## Production

Before building for production:
1. Design a proper app icon
2. Generate all required formats
3. Place them in this directory
4. Test the build process

## References

- [Electron Icon Documentation](https://www.electronjs.org/docs/latest/tutorial/icon)
- [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder)
