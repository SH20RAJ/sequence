const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create the cards directory if it doesn't exist
const cardsDir = path.join(__dirname, '../public/cards');
if (!fs.existsSync(cardsDir)) {
  fs.mkdirSync(cardsDir, { recursive: true });
}

// Card dimensions
const cardWidth = 200;
const cardHeight = 300;
const cornerRadius = 15;

// Card suits and values
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Colors
const suitColors = {
  hearts: '#e63946',
  diamonds: '#e63946',
  clubs: '#1d3557',
  spades: '#1d3557'
};

// Suit symbols
const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

// Function to draw a rounded rectangle
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Function to create a card
async function createCard(value, suit) {
  const canvas = createCanvas(cardWidth, cardHeight);
  const ctx = canvas.getContext('2d');
  
  // Draw card background (white with rounded corners)
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 0, 0, cardWidth, cardHeight, cornerRadius);
  ctx.fill();
  
  // Draw card border
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  roundRect(ctx, 0, 0, cardWidth, cardHeight, cornerRadius);
  ctx.stroke();
  
  // Set text properties
  ctx.fillStyle = suitColors[suit];
  ctx.textAlign = 'center';
  
  // Draw card value in top left and bottom right
  ctx.font = 'bold 40px Arial';
  ctx.fillText(value, 30, 50);
  ctx.fillText(value, cardWidth - 30, cardHeight - 30);
  
  // Draw suit symbol in top left and bottom right
  ctx.font = '40px Arial';
  ctx.fillText(suitSymbols[suit], 30, 90);
  ctx.fillText(suitSymbols[suit], cardWidth - 30, cardHeight - 70);
  
  // Draw large central suit symbol
  ctx.font = '120px Arial';
  ctx.fillText(suitSymbols[suit], cardWidth / 2, cardHeight / 2 + 40);
  
  // For face cards (J, Q, K), add a simple representation
  if (['J', 'Q', 'K'].includes(value)) {
    ctx.font = 'bold 24px Arial';
    const faceNames = {
      'J': 'JACK',
      'Q': 'QUEEN',
      'K': 'KING'
    };
    ctx.fillText(faceNames[value], cardWidth / 2, cardHeight / 2 - 40);
  }
  
  // Save the card as PNG
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(cardsDir, `${value}_${suit}.png`);
  
  await sharp(buffer)
    .resize(cardWidth, cardHeight)
    .toFile(outputPath);
  
  console.log(`Created ${value} of ${suit}`);
}

// Function to create card back
async function createCardBack() {
  const canvas = createCanvas(cardWidth, cardHeight);
  const ctx = canvas.getContext('2d');
  
  // Draw card background
  ctx.fillStyle = '#1a1a2e';
  roundRect(ctx, 0, 0, cardWidth, cardHeight, cornerRadius);
  ctx.fill();
  
  // Draw card border
  ctx.strokeStyle = '#a8dadc';
  ctx.lineWidth = 3;
  roundRect(ctx, 0, 0, cardWidth, cardHeight, cornerRadius);
  ctx.stroke();
  
  // Draw pattern
  ctx.fillStyle = '#2a2a5a';
  for (let x = 0; x < cardWidth; x += 20) {
    for (let y = 0; y < cardHeight; y += 20) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Draw logo
  ctx.fillStyle = '#a8dadc';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('S', cardWidth / 2, cardHeight / 2 - 20);
  ctx.font = 'bold 20px Arial';
  ctx.fillText('SEQUENCE', cardWidth / 2, cardHeight / 2 + 20);
  
  // Save the card back as PNG
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(cardsDir, 'card-back.png');
  
  await sharp(buffer)
    .resize(cardWidth, cardHeight)
    .toFile(outputPath);
  
  console.log('Created card back');
}

// Generate all cards
async function generateAllCards() {
  console.log('Generating card images...');
  
  // Create card back
  await createCardBack();
  
  // Create all cards
  for (const suit of suits) {
    for (const value of values) {
      await createCard(value, suit);
    }
  }
  
  console.log('All cards generated successfully!');
}

// Run the generator
generateAllCards().catch(console.error);
