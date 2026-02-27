/**
 * Real-time event system using SSE (Server-Sent Events)
 * 
 * In-memory event emitter for single-server deployments.
 * For multi-server, replace with Redis Pub/Sub.
 */

type EventHandler = (data: any) => void;

interface StreamClient {
  id: string;
  userId: string;
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
}

class RealtimeEventBus {
  // Channel -> Set of handlers
  private channels = new Map<string, Set<EventHandler>>();
  
  // Active SSE connections: channel -> client[]
  private clients = new Map<string, StreamClient[]>();

  /**
   * Subscribe to a channel with a handler
   */
  subscribe(channel: string, handler: EventHandler): () => void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(handler);

    return () => {
      const handlers = this.channels.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.channels.delete(channel);
        }
      }
    };
  }

  /**
   * Publish an event to a channel
   */
  publish(channel: string, event: string, data: any): void {
    // Notify in-memory handlers
    const handlers = this.channels.get(channel);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler({ event, data });
        } catch (err) {
          console.error(`Error in event handler for ${channel}:`, err);
        }
      });
    }

    // Push to SSE clients
    const clients = this.clients.get(channel);
    if (clients) {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      const deadClients: number[] = [];

      clients.forEach((client, index) => {
        try {
          client.controller.enqueue(client.encoder.encode(payload));
        } catch {
          deadClients.push(index);
        }
      });

      // Clean up dead clients
      if (deadClients.length > 0) {
        const alive = clients.filter((_, i) => !deadClients.includes(i));
        if (alive.length > 0) {
          this.clients.set(channel, alive);
        } else {
          this.clients.delete(channel);
        }
      }
    }
  }

  /**
   * Register an SSE client for a channel
   */
  addClient(channel: string, client: StreamClient): void {
    if (!this.clients.has(channel)) {
      this.clients.set(channel, []);
    }
    this.clients.get(channel)!.push(client);
  }

  /**
   * Remove an SSE client
   */
  removeClient(channel: string, clientId: string): void {
    const clients = this.clients.get(channel);
    if (clients) {
      const filtered = clients.filter((c) => c.id !== clientId);
      if (filtered.length > 0) {
        this.clients.set(channel, filtered);
      } else {
        this.clients.delete(channel);
      }
    }
  }

  /**
   * Publish to a user's personal channel (for global notifications)
   */
  publishToUser(userId: string, event: string, data: any): void {
    this.publish(`user:${userId}`, event, data);
  }

  /**
   * Publish to a conversation channel
   */
  publishToConversation(conversationId: string, event: string, data: any): void {
    this.publish(`conversation:${conversationId}`, event, data);
  }

  /**
   * Get stats for debugging
   */
  getStats(): { channels: number; totalClients: number } {
    let totalClients = 0;
    this.clients.forEach((clients) => {
      totalClients += clients.length;
    });
    return {
      channels: this.channels.size + this.clients.size,
      totalClients,
    };
  }
}

// Singleton
const globalForRealtime = globalThis as typeof globalThis & {
  realtimeEventBus?: RealtimeEventBus;
};

export const eventBus =
  globalForRealtime.realtimeEventBus ?? new RealtimeEventBus();

if (process.env.NODE_ENV !== 'production') {
  globalForRealtime.realtimeEventBus = eventBus;
}

/**
 * Create an SSE ReadableStream for a channel
 */
export function createSSEStream(
  channel: string,
  userId: string,
): ReadableStream {
  const encoder = new TextEncoder();
  const clientId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new ReadableStream({
    start(controller) {
      const client: StreamClient = {
        id: clientId,
        userId,
        controller,
        encoder,
      };

      eventBus.addClient(channel, client);

      // Send initial connection event
      const connectMsg = `event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));
    },
    cancel() {
      eventBus.removeClient(channel, clientId);
    },
  });
}

// Event type constants
export const EVENTS = {
  NEW_MESSAGE: 'new-message',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  MESSAGE_READ: 'message-read',
  UNREAD_COUNT: 'unread-count',
  CONVERSATION_UPDATED: 'conversation-updated',
} as const;
