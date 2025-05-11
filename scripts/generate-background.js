const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create the public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Background dimensions
const width = 800;
const height = 800;

// Function to create a background pattern
async function createBackgroundPattern() {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);
  
  // Draw pattern
  const suits = ['♥', '♦', '♣', '♠'];
  const colors = ['#e63946', '#e63946', '#1d3557', '#1d3557'];
  
  ctx.font = '30px Arial';
  ctx.globalAlpha = 0.1;
  
  for (let x = 0; x < width; x += 80) {
    for (let y = 0; y < height; y += 80) {
      const suitIndex = Math.floor(Math.random() * suits.length);
      ctx.fillStyle = colors[suitIndex];
      ctx.fillText(suits[suitIndex], x + Math.random() * 20, y + Math.random() * 20);
    }
  }
  
  // Save the background as PNG
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(publicDir, 'cards-pattern.png');
  
  await sharp(buffer)
    .toFile(outputPath);
  
  console.log('Created background pattern');
}

// Generate background pattern
async function generateBackground() {
  console.log('Generating background pattern...');
  await createBackgroundPattern();
  console.log('Background pattern generated successfully!');
}

// Run the generator
generateBackground().catch(console.error);
