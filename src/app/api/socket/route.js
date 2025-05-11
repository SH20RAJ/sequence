import { Server } from 'socket.io';
import { initializeGame } from '../../../utils/gameUtils';

// Store active games in memory (in production, use a database)
const activeGames = new Map();

export function GET(req) {
  // This is needed for the initial socket handshake
  return new Response('Socket API route', { status: 200 });
}

const SocketHandler = (req) => {
  if (res.socket.server.io) {
    // Socket is already running
    return res.end();
  }

  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
  });
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle creating a new game
    socket.on('create_game', ({ playerName }) => {
      const gameId = generateGameId();
      const playerId = socket.id;
      
      // Create a new game
      const gameState = initializeGame([playerId], [playerName]);
      
      // Store the game
      activeGames.set(gameId, gameState);
      
      // Join the socket room for this game
      socket.join(gameId);
      
      // Send game info back to the creator
      socket.emit('game_created', { 
        gameId, 
        playerId, 
        gameState 
      });
      
      console.log(`Game created: ${gameId} by player ${playerName}`);
    });

    // Handle joining an existing game
    socket.on('join_game', ({ gameId, playerName }) => {
      const playerId = socket.id;
      
      // Check if game exists
      if (!activeGames.has(gameId)) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      const gameState = activeGames.get(gameId);
      
      // Check if game is full (max 3 players for simplicity)
      if (gameState.players.length >= 3) {
        socket.emit('error', { message: 'Game is full' });
        return;
      }
      
      // Add player to the game
      const playerColor = ['red', 'blue', 'green'][gameState.players.length % 3];
      const newPlayer = {
        id: playerId,
        name: playerName,
        color: playerColor,
        sequences: 0,
        hand: [] // Will be dealt cards
      };
      
      gameState.players.push(newPlayer);
      
      // Deal cards to the new player
      const cardsPerPlayer = gameState.players.length <= 2 ? 7 : 6;
      for (let i = 0; i < cardsPerPlayer; i++) {
        if (gameState.deck.length > 0) {
          const card = gameState.deck.pop();
          newPlayer.hand.push(card);
        }
      }
      
      // Join the socket room for this game
      socket.join(gameId);
      
      // Notify all players about the new player
      io.to(gameId).emit('player_joined', { 
        playerId, 
        playerName, 
        gameState 
      });
      
      // Send game info to the new player
      socket.emit('game_joined', { 
        gameId, 
        playerId, 
        gameState 
      });
      
      console.log(`Player ${playerName} joined game ${gameId}`);
    });

    // Handle playing a card
    socket.on('play_card', ({ gameId, playerId, card, position }) => {
      // Check if game exists
      if (!activeGames.has(gameId)) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      const gameState = activeGames.get(gameId);
      
      // Check if it's the player's turn
      if (gameState.currentPlayer !== playerId) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      // Find the player
      const playerIndex = gameState.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }
      
      const player = gameState.players[playerIndex];
      
      // Check if player has the card
      const cardIndex = player.hand.indexOf(card);
      if (cardIndex === -1) {
        socket.emit('error', { message: 'Card not in hand' });
        return;
      }
      
      // Check if the position on the board is valid and matches the card
      const { row, col } = position;
      if (
        row < 0 || row >= gameState.board.length || 
        col < 0 || col >= gameState.board[0].length
      ) {
        socket.emit('error', { message: 'Invalid position' });
        return;
      }
      
      const boardCell = gameState.board[row][col];
      
      // Check if the cell is already occupied
      if (boardCell.chip) {
        socket.emit('error', { message: 'Position already occupied' });
        return;
      }
      
      // Check if the card matches the board position (except for Jacks)
      const isJack = card.startsWith('J_');
      const isTwoEyedJack = card === 'J_diamonds' || card === 'J_clubs';
      const isOneEyedJack = card === 'J_hearts' || card === 'J_spades';
      
      if (!isJack && boardCell.card !== card) {
        socket.emit('error', { message: 'Card does not match position' });
        return;
      }
      
      // Handle special Jack rules
      if (isOneEyedJack) {
        // One-eyed Jacks remove an opponent's chip
        if (!boardCell.chip || boardCell.chip === player.color) {
          socket.emit('error', { message: 'Can only remove opponent chips with one-eyed Jack' });
          return;
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
        const sequencesToWin = gameState.players.length <= 2 ? 1 : 2;
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
      
      // Notify all players about the move
      io.to(gameId).emit('game_updated', { gameState });
      
      console.log(`Player ${player.name} played ${card} at position [${row}, ${col}]`);
    });

    // Handle player leaving
    socket.on('leave_game', ({ gameId, playerId }) => {
      if (activeGames.has(gameId)) {
        const gameState = activeGames.get(gameId);
        
        // Remove player from the game
        const playerIndex = gameState.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          const player = gameState.players[playerIndex];
          gameState.players.splice(playerIndex, 1);
          
          // If no players left, remove the game
          if (gameState.players.length === 0) {
            activeGames.delete(gameId);
            console.log(`Game ${gameId} removed as all players left`);
          } else {
            // Update current player if needed
            if (gameState.currentPlayer === playerId) {
              gameState.currentPlayerIndex = gameState.currentPlayerIndex % gameState.players.length;
              gameState.currentPlayer = gameState.players[gameState.currentPlayerIndex].id;
            }
            
            // Update the game state
            activeGames.set(gameId, gameState);
            
            // Notify remaining players
            io.to(gameId).emit('player_left', { 
              playerId, 
              playerName: player.name, 
              gameState 
            });
          }
        }
      }
      
      // Leave the socket room
      socket.leave(gameId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const playerId = socket.id;
      console.log('Client disconnected:', playerId);
      
      // Find games the player is in and handle their departure
      for (const [gameId, gameState] of activeGames.entries()) {
        const playerIndex = gameState.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          const player = gameState.players[playerIndex];
          gameState.players.splice(playerIndex, 1);
          
          // If no players left, remove the game
          if (gameState.players.length === 0) {
            activeGames.delete(gameId);
            console.log(`Game ${gameId} removed as all players left`);
          } else {
            // Update current player if needed
            if (gameState.currentPlayer === playerId) {
              gameState.currentPlayerIndex = gameState.currentPlayerIndex % gameState.players.length;
              gameState.currentPlayer = gameState.players[gameState.currentPlayerIndex].id;
            }
            
            // Update the game state
            activeGames.set(gameId, gameState);
            
            // Notify remaining players
            io.to(gameId).emit('player_left', { 
              playerId, 
              playerName: player.name, 
              gameState 
            });
          }
        }
      }
    });
  });

  return res.end();
};

// Helper function to generate a random game ID
function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default SocketHandler;
