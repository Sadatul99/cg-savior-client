import { useEffect, useRef } from 'react';
import axios from 'axios';

const SERVER_URL = 'https://cg-savior-server.onrender.com'; // will be replaced with render URL
const PING_INTERVAL_MS = 12 * 60 * 1000; // 12 minutes (well within Render's 15-min sleep threshold)

/**
 * Pings the server's /health endpoint every 12 minutes to prevent
 * Render's free tier from putting the instance to sleep.
 * Runs silently in the background — no UI impact.
 */
const useServerKeepAlive = () => {
    const intervalRef = useRef(null);

    useEffect(() => {
        const ping = async () => {
            try {
                await axios.get(`${SERVER_URL}/health`, { timeout: 10000 });
            } catch {
                // Silently ignore — the ping is best-effort only.
                // A failed ping just means the server may be sleeping and will
                // wake up on the next real user request.
            }
        };

        // Ping once on mount so the server is warm when the user first loads the app
        ping();

        // Then ping every 12 minutes to keep it alive
        intervalRef.current = setInterval(ping, PING_INTERVAL_MS);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
};

export default useServerKeepAlive;
