import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Matchmaking from './pages/Matchmaking';
import Workspace from './pages/Workspace';
import Results from './pages/Results';
import ProblemLibrary from './pages/ProblemLibrary';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import CompetitionsHistory from './pages/CompetitionsHistory';

function ProfileRedirect() {
  const { currentUser } = useUser();
  return <Navigate to={`/profile/${currentUser.id}`} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <SocketProvider>
          <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/competitions" element={<CompetitionsHistory />} />
                <Route path="/matchmaking/:roomCode" element={<Matchmaking />} />
                <Route path="/workspace/:roomCode" element={<Workspace />} />
                <Route path="/results/:roomCode" element={<Results />} />
                <Route path="/problems" element={<ProblemLibrary />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<ProfileRedirect />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </SocketProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
