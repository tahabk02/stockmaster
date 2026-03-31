import { io, Socket } from "socket.io-client";

class SocketService {
  public socket: Socket | null = null;

  connect(token: string, userId: string) {
    if (this.socket?.connected) return;

    const serverUrl = "";
    
    this.socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket", "polling"], // Allow polling for better compatibility
      reconnection: true,
      reconnectionAttempts: 10,
    });

    this.socket.on("connect", () => {
      console.log("🟢 [SOCKET] Connected as:", userId);
    });
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  // Empêche les doublons d'écouteurs
  on(event: string, callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off(event); // Supprime l'ancien s'il existe
    this.socket.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  clear() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
