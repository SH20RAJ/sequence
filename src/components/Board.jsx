'use client';

import { useState, useEffect } from 'react';
import styles from './Board.module.css';
import { generateBoard } from '../utils/gameUtils';

const Board = ({ gameState, onPlaceChip, currentPlayer }) => {
  const [board, setBoard] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    // Initialize the board when component mounts
    if (!gameState?.board) {
      setBoard(generateBoard());
    } else {
      setBoard(gameState.board);
    }
  }, [gameState]);

  const handleCellClick = (row, col) => {
    if (gameState?.currentPlayer === currentPlayer && !gameState?.board[row][col].chip) {
      onPlaceChip(row, col);
    }
  };

  const handleCellHover = (row, col) => {
    setHoveredCell({ row, col });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className={styles.boardContainer}>
      <div className={styles.board}>
        {board.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className={styles.row}>
            {row.map((cell, colIndex) => {
              const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
              const isPlayable = !cell.chip && gameState?.currentPlayer === currentPlayer;

              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`${styles.cell} ${cell.isCorner ? styles.corner : ''} ${isHovered && isPlayable ? styles.hovered : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                  onMouseLeave={handleCellLeave}
                >
                  {cell.isCorner ? (
                    <div className={styles.freeSpace}>FREE</div>
                  ) : (
                    <>
                      <div
                        className={styles.cardBackground}
                        style={{
                          backgroundImage: `url(/cards/placeholder.svg)`,
                          backgroundSize: 'cover'
                        }}
                      />
                      {cell.card && (
                        <div className={styles.cardLabel}>
                          {cell.card.split('_')[0]}<br/>
                          {cell.card.split('_')[1]}
                        </div>
                      )}
                      {cell.chip && (
                        <div className={`${styles.chip} ${styles[cell.chip]}`} />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
