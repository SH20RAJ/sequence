'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGame, joinGame } from '../utils/socketUtils';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);

    try {
      const result = await createGame(playerName);

      if (result.error) {
        setError(result.error);
        setIsCreating(false);
        return;
      }

      // Store player info in localStorage
      localStorage.setItem('sequencePlayerId', result.playerId);
      localStorage.setItem('sequencePlayerName', playerName);

      // Navigate to the game page
      router.push(`/game/${result.gameId}`);
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Failed to create game. Please try again.');
      setIsCreating(false);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!gameId.trim()) {
      setError('Please enter a game ID');
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

      // Store player info in localStorage
      localStorage.setItem('sequencePlayerId', result.playerId);
      localStorage.setItem('sequencePlayerName', playerName);

      // Navigate to the game page
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      setError('Failed to join game. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sequence</h1>
          <p className={styles.subtitle}>The Classic Board and Card Game</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.cardBackground}>
          <div className={styles.formContainer}>
            <div className={styles.formSection}>
              <h2 className={styles.formTitle}>Create a New Game</h2>
              <form onSubmit={handleCreateGame} className={styles.form}>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your Name"
                  className={styles.input}
                  disabled={isCreating || isJoining}
                />
                <button
                  type="submit"
                  className={styles.button}
                  disabled={isCreating || isJoining}
                >
                  {isCreating ? 'Creating...' : 'Create Game'}
                </button>
              </form>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.formSection}>
              <h2 className={styles.formTitle}>Join Existing Game</h2>
              <form onSubmit={handleJoinGame} className={styles.form}>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your Name"
                  className={styles.input}
                  disabled={isCreating || isJoining}
                />
                <input
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value.toUpperCase())}
                  placeholder="Game ID"
                  className={styles.input}
                  disabled={isCreating || isJoining}
                />
                <button
                  type="submit"
                  className={styles.button}
                  disabled={isCreating || isJoining}
                >
                  {isJoining ? 'Joining...' : 'Join Game'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className={styles.rules}>
          <h2 className={styles.rulesTitle}>How to Play</h2>
          <ul className={styles.rulesList}>
            <li>Play a card from your hand and place a chip on the corresponding card on the board</li>
            <li>Form sequences of 5 chips in a row (horizontally, vertically, or diagonally)</li>
            <li>Use Jacks strategically - Two-eyed Jacks are wild, One-eyed Jacks remove opponent chips</li>
            <li>First player/team to form the required number of sequences wins!</li>
          </ul>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2023 Sequence Card Game | Created with Next.js</p>
      </footer>
    </div>
  );
}
