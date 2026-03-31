import api from "../api/client";
import { sqliteService } from "./sqlite.service";
import * as Haptics from 'expo-haptics';

class SyncService {
  async performFullSync(addLog: (m: string) => void, onProgress?: (p: number) => void) {
    try {
      addLog("Initiating Secure Handshake...");
      if (onProgress) onProgress(10);
      await Haptics.selectionAsync();
      
      const { data } = await api.get("products");
      const items = data.data || [];
      addLog(`Payload received: ${items.length} assets identified.`);
      
      if (onProgress) onProgress(30);
      await sqliteService.clearLocalRegistry();
      addLog("Local cache cleared.");
      
      if (onProgress) onProgress(50);
      for (let i = 0; i < items.length; i++) {
        const p = items[i];
        await sqliteService.upsertProduct(p);
        if (i % 5 === 0 && onProgress) {
          onProgress(Math.floor(50 + (i / items.length) * 50));
        }
      }

      if (onProgress) onProgress(100);
      addLog("Oracle Protocol Success.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } catch (error) {
      addLog("Protocol Error: Connection Interrupted.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }
  }
}

export const syncService = new SyncService();
