import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // In dev with Vite proxy, '/socket.io' is proxied or connect directly to 5000
    const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';
    const s = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      // console.log('Socket connected:', s.id);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
