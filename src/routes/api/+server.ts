import type { RequestHandler } from './$types';

interface DataPoint {
  timestamp: number;
  value: number;
  name: string;
}

export const GET: RequestHandler = async ({ }) => {
  let isStreamActive = true;

  const stream = new ReadableStream({
    start(controller) {
      console.log('Client connected');
      // Initial data points
      let value = 50;
      let interval: NodeJS.Timeout;

      const sendData = () => {
        if (!isStreamActive) return;

        try {
          // Generate new data points with some randomness
          value = Math.max(0, Math.min(100, value + (Math.random() * 6 - 3)));

          const data: DataPoint = {
            timestamp: Date.now(),
            value: Math.round(value * 10) / 10,
            name: 'Metric A'
          };

          if (isStreamActive) {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          }
        } catch (error) {
          console.error('Error in stream:', error);
          if (interval) clearInterval(interval);
          controller.error(error);
        }
      };

      // Send initial data
      sendData();

      // Set up interval for subsequent updates
      interval = setInterval(sendData, 1000);

      // Clean up on client disconnect
      return () => {
        isStreamActive = false;
        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch (e) {
          // Stream might already be closed
        }
      };
    },
    cancel() {
      isStreamActive = false;
      console.log('Client disconnected');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
};