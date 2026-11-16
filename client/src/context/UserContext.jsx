import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const DEFAULT_USERS = [
  {
    id: 'user_alex',
    username: 'AlexCode',
    displayName: 'Alex Rivers',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexCode',
    rating: 1740
  },
  {
    id: 'user_sarah',
    username: 'SarahDev',
    displayName: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SarahDev',
    rating: 1680
  },
  {
    id: 'user_marcus',
    username: 'MarcusB',
    displayName: 'Marcus Bell',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MarcusB',
    rating: 1820
  }
];

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // If URL has ?user=sarah or ?player=2, pick SarahDev
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user') || params.get('player');
    if (userParam === 'sarah' || userParam === '2' || userParam === 'sarahdev') {
      return DEFAULT_USERS[1];
    }
    const saved = localStorage.getItem('codeduel-active-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_USERS[0];
  });

  useEffect(() => {
    localStorage.setItem('codeduel-active-user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchUser = (user) => {
    setCurrentUser(user);
  };

  const createCustomUser = (username) => {
    if (!username.trim()) return;
    const clean = username.trim();
    const newUser = {
      id: 'user_' + clean.toLowerCase().replace(/[^a-z0-9]/g, ''),
      username: clean,
      displayName: clean,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${clean}`,
      rating: 1500
    };
    setCurrentUser(newUser);
    return newUser;
  };

  return (
    <UserContext.Provider value={{ currentUser, switchUser, createCustomUser, DEFAULT_USERS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
