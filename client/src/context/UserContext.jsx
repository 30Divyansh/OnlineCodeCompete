import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const UserContext = createContext();

export function UserProvider({ children }) {
  const { socket } = useSocket();

  const [currentUser, setCurrentUser] = useState(() => {
    // Check URL param first (e.g. ?name=Rahul or ?player=Rahul for easy multi-tab testing)
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get('name') || params.get('user') || params.get('player');
    if (nameParam && nameParam.trim()) {
      const clean = nameParam.trim();
      const pId = 'p_' + clean.toLowerCase().replace(/[^a-z0-9]/g, '');
      const userObj = {
        id: pId,
        username: clean,
        displayName: clean,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(clean)}`,
        rating: 1500,
        competitions: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalPoints: 0
      };
      sessionStorage.setItem('codeduel_player', JSON.stringify(userObj));
      return userObj;
    }

    // Check sessionStorage or localStorage
    const saved = sessionStorage.getItem('codeduel_player') || localStorage.getItem('codeduel_player');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null; // Null means welcome screen will prompt for name
  });

  // Automatically register on socket when socket connects or user changes
  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('player:join', currentUser);
    }
  }, [socket, currentUser]);

  const joinCompetition = (enteredName) => {
    if (!enteredName || !enteredName.trim()) return null;
    const clean = enteredName.trim();
    // Unique ID for this browser session
    const uniqueId = 'p_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const userObj = {
      id: uniqueId,
      username: clean,
      displayName: clean,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(clean)}`,
      rating: 1500,
      competitions: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalPoints: 0
    };

    sessionStorage.setItem('codeduel_player', JSON.stringify(userObj));
    localStorage.setItem('codeduel_player', JSON.stringify(userObj));
    setCurrentUser(userObj);

    if (socket) {
      socket.emit('player:join', userObj);
    }

    return userObj;
  };

  const changeName = () => {
    sessionStorage.removeItem('codeduel_player');
    localStorage.removeItem('codeduel_player');
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, joinCompetition, changeName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
