import { useState, useEffect, useCallback } from "react";
import { useWs } from "@/hooks/use-ws";
import { useAuthStore } from "@/stores/use-auth-store";
import { useWsEvent } from "@/hooks/use-ws-event";
import { Methods, Events } from "@/api/protocol";

export interface PendingPairing {
  code: string;
  sender_id: string;
  channel: string;
  chat_id: string;
  account_id: string;
  created_at: number;
  expires_at: number;
  metadata?: {
    username?: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
  };
}

export interface PairedDevice {
  sender_id: string;
  channel: string;
  chat_id: string;
  paired_at: number;
  paired_by: string;
  display_name?: string;
  agent_id?: string;
  session_key?: string;
}

export function useNodes() {
  const ws = useWs();
  const connected = useAuthStore((s) => s.connected);
  const [pendingPairings, setPendingPairings] = useState<PendingPairing[]>([]);
  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const res = await ws.call<{
        pending: PendingPairing[];
        paired: PairedDevice[];
      }>(Methods.PAIRING_LIST);
      
      const pending = res.pending ?? [];
      const paired = res.paired ?? [];
      
      // Fetch sessions to map with paired devices
      if (paired.length > 0) {
        try {
          const sessionsRes = await ws.call<{ sessions: Array<{ key: string }> }>(Methods.SESSIONS_LIST, {});
          const sessions = sessionsRes.sessions ?? [];
          
          // Map sessions to paired devices
          paired.forEach(device => {
            const session = sessions.find(s => 
              s.key.includes(device.channel) && s.key.includes(device.sender_id)
            );
            if (session) {
              device.session_key = session.key;
            }
          });
        } catch {
          // Ignore session fetch errors
        }
      }
      
      setPendingPairings(pending);
      setPairedDevices(paired);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [ws, connected]);

  useEffect(() => {
    load();
  }, [load]);

  useWsEvent(Events.DEVICE_PAIR_REQUESTED, () => {
    load();
  });

  useWsEvent(Events.DEVICE_PAIR_RESOLVED, () => {
    load();
  });

  const approvePairing = useCallback(
    async (code: string) => {
      await ws.call(Methods.PAIRING_APPROVE, { code });
      load();
    },
    [ws, load],
  );

  const denyPairing = useCallback(
    async (code: string) => {
      await ws.call(Methods.PAIRING_DENY, { code });
      load();
    },
    [ws, load],
  );

  const revokePairing = useCallback(
    async (senderId: string, channel: string) => {
      await ws.call(Methods.PAIRING_REVOKE, { senderId, channel });
      load();
    },
    [ws, load],
  );

  const updateAgent = useCallback(
    async (senderId: string, channel: string, agentId: string) => {
      await ws.call(Methods.PAIRING_UPDATE_AGENT, { senderId, channel, agentId });
      load();
    },
    [ws, load],
  );

  return { pendingPairings, pairedDevices, loading, refresh: load, approvePairing, denyPairing, revokePairing, updateAgent };
}
