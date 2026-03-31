import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { Platform } from "react-native";

class SocketService {
  public socket: Socket | null = null;

  private getDevHost = () => {
    if (Platform.OS === "web") return window.location.hostname;
    const manifest2 = Constants.expoConfig || (Constants as any).manifest2;
    const debuggerHost = manifest2?.hostUri || (Constants as any).manifest?.hostUri;
    if (debuggerHost) return debuggerHost.split(":")[0];
    if (Platform.OS === "android") return "10.0.2.2";
    return "localhost";
  };

  connect(token: string, userId: string) {
    if (this.socket?.connected) return;

    const host = this.getDevHost();
    const serverUrl = `http://${host}:3000`;
    
    console.log(`[SOCKET] Connecting to ${serverUrl} as ${userId}`);

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("🟢 [SOCKET] Link Established:", userId);
    });

    this.socket.on("connect_error", (err) => {
      console.error("🔴 [SOCKET] Link Error:", err.message);
    });
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn(`[SOCKET] Cannot emit ${event}: Not connected`);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off(event);
    this.socket.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
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
