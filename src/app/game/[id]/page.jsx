'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Board from '../../../components/Board';
import PlayerHand from '../../../components/PlayerHand';
import GameInfo from '../../../components/GameInfo';
import {
  joinGame,
  playCard,
  leaveGame,
  setupGameUpdates
} from '../../../utils/socketUtils';
import styles from './page.module.css';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id;

  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [gameState, setGameState] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  // Set up game updates and handle player data
  useEffect(() => {
    // Check if player was already in this game
    const storedPlayerId = localStorage.getItem('sequencePlayerId');
    const storedPlayerName = localStorage.getItem('sequencePlayerName');

    if (storedPlayerId && storedPlayerName) {
      setPlayerId(storedPlayerId);
      setPlayerName(storedPlayerName);

      // Attempt to get the current game state
      const fetchGameState = async () => {
        try {
          const result = await joinGame(gameId, storedPlayerName);
          if (!result.error) {
            setGameState(result.gameState);
          }
        } catch (error) {
          console.error('Error rejoining game:', error);
        }
      };

      fetchGameState();
    }

    // Set up real-time game updates
    const gameUpdates = setupGameUpdates(gameId, {
      onGameUpdate: (data) => {
        console.log('Game update received:', data);

        if (data.type === 'connected') {
          console.log('Connected to game updates');
        } else if (data.type === 'game_created' ||
                  data.type === 'game_updated' ||
                  data.type === 'player_joined' ||
                  data.type === 'player_left') {
          setGameState(data.gameState);
        } else if (data.type === 'error') {
          setError(data.message);
          setTimeout(() => setError(''), 3000);
        }
      },
      onError: (error) => {
        setError('Connection error. Please try refreshing the page.');
        console.error('Game updates error:', error);
      }
    });

    // Cleanup on unmount
    return () => {
      if (playerId) {
        leaveGame(gameId, playerId).catch(console.error);
      }
      if (gameUpdates) {
        gameUpdates.close();
      }
    };
  }, [gameId]);

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsJoining(true);

    try {
      const result = await joinGame(gameId, playerName);

      if (result.error) {
        setError(result.error);
        setIsJoining(false);
        return;
      }

      setPlayerId(result.playerId);
      setGameState(result.gameState);
      localStorage.setItem('sequencePlayerId', result.playerId);
      localStorage.setItem('sequencePlayerName', playerName);
      setIsJoining(false);
    } catch (error) {
      console.error('Error joining game:', error);
      setError('Failed to join game. Please try again.');
      setIsJoining(false);
    }
  };

  const handlePlayCard = (card) => {
    setSelectedCard(card);
  };

  const handlePlaceChip = async (row, col) => {
    if (selectedCard) {
      try {
        console.log('Placing chip:', { gameId, playerId, card: selectedCard, position: { row, col } });
        const result = await playCard(gameId, playerId, selectedCard, { row, col });

        if (result.error) {
          setError(result.error);
          return;
        }

        // Update the game state with the result
        setGameState(result.gameState);
        setSelectedCard(null);
      } catch (error) {
        console.error('Error playing card:', error);
        setError('Failed to play card. Please try again.');
      }
    } else {
      setError('Please select a card first');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLeaveGame = async () => {
    try {
      await leaveGame(gameId, playerId);
      localStorage.removeItem('sequencePlayerId');
      localStorage.removeItem('sequencePlayerName');
      router.push('/');
    } catch (error) {
      console.error('Error leaving game:', error);
      // Still redirect to home even if there's an error
      router.push('/');
    }
  };

  // Find the current player's hand
  const currentPlayerHand = gameState?.players.find(p => p.id === playerId)?.hand || [];

  // Check if it's the current player's turn
  const isCurrentPlayerTurn = gameState?.currentPlayer === playerId;

  // Generate game status message
  const getGameStatus = () => {
    if (!gameState) return 'Loading game...';

    if (gameState.gameStatus === 'completed') {
      const winner = gameState.players.find(p => p.id === gameState.winner);
      return `Game Over! ${winner?.name || 'Someone'} won!`;
    }

    const currentPlayerName = gameState.players.find(p => p.id === gameState.currentPlayer)?.name;
    return `${currentPlayerName}'s turn`;
  };

  if (!gameState) {
    return (
      <div className={styles.joinContainer}>
        <h1 className={styles.title}>Join Sequence Game</h1>
        <h2 className={styles.gameId}>Game ID: {gameId}</h2>

        <form onSubmit={handleJoinGame} className={styles.joinForm}>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className={styles.nameInput}
            disabled={isJoining}
          />
          <button
            type="submit"
            className={styles.joinButton}
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </form>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <h1 className={styles.title}>Sequence</h1>
        <div className={styles.gameInfo}>
          <span className={styles.gameId}>Game ID: {gameId}</span>
          <button onClick={handleLeaveGame} className={styles.leaveButton}>
            Leave Game
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <GameInfo
        players={gameState.players}
        currentPlayer={gameState.currentPlayer}
        gameStatus={getGameStatus()}
      />

      <div className={styles.boardContainer}>
        <Board
          gameState={gameState}
          onPlaceChip={handlePlaceChip}
          currentPlayer={playerId}
        />
      </div>

      <PlayerHand
        cards={currentPlayerHand}
        onPlayCard={handlePlayCard}
        isCurrentPlayer={isCurrentPlayerTurn}
        selectedCard={selectedCard}
      />

      {selectedCard && (
        <div className={styles.selectedCardIndicator}>
          <p>Select a position on the board to place your chip</p>
        </div>
      )}
    </div>
  );
}
