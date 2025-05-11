'use client';

import styles from './GameInfo.module.css';

const GameInfo = ({ players, currentPlayer, gameStatus }) => {
  return (
    <div className={styles.gameInfo}>
      <div className={styles.statusContainer}>
        <h2 className={styles.gameStatus}>{gameStatus}</h2>
      </div>
      
      <div className={styles.playersContainer}>
        <h3 className={styles.playersTitle}>Players</h3>
        <div className={styles.playersList}>
          {players.map((player, index) => (
            <div 
              key={player.id} 
              className={`${styles.playerItem} ${player.id === currentPlayer ? styles.activePlayer : ''}`}
            >
              <div className={`${styles.playerChip} ${styles[player.color]}`}></div>
              <div className={styles.playerName}>
                {player.name}
                {player.id === currentPlayer && <span className={styles.currentTurn}> (Current Turn)</span>}
              </div>
              <div className={styles.playerSequences}>
                Sequences: {player.sequences || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
