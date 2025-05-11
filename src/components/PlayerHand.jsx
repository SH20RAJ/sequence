'use client';

import { useState } from 'react';
import Card from './Card';
import styles from './PlayerHand.module.css';

const PlayerHand = ({ cards, onPlayCard, isCurrentPlayer, selectedCard }) => {
  const handlePlayCard = (card) => {
    onPlayCard(card);
  };

  return (
    <div className={styles.handContainer}>
      <h3 className={styles.handTitle}>
        {isCurrentPlayer ? 'Your Hand' : 'Waiting for your turn...'}
      </h3>
      <div className={styles.hand}>
        {cards.map((card, index) => (
          <div key={`card-${index}`} className={styles.cardWrapper}>
            <Card
              card={card}
              onPlay={handlePlayCard}
              isPlayable={isCurrentPlayer}
              isSelected={selectedCard === card}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;
