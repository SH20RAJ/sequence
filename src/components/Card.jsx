'use client';

import { useState } from 'react';
import styles from './Card.module.css';

const Card = ({ card, onPlay, isPlayable }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isPlayable) {
      onPlay(card);
    }
  };

  return (
    <div
      className={`${styles.card} ${isPlayable ? styles.playable : styles.disabled} ${isHovered && isPlayable ? styles.hovered : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.cardInner}>
        <div
          className={styles.cardFront}
          style={{ backgroundImage: `url(/cards/placeholder.svg)` }}
        >
          {card && (
            <div className={styles.cardLabel}>
              {card.split('_')[0]}<br/>
              {card.split('_')[1]}
            </div>
          )}
        </div>
        <div className={styles.cardBack} />
      </div>
      {!isPlayable && <div className={styles.disabledOverlay} />}
    </div>
  );
};

export default Card;
