import React, { useState, useEffect } from 'react';
import './PlayerTransition.css';

const PlayerTransition = ({ 
  currentFighters, 
  nextPlayer, 
  triggerTransition, 
  transitionType, // 'victory' or 'rest'
  onTransitionComplete 
}) => {
  const [showTransition, setShowTransition] = useState(false);
  const [stage, setStage] = useState('idle'); // 'idle', 'exit', 'enter', 'complete'

  useEffect(() => {
    if (triggerTransition && nextPlayer) {
      startTransition();
    }
  }, [triggerTransition, nextPlayer]);

  const startTransition = () => {
    console.log('Starting player transition:', {
      transitionType,
      currentFighters: currentFighters.map(f => f?.name),
      nextPlayer: nextPlayer.name
    });

    setShowTransition(true);
    setStage('exit');

    // Stage 1: Exit animation (500ms)
    setTimeout(() => {
      setStage('enter');
    }, 500);

    // Stage 2: Enter animation (500ms)
    setTimeout(() => {
      setStage('complete');
      setShowTransition(false);
      if (onTransitionComplete) {
        onTransitionComplete();
      }
    }, 1000);
  };

  if (!showTransition) return null;

  const getExitingPlayer = () => {
    if (transitionType === 'victory') {
      // In victory, the loser exits
      return currentFighters.find(fighter => fighter?.id !== nextPlayer.id);
    } else if (transitionType === 'rest') {
      // In rest, both players exit
      return currentFighters;
    }
    return null;
  };

  const exitingPlayer = getExitingPlayer();

  return (
    <div className="player-transition-overlay">
      <div className="transition-arena">
        {/* Current fighters display */}
        <div className="transition-fighters">
          {currentFighters.map((fighter, index) => {
            if (!fighter) return null;
            
            const isExiting = transitionType === 'rest' || 
                             (transitionType === 'victory' && fighter.id !== nextPlayer.id);
            
            return (
              <div 
                key={fighter.id}
                className={`transition-fighter fighter-${index} ${isExiting ? 'exiting' : 'staying'} stage-${stage}`}
              >
                <div className="fighter-card">
                  <div className="fighter-avatar">
                    {isExiting ? '😔' : '😤'}
                  </div>
                  <div className="fighter-name">{fighter.name}</div>
                  {isExiting && (
                    <div className="exit-effect">
                      {transitionType === 'victory' ? '敗北' : '休息'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Transition effects */}
        <div className={`transition-effects stage-${stage}`}>
          {stage === 'exit' && (
            <div className="exit-message">
              {transitionType === 'victory' ? (
                <>
                  <div className="effect-icon">⚔️</div>
                  <div className="effect-text">{exitingPlayer?.name} 敗北離場</div>
                </>
              ) : (
                <>
                  <div className="effect-icon">😴</div>
                  <div className="effect-text">選手休息，重新組合</div>
                </>
              )}
            </div>
          )}

          {stage === 'enter' && nextPlayer && (
            <div className="enter-message">
              <div className="effect-icon">⭐</div>
              <div className="effect-text">{nextPlayer.name} 上場挑戰！</div>
              <div className="next-player-card">
                <div className="next-avatar">🥊</div>
                <div className="next-name">{nextPlayer.name}</div>
                <div className="next-stats">
                  {nextPlayer.score}分 
                  {nextPlayer.winStreak > 0 && ` • ${nextPlayer.winStreak}連勝`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* VS indicator for victory transitions */}
        {transitionType === 'victory' && stage === 'enter' && (
          <div className="vs-transition">
            <div className="vs-text">VS</div>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="transition-progress">
        <div className={`progress-bar stage-${stage}`}></div>
      </div>
    </div>
  );
};

export default PlayerTransition;
