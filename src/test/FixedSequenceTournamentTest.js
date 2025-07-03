/**
 * Test script for Fixed Sequence Tournament Engine
 */

import { FixedSequenceTournamentEngine } from '../gameEngines/FixedSequenceTournamentEngine';

// Test function
export const testFixedSequenceTournament = () => {
  console.log('Testing Fixed Sequence Tournament Engine...');
  
  // Create test players
  const players = [
    { id: 'player_0', name: '選手A', position: 1 },
    { id: 'player_1', name: '選手B', position: 2 },
    { id: 'player_2', name: '選手C', position: 3 },
    { id: 'player_3', name: '選手D', position: 4 }
  ];
  
  try {
    // Create engine
    const engine = new FixedSequenceTournamentEngine(players);
    console.log('✅ Engine created successfully');
    
    // Validate players
    const validation = engine.validatePlayers(players);
    console.log('✅ Validation result:', validation);
    
    // Start tournament
    engine.startTournament();
    console.log('✅ Tournament started');
    console.log('Current match:', engine.gameState.currentMatch);
    
    // Test match result
    if (engine.gameState.currentMatch) {
      const winner = engine.gameState.currentMatch.fighters[0];
      engine.processMatchResult(winner.name);
      console.log('✅ Match result processed');
      console.log('Next match:', engine.gameState.currentMatch);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Run test if called directly
if (typeof window !== 'undefined') {
  window.testFixedSequenceTournament = testFixedSequenceTournament;
}
