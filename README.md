# Sequence Card Game

A multiplayer online implementation of the popular Sequence board game using Next.js, React, and Socket.io.

## Game Description

Sequence is a board and card game where players strategically place chips on the game board by playing cards from their hand. The objective is to form sequences of five chips in a row (horizontally, vertically, or diagonally) before your opponents.

## Game Rules

1. **Setup**:
   - The game can be played with 2-12 players (typically in teams for more than 3 players)
   - Each player receives a hand of cards (number depends on player count)
   - The board consists of a 10x10 grid of card images with four corner spaces marked as "free" spaces

2. **Gameplay**:
   - On your turn, play a card from your hand and place a chip on the corresponding card space on the board
   - Draw a new card to replace the one played
   - The goal is to create sequences (five chips in a row) of your color
   - Jack cards have special rules:
     - Two-eyed Jacks (Diamonds and Clubs) are wild and can be placed anywhere
     - One-eyed Jacks (Hearts and Spades) can remove an opponent's chip

3. **Winning**:
   - The first player/team to create the required number of sequences wins
   - Typically 1 sequence for 2 players, 2 sequences for team play

## Technologies Used

- **Frontend**: React, Next.js
- **Backend**: Next.js API routes
- **Real-time Communication**: Socket.io
- **Styling**: CSS Modules

## Features

- Real-time multiplayer gameplay
- Beautiful, responsive UI
- Game state synchronization across players
- Interactive game board and card system
- Player turn management
- Sequence detection algorithm

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
sequence/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── page.js           # Home page
│   │   ├── game/[id]/        # Game route
│   │   └── api/socket/       # Socket.io API route
│   ├── components/           # React components
│   │   ├── Board.jsx         # Game board component
│   │   ├── Card.jsx          # Card component
│   │   └── ...               # Other components
│   └── utils/                # Utility functions
│       ├── gameUtils.js      # Game logic
│       └── socketUtils.js    # Socket.io setup
├── public/                   # Static assets
│   └── cards/                # Card images
└── ...                       # Configuration files
```

## Future Enhancements

- Add authentication system
- Implement team play
- Add game history and statistics
- Add sound effects and animations
- Create mobile app version

## License

This project is licensed under the MIT License - see the LICENSE file for details.