'use client';

import { useState } from 'react';
import styles from './Card.module.css';

const Card = ({ card, onPlay, isPlayable, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isPlayable) {
      onPlay(card);
    }
  };

  return (
    <div
      className={`${styles.card}
                 ${isPlayable ? styles.playable : styles.disabled}
                 ${isHovered && isPlayable ? styles.hovered : ''}
                 ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront} style={{ backgroundImage: `url(/cards/${card}.png)` }} />
        <div className={styles.cardBack} />
      </div>
      {!isPlayable && <div className={styles.disabledOverlay} />}
      {isSelected && <div className={styles.selectedIndicator} />}
    </div>
  );
};

export default Card;
