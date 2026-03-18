import { create } from 'zustand';
import { OrchestrationState } from '@/services/ai/orchestrator';

export interface Attachment {
  name: string;
  type: string;
  data: string; // base64
}

export interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  attachments?: Attachment[];
  orchestrationState?: OrchestrationState;
  timestamp: number;
}

interface AppState {
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessageState: (id: string, stateUpdate: Partial<OrchestrationState>) => void;
  clearMessages: () => void;
}

export const useStore = create<AppState>((set) => ({
  messages: [],
  addMessage: (msg) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...msg,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      }
    ]
  })),
  updateMessageState: (id, stateUpdate) => set((state) => ({
    messages: state.messages.map(m => 
      m.id === id && m.orchestrationState
        ? { ...m, orchestrationState: { ...m.orchestrationState, ...stateUpdate } }
        : m
    )
  })),
  clearMessages: () => set({ messages: [] }),
}));
