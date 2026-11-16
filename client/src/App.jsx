import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import WelcomeScreen from './components/WelcomeScreen';
import ChallengeModal from './components/ChallengeModal';
import Home from './pages/Home';
import Matchmaking from './pages/Matchmaking';
import Workspace from './pages/Workspace';
import Results from './pages/Results';
import ProblemLibrary from './pages/ProblemLibrary';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import CompetitionsHistory from './pages/CompetitionsHistory';
import LiveCompetition from './pages/LiveCompetition';

function MainApp() {
  const { currentUser } = useUser();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* If player has not entered their name yet, show the Welcome Screen */}
      {!currentUser && <WelcomeScreen />}

      <Navbar />
      <ChallengeModal />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live" element={<LiveCompetition />} />
        <Route path="/find-opponent" element={<LiveCompetition />} />
        <Route path="/competitions" element={<CompetitionsHistory />} />
        <Route path="/matchmaking/:roomCode" element={<Matchmaking />} />
        <Route path="/workspace/:roomCode" element={<Workspace />} />
        <Route path="/results/:roomCode" element={<Results />} />
        <Route path="/problems" element={<ProblemLibrary />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="*" element={<Navigate to="/live" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <UserProvider>
          <BrowserRouter>
            <MainApp />
          </BrowserRouter>
        </UserProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}
