import { NextResponse } from 'next/server';

// Store active connections for each game
const gameConnections = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');
  
  if (!gameId) {
    return new Response('Game ID is required', { status: 400 });
  }
  
  // Set up SSE headers
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this connection
      if (!gameConnections.has(gameId)) {
        gameConnections.set(gameId, []);
      }
      
      const connections = gameConnections.get(gameId);
      connections.push(controller);
      
      // Send initial connection message
      const message = encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
      controller.enqueue(message);
    },
    cancel() {
      // Remove this connection when closed
      if (gameConnections.has(gameId)) {
        const connections = gameConnections.get(gameId);
        const index = connections.findIndex(c => c === controller);
        if (index !== -1) {
          connections.splice(index, 1);
        }
        
        // Clean up if no connections left for this game
        if (connections.length === 0) {
          gameConnections.delete(gameId);
        }
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper function to send updates to all clients in a game
export function sendGameUpdate(gameId, data) {
  if (!gameConnections.has(gameId)) {
    return;
  }
  
  const connections = gameConnections.get(gameId);
  const encoder = new TextEncoder();
  const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
  
  connections.forEach(controller => {
    try {
      controller.enqueue(message);
    } catch (error) {
      console.error('Error sending game update:', error);
    }
  });
}
