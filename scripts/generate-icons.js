// Simple script to create placeholder PWA icons
// In a real project, you'd use a proper icon generation tool

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple colored square as placeholder
function createIcon(size, filename) {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${size/4}" font-weight="bold">HR</text>
</svg>`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'public', filename), svg);
}

// Generate required PWA icons
createIcon(192, 'pwa-192x192.png');
createIcon(512, 'pwa-512x512.png');

console.log('PWA icons generated successfully!');
