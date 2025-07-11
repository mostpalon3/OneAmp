import { NextRequest, NextResponse } from 'next/server';
import redis from '@/app/lib/redis/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jamId: string }> }
) {
  const { jamId } = await params;
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', jamId })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Subscribe to Redis channels for this jam
      // Subscribe to Redis channels for this jam
      const { createClient } = require('redis');
      const subscriber = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      subscriber.connect();
      
      subscriber.subscribe(`vote_updates:${jamId}`, (message: string) => {
        try {
          const data = `data: ${JSON.stringify({ type: 'vote_update', ...JSON.parse(message) })}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
        } catch (error) {
          console.error('Error broadcasting vote update:', error);
        }
      });

      subscriber.subscribe(`stream_updates:${jamId}`, (message: string) => {
        try {
          const data = `data: ${JSON.stringify({ type: 'stream_update', ...JSON.parse(message) })}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
        } catch (error) {
          console.error('Error broadcasting stream update:', error);
        }
      });

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        subscriber.unsubscribe();
        subscriber.quit();
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}