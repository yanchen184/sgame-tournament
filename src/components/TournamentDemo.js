import React, { useState } from 'react';
import TournamentSelector from '../components/TournamentSelector';
import { useTournamentEngine } from '../hooks/useTournamentEngine';
import { TournamentEngineManager } from '../gameEngines/TournamentEngineManager';

/**
 * Tournament Demo Component
 * Demonstrates the new tournament engine system
 */
const TournamentDemo = () => {
  const [players] = useState([
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' },
    { id: 'p4', name: 'Diana' }
  ]);

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentStarted, setTournamentStarted] = useState(false);

  const {
    initializeTournament,
    startTournament,
    processMatchResult,
    processTournamentAction,
    getTournamentStatus,
    getTournamentData,
    resetTournament,
    gameState,
    error,
    statusMessage,
    isProcessing
  } = useTournamentEngine();

  const handleTournamentSelect = (selection) => {
    setSelectedTournament(selection);
  };

  const handleStartTournament = async () => {
    if (!selectedTournament || !selectedTournament.validation.isValid) {
      return;
    }

    const success = initializeTournament(
      selectedTournament.tournamentId,
      players,
      selectedTournament.options
    );

    if (success) {
      const started = await startTournament();
      if (started) {
        setTournamentStarted(true);
      }
    }
  };

  const handleDeclareWinner = async (winnerName) => {
    await processMatchResult(winnerName);
  };

  const handleTakeRest = async () => {
    await processTournamentAction('takeRest');
  };

  const handleContinuePlay = async () => {
    await processTournamentAction('continuePlay');
  };

  const handleUndo = async () => {
    await processTournamentAction('undoAction');
  };

  const handleEndTournament = async () => {
    await processTournamentAction('endTournament');
  };

  const handleResetTournament = () => {
    resetTournament();
    setTournamentStarted(false);
    setSelectedTournament(null);
  };

  const renderTournamentSelector = () => (
    <div style={{ padding: '20px' }}>
      <h1>新賽制系統演示</h1>
      <TournamentSelector
        players={players}
        onTournamentSelect={handleTournamentSelect}
        selectedTournament={selectedTournament?.tournamentId}
      />
      
      {selectedTournament && selectedTournament.validation.isValid && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={handleStartTournament}
            disabled={isProcessing}
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {isProcessing ? '準備中...' : '開始比賽'}
          </button>
        </div>
      )}
    </div>
  );

  const renderGameInterface = () => {
    const status = getTournamentStatus();
    const tournamentData = getTournamentData();
    
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2>
            {TournamentEngineManager.getTournamentInfo(selectedTournament.tournamentId).name}
          </h2>
          <p>階段: {status.phase} | 回合: {status.round || 1}</p>
          <button
            onClick={handleResetTournament}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重置比賽
          </button>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div style={{
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            background: statusMessage.type === 'error' ? '#fee' : 
                       statusMessage.type === 'warning' ? '#fef9e7' : '#e8f5e8',
            color: statusMessage.type === 'error' ? '#c0392b' : 
                   statusMessage.type === 'warning' ? '#d68910' : '#27ae60',
            border: `1px solid ${statusMessage.type === 'error' ? '#e74c3c' : 
                                 statusMessage.type === 'warning' ? '#f39c12' : '#2ecc71'}`
          }}>
            {statusMessage.message}
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div style={{
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            background: '#fee',
            color: '#c0392b',
            border: '1px solid #e74c3c'
          }}>
            錯誤: {error}
          </div>
        )}

        {/* Current Match */}
        {status.currentMatch && (
          <div style={{
            background: 'white',
            border: '2px solid #3498db',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0 }}>當前對戰</h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h4>{status.currentMatch.fighters[0]?.name}</h4>
                <button
                  onClick={() => handleDeclareWinner(status.currentMatch.fighters[0]?.name)}
                  disabled={isProcessing}
                  style={{
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  宣布獲勝
                </button>
              </div>
              
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#7f8c8d' }}>
                VS
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <h4>{status.currentMatch.fighters[1]?.name}</h4>
                <button
                  onClick={() => handleDeclareWinner(status.currentMatch.fighters[1]?.name)}
                  disabled={isProcessing}
                  style={{
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  宣布獲勝
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rest Option (Streak Tournament) */}
        {selectedTournament.tournamentId === 'streak' && gameState?.showRestOption && (
          <div style={{
            background: '#fff4e6',
            border: '2px solid #f39c12',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0, color: '#d68910' }}>連勝完成！選擇下一步</h3>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={handleTakeRest}
                disabled={isProcessing}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                😴 休息獲得分數
              </button>
              <button
                onClick={handleContinuePlay}
                disabled={isProcessing}
                style={{
                  background: '#e67e22',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                💪 繼續比賽
              </button>
            </div>
          </div>
        )}

        {/* Tournament Standings */}
        {tournamentData && renderTournamentSpecificData(tournamentData)}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          {status.availableActions.includes('undoAction') && (
            <button
              onClick={handleUndo}
              disabled={isProcessing}
              style={{
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ↶ 撤銷
            </button>
          )}
          
          {status.availableActions.includes('endTournament') && (
            <button
              onClick={handleEndTournament}
              disabled={isProcessing}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              結束比賽
            </button>
          )}
        </div>

        {/* Final Results */}
        {status.isFinished && renderFinalResults()}
      </div>
    );
  };

  const renderTournamentSpecificData = (tournamentData) => {
    switch (selectedTournament.tournamentId) {
      case 'streak':
        return renderStreakStandings(tournamentData);
      case 'elimination':
        return renderEliminationBracket(tournamentData);
      case 'roundrobin':
        return renderRoundRobinStandings(tournamentData);
      default:
        return null;
    }
  };

  const renderStreakStandings = (data) => (
    <div style={{
      background: 'white',
      border: '1px solid #ecf0f1',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h3>目前排名</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ecf0f1' }}>選手</th>
            <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ecf0f1' }}>分數</th>
            <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ecf0f1' }}>連勝</th>
            <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ecf0f1' }}>狀態</th>
          </tr>
        </thead>
        <tbody>
          {data.players
            .sort((a, b) => b.score - a.score || b.winStreak - a.winStreak)
            .map((player, index) => (
              <tr key={player.id}>
                <td style={{ padding: '10px', border: '1px solid #ecf0f1' }}>
                  {index + 1}. {player.name}
                  {data.champion && player.id === data.champion.id && ' 👑'}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ecf0f1' }}>
                  {player.score}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ecf0f1' }}>
                  {player.winStreak}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ecf0f1' }}>
                  {player.isResting ? '😴 休息中' : '💪 活躍'}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  const renderEliminationBracket = (data) => (
    <div style={{
      background: 'white',
      border: '1px solid #ecf0f1',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h3>淘汰賽對戰表</h3>
      <p>當前回合: {data.bracket?.currentRound}/{data.bracket?.totalRounds}</p>
      {data.bracket?.bracket?.map((round, roundIndex) => (
        <div key={roundIndex} style={{ marginBottom: '20px' }}>
          <h4>第 {round.round} 輪</h4>
          {round.matches.map((match, matchIndex) => (
            <div key={matchIndex} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              border: '1px solid #ecf0f1',
              borderRadius: '4px',
              marginBottom: '5px',
              background: match.status === 'completed' ? '#e8f5e8' : 
                         match.status === 'ready' ? '#e3f2fd' : '#f8f9fa'
            }}>
              <span style={{ minWidth: '120px' }}>
                {match.player1?.name || '待定'}
              </span>
              <span style={{ margin: '0 15px' }}>vs</span>
              <span style={{ minWidth: '120px' }}>
                {match.player2?.name || '待定'}
              </span>
              {match.winner && (
                <span style={{ marginLeft: '15px', color: '#27ae60', fontWeight: 'bold' }}>
                  → {match.winner.name}
                </span>
              )}
              {match.status === 'bye' && (
                <span style={{ marginLeft: '15px', color: '#f39c12' }}>
                  (輪空)
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderRoundRobinStandings = (data) => (
    <div style={{
      background: 'white',
      border: '1px solid #ecf0f1',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h3>循環賽積分榜</h3>
      {data.schedule && (
        <p>進度: {data.schedule.progress}</p>
      )}
      {data.standings && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ecf0f1' }}>排名</th>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ecf0f1' }}>選手</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ecf0f1' }}>場次</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ecf0f1' }}>勝</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ecf0f1' }}>負</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ecf0f1' }}>積分</th>
            </tr>
          </thead>
          <tbody>
            {data.standings.map((player) => (
              <tr key={player.position}>
                <td style={{ padding: '8px', border: '1px solid #ecf0f1' }}>
                  {player.position}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ecf0f1' }}>
                  {player.name}
                </td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ecf0f1' }}>
                  {player.matchesPlayed}
                </td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ecf0f1' }}>
                  {player.wins}
                </td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ecf0f1' }}>
                  {player.losses}
                </td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ecf0f1', fontWeight: 'bold' }}>
                  {player.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderFinalResults = () => {
    const finalResults = getTournamentData();
    const winner = finalResults?.status?.currentMatch ? null : 
                   finalResults?.players?.[0] || 
                   finalResults?.standings?.[0] ||
                   null;

    if (!winner) return null;

    return (
      <div style={{
        background: 'linear-gradient(135deg, #f39c12, #e67e22)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        marginTop: '30px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '2em' }}>🏆 比賽結束！</h2>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5em' }}>
          冠軍：{winner.name}
        </h3>
        <p style={{ fontSize: '1.1em', opacity: 0.9 }}>
          恭喜獲得勝利！
        </p>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {!tournamentStarted ? renderTournamentSelector() : renderGameInterface()}
    </div>
  );
};

export default TournamentDemo;