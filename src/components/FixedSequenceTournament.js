import React, { useState, useEffect } from 'react';
import useFixedSequenceTournament from '../hooks/useFixedSequenceTournament';
import './FixedSequenceTournament.css';

/**
 * Fixed Sequence Tournament Component
 * Displays 4-player tournament with fixed battle sequence: AB -> CD -> CA -> BD -> BC -> AD
 */
const FixedSequenceTournament = ({ 
  players = [], 
  onTournamentComplete,
  enableDatabaseSync = true 
}) => {
  const {
    initializeTournament,
    startTournament,
    processMatchResult,
    resetTournament,
    gameState,
    sessionId,
    isProcessing,
    error,
    statusMessage,
    isConnected,
    getTournamentProgress,
    getMatchSequence,
    getStandings,
    getFinalResults,
    clearError,
    clearStatus
  } = useFixedSequenceTournament(enableDatabaseSync);

  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState('');

  // Initialize tournament when players are provided
  useEffect(() => {
    if (players.length === 4 && !isInitialized) {
      handleInitialize();
    }
  }, [players, isInitialized]);

  // Handle tournament initialization
  const handleInitialize = async () => {
    const success = await initializeTournament(players);
    if (success) {
      setIsInitialized(true);
    }
  };

  // Handle tournament start
  const handleStart = async () => {
    await startTournament();
  };

  // Handle match result submission
  const handleMatchResult = async () => {
    if (!selectedWinner) {
      alert('請選擇獲勝者');
      return;
    }

    const success = await processMatchResult(selectedWinner);
    if (success) {
      setSelectedWinner('');
      
      // Check if tournament is complete
      if (gameState?.phase === 'finished') {
        const finalResults = getFinalResults();
        if (onTournamentComplete) {
          onTournamentComplete(finalResults);
        }
      }
    }
  };

  // Handle tournament reset
  const handleReset = () => {
    resetTournament();
    setIsInitialized(false);
    setSelectedWinner('');
  };

  // Get current match info
  const currentMatch = gameState?.currentMatch;
  const progress = getTournamentProgress();
  const sequence = getMatchSequence();
  const standings = getStandings();
  const finalResults = getFinalResults();

  return (
    <div className="fixed-sequence-tournament">
      <div className="tournament-header">
        <h2>固定順序賽制 (4人)</h2>
        <div className="tournament-info">
          <div className="sequence-display">
            <h3>對戰順序：AB → CD → CA → BD → BC → AD</h3>
          </div>
          {enableDatabaseSync && sessionId && (
            <div className="session-info">
              <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢' : '🔴'} Session: {sessionId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="error-message" onClick={clearError}>
          ❌ {error}
        </div>
      )}

      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`} onClick={clearStatus}>
          {statusMessage.message}
        </div>
      )}

      {/* Tournament Progress */}
      {progress && (
        <div className="tournament-progress">
          <h3>比賽進度</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {progress.current} / {progress.total} 場比賽完成
          </span>
        </div>
      )}

      {/* Match Sequence Display */}
      {sequence.length > 0 && (
        <div className="match-sequence">
          <h3>對戰序列</h3>
          <div className="sequence-grid">
            {sequence.map((match, index) => (
              <div 
                key={index} 
                className={`sequence-item ${match.status}`}
              >
                <div className="match-number">第{match.matchNumber}場</div>
                <div className="match-pattern">{match.pattern}</div>
                {match.winner && (
                  <div className="match-winner">勝: {match.winner}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Match */}
      {currentMatch && gameState?.phase === 'playing' && (
        <div className="current-match">
          <h3>當前對戰</h3>
          <div className="match-display">
            <div className="fighters">
              <div className="fighter fighter-1">
                <span className="fighter-label">{currentMatch.fighters[0]?.label}</span>
                <span className="fighter-name">{currentMatch.fighters[0]?.name}</span>
              </div>
              <div className="vs">VS</div>
              <div className="fighter fighter-2">
                <span className="fighter-label">{currentMatch.fighters[1]?.label}</span>
                <span className="fighter-name">{currentMatch.fighters[1]?.name}</span>
              </div>
            </div>
            
            <div className="match-info">
              <div>第 {currentMatch.matchNumber} 場</div>
              <div>對戰模式: {currentMatch.pattern}</div>
            </div>

            <div className="winner-selection">
              <h4>選擇獲勝者：</h4>
              <div className="winner-options">
                {currentMatch.fighters.map((fighter, index) => (
                  <label key={index} className="winner-option">
                    <input
                      type="radio"
                      name="winner"
                      value={fighter.name}
                      checked={selectedWinner === fighter.name}
                      onChange={(e) => setSelectedWinner(e.target.value)}
                      disabled={isProcessing}
                    />
                    <span>{fighter.label} - {fighter.name}</span>
                  </label>
                ))}
              </div>
              
              <button
                className="submit-result-btn"
                onClick={handleMatchResult}
                disabled={!selectedWinner || isProcessing}
              >
                {isProcessing ? '處理中...' : '確認結果'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Standings */}
      {standings.length > 0 && (
        <div className="current-standings">
          <h3>目前排名</h3>
          <div className="standings-table">
            <div className="standings-header">
              <span>排名</span>
              <span>選手</span>
              <span>標籤</span>
              <span>勝場</span>
              <span>敗場</span>
              <span>積分</span>
            </div>
            {standings.map((player, index) => (
              <div key={player.id} className="standings-row">
                <span className="rank">#{index + 1}</span>
                <span className="player-name">{player.name}</span>
                <span className="player-label">{player.label}</span>
                <span className="wins">{player.wins}</span>
                <span className="losses">{player.losses}</span>
                <span className="points">{player.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Results */}
      {finalResults && (
        <div className="final-results">
          <h3>🏆 比賽結果</h3>
          <div className="winner-announcement">
            <div className="champion">
              冠軍：{finalResults.winner?.name} ({finalResults.winner?.label})
            </div>
            <div className="winner-stats">
              {finalResults.winner?.wins} 勝 {finalResults.winner?.losses} 敗
            </div>
          </div>
          
          <div className="final-standings">
            <h4>最終排名</h4>
            {finalResults.standings.map((player, index) => (
              <div key={player.id} className={`final-rank rank-${index + 1}`}>
                <span className="position">第 {index + 1} 名</span>
                <span className="player-info">
                  {player.label} - {player.name}
                </span>
                <span className="player-record">
                  {player.wins}勝{player.losses}敗 ({player.points}分)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="tournament-controls">
        {!isInitialized && players.length === 4 && (
          <button 
            className="control-btn initialize-btn"
            onClick={handleInitialize}
            disabled={isProcessing}
          >
            初始化比賽
          </button>
        )}

        {isInitialized && gameState?.phase === 'setup' && (
          <button 
            className="control-btn start-btn"
            onClick={handleStart}
            disabled={isProcessing}
          >
            開始比賽
          </button>
        )}

        {isInitialized && (
          <button 
            className="control-btn reset-btn"
            onClick={handleReset}
            disabled={isProcessing}
          >
            重置比賽
          </button>
        )}
      </div>

      {/* Player Count Warning */}
      {players.length !== 4 && (
        <div className="player-count-warning">
          ⚠️ 固定順序賽制需要恰好 4 位選手 (目前: {players.length} 位)
        </div>
      )}
    </div>
  );
};

export default FixedSequenceTournament;
