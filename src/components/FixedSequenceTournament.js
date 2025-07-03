import React, { useState, useEffect } from 'react';
import useFixedSequenceTournament from '../hooks/useFixedSequenceTournament';
import './FixedSequenceTournament.css';
import packageJson from '../../package.json';

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
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submission state
  const [selectionKey, setSelectionKey] = useState(0); // Force re-render key

  // Get current match info
  const currentMatch = gameState?.currentMatch;
  const progress = getTournamentProgress();
  const sequence = getMatchSequence();
  const standings = getStandings();
  const finalResults = getFinalResults();

  // Initialize tournament when players are provided
  useEffect(() => {
    if (players.length === 4 && !isInitialized) {
      handleInitialize();
    }
  }, [players, isInitialized]);

  // Clear selected winner when current match changes - with proper dependency
  useEffect(() => {
    console.log('Match change detected:', {
      matchId: currentMatch?.matchId, 
      matchNumber: currentMatch?.matchNumber,
      pattern: currentMatch?.pattern,
      currentSelectedWinner: selectedWinner,
      isSubmitting: isSubmitting
    });
    
    // Always clear selection when match changes, regardless of submission state
    if (currentMatch?.matchId) {
      console.log('New match started, clearing selected winner:', currentMatch.matchId);
      setSelectedWinner('');
      setSelectionKey(prev => prev + 1); // Force re-render
    }
  }, [currentMatch?.matchId, currentMatch?.pattern]);

  // Additional safety: clear selection when sequence index changes
  useEffect(() => {
    console.log('Game state updated:', {
      currentSequenceIndex: gameState?.currentSequenceIndex,
      phase: gameState?.phase,
      selectedWinner: selectedWinner,
      isSubmitting: isSubmitting
    });
    
    // Clear selection whenever the sequence index changes
    if (gameState?.currentSequenceIndex !== undefined) {
      console.log('Sequence index changed to:', gameState.currentSequenceIndex);
      setSelectedWinner('');
      setSelectionKey(prev => prev + 1); // Force re-render
    }
  }, [gameState?.currentSequenceIndex, gameState?.phase]);

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

    if (isSubmitting) {
      console.log('Already submitting, preventing duplicate submission');
      return;
    }

    console.log('Starting match result submission:', {
      selectedWinner,
      currentMatch: currentMatch?.matchId,
      pattern: currentMatch?.pattern
    });
    
    setIsSubmitting(true);

    try {
      const success = await processMatchResult(selectedWinner);
      if (success) {
        console.log('Match result processed successfully');
        
        // Clear selected winner immediately after successful processing
        setSelectedWinner('');
        setSelectionKey(prev => prev + 1); // Force re-render
        
        // Add a small delay to ensure state is cleared before next match
        setTimeout(() => {
          console.log('Delayed clearing of selected winner');
          setSelectedWinner('');
          setSelectionKey(prev => prev + 1); // Force re-render again
        }, 100);
        
        // Check if tournament is complete
        if (gameState?.phase === 'finished') {
          const finalResults = getFinalResults();
          if (onTournamentComplete) {
            onTournamentComplete(finalResults);
          }
        }
      } else {
        console.log('Match result processing failed');
      }
    } catch (error) {
      console.error('Error processing match result:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tournament reset
  const handleReset = () => {
    resetTournament();
    setIsInitialized(false);
    setSelectedWinner('');
  };

  // Handle undo last action
  const handleUndo = async () => {
    if (!tournament || !tournament.options.allowUndo) {
      alert('撤銷功能未啟用');
      return;
    }

    try {
      const newGameState = tournament.undoLastAction();
      setGameState({ ...newGameState });
      setSelectedWinner('');
      
      setStatusMessage({
        message: '⬅️ 已撤銷上一步操作',
        type: 'success',
        timestamp: Date.now()
      });
    } catch (error) {
      alert(`撤銷失敗: ${error.message}`);
    }
  };

  // Handle tournament end
  const handleEndTournament = () => {
    if (confirm('確定要結束比賽嗎？這將結束當前比賽並顯示最終結果。')) {
      if (tournament && gameState) {
        tournament.gameState.phase = 'finished';
        setGameState({ ...tournament.gameState });
        
        const finalResults = getFinalResults();
        if (onTournamentComplete) {
          onTournamentComplete(finalResults);
        }
        
        setStatusMessage({
          message: '🏁 比賽已手動結束！',
          type: 'success',
          persistent: true,
          timestamp: Date.now()
        });
      }
    }
  };

  return (
    <div className="fixed-sequence-tournament">
      <div className="tournament-header">
        <h2>固定順序賽制 (4人)</h2>
        <div className="version-info">v{packageJson.version} - {new Date().toLocaleTimeString()}</div>
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

      {/* Current Standings */}
      {standings.length > 0 && (
        <div className="current-standings">
          <h3>積分榜</h3>
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
              <div key={selectionKey} className="winner-options">
                {currentMatch.fighters.map((fighter, index) => (
                  <label key={`${currentMatch.matchId}-${fighter.id}-${selectionKey}`} className="winner-option">
                    <input
                      type="radio"
                      name={`winner-${currentMatch.matchId}-${selectionKey}`}
                      value={fighter.name}
                      checked={selectedWinner === fighter.name}
                      onChange={(e) => {
                        if (!isSubmitting) {
                          setSelectedWinner(e.target.value);
                          console.log('Selected winner:', e.target.value, 'Key:', selectionKey);
                        }
                      }}
                      disabled={isProcessing || isSubmitting}
                    />
                    <span>{fighter.label} - {fighter.name}</span>
                  </label>
                ))}
              </div>
              
              <div className="match-controls">
                <button
                  className="submit-result-btn primary-btn"
                  onClick={handleMatchResult}
                  disabled={!selectedWinner || isProcessing || isSubmitting}
                >
                  {isSubmitting ? '提交中...' : (isProcessing ? '處理中...' : '確認結果')}
                </button>
                
                {gameState?.undoStack && gameState.undoStack.length > 0 && (
                  <button
                    className="undo-btn primary-btn"
                    onClick={handleUndo}
                    disabled={isProcessing || isSubmitting}
                  >
                    撤銷上一步
                  </button>
                )}
              </div>
            </div>
          </div>
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

      {/* Game Controls */}
      <div className="game-controls">
        <div className="controls-section">
          <h3>遊戲控制</h3>
          <div className="control-buttons">
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

            {isInitialized && gameState?.phase === 'playing' && (
              <button 
                className="control-btn end-btn large-btn"
                onClick={handleEndTournament}
                disabled={isProcessing}
              >
                結束比賽
              </button>
            )}
          </div>
        </div>
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
