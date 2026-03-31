import { create } from 'zustand';

export type CallStatus = 'IDLE' | 'RINGING' | 'DIALING' | 'CONNECTED';

interface CallState {
  incomingCall: any | null;
  activeCall: any | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  status: CallStatus;
  
  setIncomingCall: (call: any | null) => void;
  setActiveCall: (call: any | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setStatus: (status: CallStatus) => void;
  resetCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  incomingCall: null,
  activeCall: null,
  localStream: null,
  remoteStream: null,
  status: 'IDLE',

  setIncomingCall: (incomingCall) => set({ incomingCall, status: incomingCall ? 'RINGING' : 'IDLE' }),
  setActiveCall: (activeCall) => set({ activeCall }),
  setLocalStream: (localStream) => set({ localStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  setStatus: (status) => set({ status }),
  
  resetCall: () => {
    set((state) => {
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      return {
        incomingCall: null,
        activeCall: null,
        localStream: null,
        remoteStream: null,
        status: 'IDLE'
      };
    });
  }
}));
