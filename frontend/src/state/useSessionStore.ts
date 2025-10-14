import { create } from "zustand";

interface RiskFlags {
  hasSelfHarm: boolean;
  hasMedicalAdvice: boolean;
  needsEscalation: boolean;
}

interface SessionState {
  sessionId: string | null;
  chunkIndex: number;
  lastReply: string | null;
  riskFlags: RiskFlags | null;
  
  // Actions
  initSession: () => void;
  incrementChunk: () => void;
  setLastReply: (reply: string) => void;
  setRiskFlags: (flags: RiskFlags) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  chunkIndex: 0,
  lastReply: null,
  riskFlags: null,

  initSession: () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set({ sessionId: newSessionId, chunkIndex: 0, lastReply: null, riskFlags: null });
  },

  incrementChunk: () => set((state) => ({ chunkIndex: state.chunkIndex + 1 })),

  setLastReply: (reply: string) => set({ lastReply: reply }),

  setRiskFlags: (flags: RiskFlags) => set({ riskFlags: flags }),

  resetSession: () => set({
    sessionId: null,
    chunkIndex: 0,
    lastReply: null,
    riskFlags: null,
  }),
}));
