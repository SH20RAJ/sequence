'use client';

import { io } from 'socket.io-client';

let socket;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socket',
      addTrailingSlash: false,
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Game-related socket events
export const joinGame = (gameId, playerName) => {
  const socket = getSocket();
  socket.emit('join_game', { gameId, playerName });
};

export const createGame = (playerName) => {
  const socket = getSocket();
  socket.emit('create_game', { playerName });
};

export const playCard = (gameId, playerId, card, position) => {
  const socket = getSocket();
  socket.emit('play_card', { gameId, playerId, card, position });
};

export const leaveGame = (gameId, playerId) => {
  const socket = getSocket();
  socket.emit('leave_game', { gameId, playerId });
};
