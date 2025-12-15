import { openDB } from 'idb';
import type { ChatMessageItem } from '@/lib/types';

const dbPromise = openDB('chat-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('messages')) {
      const store = db.createObjectStore('messages', { keyPath: 'id' });
      store.createIndex('by-conversation', 'conversation_id');
    }
  },
});

export const chatStorage = {
  async saveMessages(conversationId: string, messages: ChatMessageItem[]) {
    const db = await dbPromise;
    const tx = db.transaction('messages', 'readwrite');
    messages.forEach(msg => tx.store.put(msg));
    await tx.done;
  },
  async getMessages(conversationId: string): Promise<ChatMessageItem[]> {
    const db = await dbPromise;
    return db.getAllFromIndex('messages', 'by-conversation', conversationId);
  },
  async clearConversation(conversationId: string) {
    const db = await dbPromise;
    const tx = db.transaction('messages', 'readwrite');
    const index = tx.store.index('by-conversation');
    for (let cursor = await index.openCursor(conversationId); cursor; cursor = await cursor.continue()) {
      cursor.delete();
    }
    await tx.done;
  },
};
