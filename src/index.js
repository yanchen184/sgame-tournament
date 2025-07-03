import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Test the Fixed Sequence Tournament Engine
const testEngine = () => {
  try {
    const { FixedSequenceTournamentEngine } = require('./gameEngines/FixedSequenceTournamentEngine');
    
    const players = [
      { id: 'player_0', name: 'Test A', position: 1 },
      { id: 'player_1', name: 'Test B', position: 2 },
      { id: 'player_2', name: 'Test C', position: 3 },
      { id: 'player_3', name: 'Test D', position: 4 }
    ];
    
    const engine = new FixedSequenceTournamentEngine(players);
    const validation = engine.validatePlayers(players);
    
    console.log('✅ Engine validation:', validation);
    
    if (validation.isValid) {
      engine.startTournament();
      console.log('✅ Tournament started successfully');
      console.log('Current match:', engine.gameState.currentMatch);
    }
    
  } catch (error) {
    console.error('❌ Engine test failed:', error);
  }
};

// Run test
testEngine();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
