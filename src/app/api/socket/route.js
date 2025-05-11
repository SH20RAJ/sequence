import { initializeGame, checkForSequences } from '../../../utils/gameUtils';
import { sendGameUpdate } from '../game-updates/route';

// Store active games in memory (in production, use a database)
const activeGames = new Map();

// Generate a random game ID
function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Handle creating a new game
async function handleCreateGame(data) {
  const { playerName } = data;
  const gameId = generateGameId();
  const playerId = `player_${Date.now()}`;

  // Create a new game
  const gameState = initializeGame([playerId], [playerName]);

  // Store the game
  activeGames.set(gameId, gameState);

  // Notify clients about the new game
  sendGameUpdate(gameId, {
    type: 'game_created',
    gameState
  });

  return new Response(JSON.stringify({
    gameId,
    playerId,
    gameState
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle joining an existing game
async function handleJoinGame(data) {
  const { gameId, playerName } = data;
  const playerId = `player_${Date.now()}`;

  // Check if game exists
  if (!activeGames.has(gameId)) {
    return new Response(JSON.stringify({ error: 'Game not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const gameState = activeGames.get(gameId);

  // Check if game is full (max 2 players for 1v1 only)
  if (gameState.players.length >= 2) {
    return new Response(JSON.stringify({ error: 'Game is full. Only 1v1 games are supported.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Add player to the game
  const playerColor = ['red', 'blue'][gameState.players.length % 2];
  const newPlayer = {
    id: playerId,
    name: playerName,
    color: playerColor,
    sequences: 0,
    hand: [] // Will be dealt cards
  };

  gameState.players.push(newPlayer);

  // Deal cards to the new player
  const cardsPerPlayer = 7; // Always 7 cards for 1v1 games
  for (let i = 0; i < cardsPerPlayer; i++) {
    if (gameState.deck.length > 0) {
      const card = gameState.deck.pop();
      newPlayer.hand.push(card);
    }
  }

  // Update the game state
  activeGames.set(gameId, gameState);

  // Notify clients about the player joining
  sendGameUpdate(gameId, {
    type: 'player_joined',
    playerId,
    playerName,
    gameState
  });

  return new Response(JSON.stringify({
    playerId,
    gameState
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle playing a card
async function handlePlayCard(data) {
  const { gameId, playerId, card, position } = data;

  // Check if game exists
  if (!activeGames.has(gameId)) {
    return new Response(JSON.stringify({ error: 'Game not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const gameState = activeGames.get(gameId);

  // Check if it's the player's turn
  if (gameState.currentPlayer !== playerId) {
    return new Response(JSON.stringify({ error: 'Not your turn' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Find the player
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return new Response(JSON.stringify({ error: 'Player not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const player = gameState.players[playerIndex];

  // Check if player has the card
  const cardIndex = player.hand.indexOf(card);
  if (cardIndex === -1) {
    return new Response(JSON.stringify({ error: 'Card not in hand' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check if the position on the board is valid
  const { row, col } = position;
  if (
    row < 0 || row >= gameState.board.length ||
    col < 0 || col >= gameState.board[0].length
  ) {
    return new Response(JSON.stringify({ error: 'Invalid position' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const boardCell = gameState.board[row][col];

  // Check if the cell is already occupied
  if (boardCell.chip) {
    return new Response(JSON.stringify({ error: 'Position already occupied' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check if the card matches the board position (except for Jacks)
  const isJack = card.startsWith('J_');
  const isTwoEyedJack = card === 'J_diamonds' || card === 'J_clubs';
  const isOneEyedJack = card === 'J_hearts' || card === 'J_spades';

  if (!isJack && boardCell.card !== card) {
    return new Response(JSON.stringify({ error: 'Card does not match position' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle special Jack rules
  if (isOneEyedJack) {
    // One-eyed Jacks remove an opponent's chip
    if (!boardCell.chip || boardCell.chip === player.color) {
      return new Response(JSON.stringify({ error: 'Can only remove opponent chips with one-eyed Jack' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove the chip
    boardCell.chip = null;
  } else {
    // Place a chip (regular card or two-eyed Jack)
    boardCell.chip = player.color;
  }

  // Remove the card from player's hand
  player.hand.splice(cardIndex, 1);

  // Draw a new card if there are cards left in the deck
  if (gameState.deck.length > 0) {
    const newCard = gameState.deck.pop();
    player.hand.push(newCard);
  }

  // Check for sequences
  if (!isOneEyedJack && checkForSequences(gameState.board, row, col, player.color)) {
    player.sequences += 1;

    // Check for win condition
    const sequencesToWin = 1; // Always 1 sequence to win in 1v1 games
    if (player.sequences >= sequencesToWin) {
      gameState.gameStatus = 'completed';
      gameState.winner = playerId;
    }
  }

  // Move to the next player's turn
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  gameState.currentPlayer = gameState.players[gameState.currentPlayerIndex].id;

  // Record the last move
  gameState.lastMove = {
    playerId,
    card,
    position,
    timestamp: Date.now()
  };

  // Update the game state
  activeGames.set(gameId, gameState);

  // Notify clients about the move
  sendGameUpdate(gameId, {
    type: 'game_updated',
    gameState
  });

  return new Response(JSON.stringify({
    success: true,
    gameState
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle player leaving
async function handleLeaveGame(data) {
  const { gameId, playerId } = data;

  if (!activeGames.has(gameId)) {
    return new Response(JSON.stringify({ error: 'Game not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const gameState = activeGames.get(gameId);

  // Remove player from the game
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return new Response(JSON.stringify({ error: 'Player not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const player = gameState.players[playerIndex];
  gameState.players.splice(playerIndex, 1);

  // If no players left, remove the game
  if (gameState.players.length === 0) {
    activeGames.delete(gameId);
  } else {
    // Update current player if needed
    if (gameState.currentPlayer === playerId) {
      gameState.currentPlayerIndex = gameState.currentPlayerIndex % gameState.players.length;
      gameState.currentPlayer = gameState.players[gameState.currentPlayerIndex].id;
    }

    // Update the game state
    activeGames.set(gameId, gameState);

    // Notify remaining players
    sendGameUpdate(gameId, {
      type: 'player_left',
      playerId,
      playerName: player.name,
      gameState
    });
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Successfully left the game'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function GET(req) {
  // This is needed for the initial socket handshake
  return new Response('Socket API route', { status: 200 });
}

export async function POST(req) {
  const data = await req.json();

  // Handle different socket events based on the action
  switch (data.action) {
    case 'create_game':
      return handleCreateGame(data);
    case 'join_game':
      return handleJoinGame(data);
    case 'play_card':
      return handlePlayCard(data);
    case 'leave_game':
      return handleLeaveGame(data);
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}
