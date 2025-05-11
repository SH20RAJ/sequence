'use client';

// API endpoint for game actions
const API_ENDPOINT = '/api/socket';

// Create a new game
export const createGame = async (playerName) => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_game',
        playerName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create game');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

// Join an existing game
export const joinGame = async (gameId, playerName) => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'join_game',
        gameId,
        playerName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to join game');
    }

    return await response.json();
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};

// Play a card
export const playCard = async (gameId, playerId, card, position) => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'play_card',
        gameId,
        playerId,
        card,
        position,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to play card');
    }

    return await response.json();
  } catch (error) {
    console.error('Error playing card:', error);
    throw error;
  }
};

// Leave a game
export const leaveGame = async (gameId, playerId) => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'leave_game',
        gameId,
        playerId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to leave game');
    }

    return await response.json();
  } catch (error) {
    console.error('Error leaving game:', error);
    throw error;
  }
};

// Setup SSE (Server-Sent Events) for real-time updates
export const setupGameUpdates = (gameId, callbacks) => {
  const eventSource = new EventSource(`/api/game-updates?gameId=${gameId}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (callbacks.onGameUpdate) {
      callbacks.onGameUpdate(data);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    eventSource.close();
    if (callbacks.onError) {
      callbacks.onError(error);
    }
  };

  return {
    close: () => eventSource.close(),
  };
};
