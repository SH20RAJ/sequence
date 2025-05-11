// Card deck constants
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Generate a standard deck of cards
export const generateDeck = () => {
  const deck = [];
  
  // Add two of each card to the deck (standard for Sequence)
  for (let i = 0; i < 2; i++) {
    for (const suit of SUITS) {
      for (const value of VALUES) {
        deck.push(`${value}_${suit}`);
      }
    }
  }
  
  // Add jokers if needed
  // deck.push('joker', 'joker');
  
  return shuffleDeck(deck);
};

// Shuffle the deck using Fisher-Yates algorithm
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal cards to players
export const dealCards = (deck, numPlayers, cardsPerPlayer) => {
  const hands = Array(numPlayers).fill().map(() => []);
  const remainingDeck = [...deck];
  
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let player = 0; player < numPlayers; player++) {
      if (remainingDeck.length > 0) {
        const card = remainingDeck.pop();
        hands[player].push(card);
      }
    }
  }
  
  return { hands, remainingDeck };
};

// Generate the game board
export const generateBoard = () => {
  // This is a simplified version - in a real game, you'd have a predefined board layout
  const board = [];
  const boardSize = 10;
  
  // Create a 10x10 board
  for (let row = 0; row < boardSize; row++) {
    const boardRow = [];
    for (let col = 0; col < boardSize; col++) {
      // Mark corners as free spaces
      const isCorner = (row === 0 && col === 0) || 
                       (row === 0 && col === boardSize - 1) || 
                       (row === boardSize - 1 && col === 0) || 
                       (row === boardSize - 1 && col === boardSize - 1);
      
      // Assign a card to each non-corner cell
      // In a real game, this would be a predefined mapping
      const cardIndex = row * boardSize + col;
      const suit = SUITS[Math.floor(cardIndex / 13) % 4];
      const value = VALUES[cardIndex % 13];
      
      boardRow.push({
        isCorner,
        card: isCorner ? null : `${value}_${suit}`,
        chip: null // null means no chip, otherwise 'red', 'blue', etc.
      });
    }
    board.push(boardRow);
  }
  
  return board;
};

// Check for sequences (5 in a row)
export const checkForSequences = (board, row, col, playerColor) => {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1]   // diagonal down-left
  ];
  
  for (const [dx, dy] of directions) {
    let count = 1;
    
    // Check in positive direction
    let r = row + dx;
    let c = col + dy;
    while (
      r >= 0 && r < board.length && 
      c >= 0 && c < board[0].length && 
      (board[r][c].chip === playerColor || board[r][c].isCorner)
    ) {
      count++;
      r += dx;
      c += dy;
    }
    
    // Check in negative direction
    r = row - dx;
    c = col - dy;
    while (
      r >= 0 && r < board.length && 
      c >= 0 && c < board[0].length && 
      (board[r][c].chip === playerColor || board[r][c].isCorner)
    ) {
      count++;
      r -= dx;
      c -= dy;
    }
    
    if (count >= 5) {
      return true;
    }
  }
  
  return false;
};

// Initialize a new game
export const initializeGame = (playerIds, playerNames) => {
  const numPlayers = playerIds.length;
  const cardsPerPlayer = numPlayers <= 2 ? 7 : 6; // Standard Sequence rules
  
  // Generate and shuffle the deck
  const deck = generateDeck();
  
  // Deal cards to players
  const { hands, remainingDeck } = dealCards(deck, numPlayers, cardsPerPlayer);
  
  // Create player objects
  const players = playerIds.map((id, index) => ({
    id,
    name: playerNames[index] || `Player ${index + 1}`,
    color: ['red', 'blue', 'green'][index % 3], // Cycle through available colors
    sequences: 0,
    hand: hands[index]
  }));
  
  // Generate the board
  const board = generateBoard();
  
  return {
    players,
    board,
    deck: remainingDeck,
    currentPlayerIndex: 0,
    currentPlayer: playerIds[0],
    gameStatus: 'in-progress',
    winner: null,
    lastMove: null
  };
};
