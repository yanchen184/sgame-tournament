import React from 'react';
import './GameTimer.css';

const GameTimer = ({ gameTime }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (gameTime <= 300) return 'timer critical'; // Last 5 minutes
    if (gameTime <= 600) return 'timer warning';  // Last 10 minutes
    return 'timer';
  };

  return (
    <div className={getTimerClass()}>
      <span className="timer-icon">⏱️</span>
      <span className="timer-text">比賽時間：{formatTime(gameTime)}</span>
      {gameTime <= 300 && gameTime > 0 && (
        <span className="timer-warning">⚠️ 時間即將結束！</span>
      )}
    </div>
  );
};

export default GameTimer;