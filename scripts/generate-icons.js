const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

// Function to create PNGs from SVG
async function createPNGs() {
  try {
    // Load SVG as an image
    const svgPath = path.join(__dirname, '../assets/flip-horizontal-svgrepo-com.svg');
    console.log(`Loading SVG from: ${svgPath}`);

    // Create various sized canvases and draw the icon
    // App Icon (1024x1024)
    const iconCanvas = createCanvas(1024, 1024);
    const iconCtx = iconCanvas.getContext('2d');
    iconCtx.fillStyle = '#ffffff';
    iconCtx.fillRect(0, 0, 1024, 1024);
    
    // Draw the SVG centered with padding
    const iconImg = await loadImage(svgPath);
    const padding = 100; // Add padding
    iconCtx.drawImage(iconImg, padding, padding, 1024 - padding * 2, 1024 - padding * 2);
    
    // Save the icon
    const iconBuffer = iconCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, '../assets/icon.png'), iconBuffer);
    console.log('Generated app icon');

    // Adaptive icon (foreground) (1024x1024)
    const adaptiveCanvas = createCanvas(1024, 1024);
    const adaptiveCtx = adaptiveCanvas.getContext('2d');
    adaptiveCtx.fillStyle = '#ffffff';
    adaptiveCtx.fillRect(0, 0, 1024, 1024);
    
    // Draw the SVG centered with padding
    adaptiveCtx.drawImage(iconImg, padding, padding, 1024 - padding * 2, 1024 - padding * 2);
    
    // Save the adaptive icon
    const adaptiveBuffer = adaptiveCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, '../assets/adaptive-icon.png'), adaptiveBuffer);
    console.log('Generated adaptive icon');

    // Splash screen (2048x2048)
    const splashCanvas = createCanvas(2048, 2048);
    const splashCtx = splashCanvas.getContext('2d');
    splashCtx.fillStyle = '#ffffff';
    splashCtx.fillRect(0, 0, 2048, 2048);
    
    // Draw the SVG centered with more padding for splash
    const splashPadding = 500;
    splashCtx.drawImage(iconImg, splashPadding, splashPadding, 2048 - splashPadding * 2, 2048 - splashPadding * 2);
    
    // Save the splash screen
    const splashBuffer = splashCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, '../assets/splash.png'), splashBuffer);
    console.log('Generated splash screen');
    
    // Favicon (48x48)
    const faviconCanvas = createCanvas(48, 48);
    const faviconCtx = faviconCanvas.getContext('2d');
    faviconCtx.fillStyle = '#ffffff';
    faviconCtx.fillRect(0, 0, 48, 48);
    
    // Draw the SVG centered with minimal padding
    const faviconPadding = 4;
    faviconCtx.drawImage(iconImg, faviconPadding, faviconPadding, 48 - faviconPadding * 2, 48 - faviconPadding * 2);
    
    // Save the favicon
    const faviconBuffer = faviconCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, '../assets/favicon.png'), faviconBuffer);
    console.log('Generated favicon');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

createPNGs(); 