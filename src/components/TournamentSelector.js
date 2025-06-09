import React, { useState, useEffect } from 'react';
import { TournamentEngineManager } from '../gameEngines/TournamentEngineManager';
import './TournamentSelector.css';

/**
 * Tournament Type Selector Component
 * Allows users to choose tournament type and configure options
 */
const TournamentSelector = ({ 
  players = [], 
  onTournamentSelect, 
  selectedTournament = null,
  disabled = false 
}) => {
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [selectedType, setSelectedType] = useState(selectedTournament);
  const [tournamentOptions, setTournamentOptions] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });

  useEffect(() => {
    // Load available tournaments
    const tournaments = TournamentEngineManager.getAvailableTournaments();
    setAvailableTournaments(tournaments);
    
    // Set recommended tournament if none selected
    if (!selectedType && players.length > 0) {
      const recommended = TournamentEngineManager.getRecommendedTournament(players.length);
      setSelectedType(recommended);
    }
  }, [players.length, selectedType]);

  useEffect(() => {
    // Load default options for selected tournament
    if (selectedType) {
      const options = TournamentEngineManager.getTournamentOptions(selectedType);
      const defaultOptions = {};
      
      Object.entries(options).forEach(([key, config]) => {
        defaultOptions[key] = config.default;
      });
      
      setTournamentOptions(defaultOptions);
    }
  }, [selectedType]);

  useEffect(() => {
    // Validate current selection
    if (selectedType && players.length > 0) {
      const validationResult = TournamentEngineManager.validateTournamentConfig(
        selectedType, 
        players, 
        tournamentOptions
      );
      setValidation(validationResult);
    }
  }, [selectedType, players, tournamentOptions]);

  const handleTournamentChange = (tournamentId) => {
    setSelectedType(tournamentId);
    
    if (onTournamentSelect) {
      onTournamentSelect({
        tournamentId,
        options: tournamentOptions,
        validation
      });
    }
  };

  const handleOptionChange = (optionKey, value) => {
    const newOptions = { ...tournamentOptions, [optionKey]: value };
    setTournamentOptions(newOptions);
    
    if (onTournamentSelect) {
      onTournamentSelect({
        tournamentId: selectedType,
        options: newOptions,
        validation
      });
    }
  };

  const renderTournamentCard = (tournament) => {
    const isSelected = selectedType === tournament.id;
    const isCompatible = players.length >= tournament.minPlayers && players.length <= tournament.maxPlayers;
    const isRecommended = TournamentEngineManager.getRecommendedTournament(players.length) === tournament.id;
    
    const duration = TournamentEngineManager.estimateDuration(tournament.id, players.length);

    return (
      <div 
        key={tournament.id}
        className={`tournament-card ${isSelected ? 'selected' : ''} ${!isCompatible ? 'incompatible' : ''}`}
        onClick={() => !disabled && isCompatible && handleTournamentChange(tournament.id)}
      >
        <div className="tournament-header">
          <h3 className="tournament-name">
            {tournament.name}
            {isRecommended && <span className="recommended-badge">推薦</span>}
          </h3>
          <div className="tournament-difficulty">
            <span className={`difficulty-badge ${tournament.difficulty}`}>
              {tournament.difficulty === 'easy' ? '簡單' : 
               tournament.difficulty === 'medium' ? '中等' : '困難'}
            </span>
          </div>
        </div>
        
        <p className="tournament-description">{tournament.description}</p>
        
        <div className="tournament-details">
          <div className="detail-item">
            <span className="detail-label">選手數量:</span>
            <span className="detail-value">
              {tournament.minPlayers} - {tournament.maxPlayers} 人
            </span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">預估時間:</span>
            <span className="detail-value">{duration.formattedDuration}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">總場次:</span>
            <span className="detail-value">{duration.totalMatches} 場</span>
          </div>
        </div>
        
        <div className="tournament-features">
          {tournament.features.map((feature, index) => (
            <span key={index} className="feature-tag">{feature}</span>
          ))}
        </div>
        
        {!isCompatible && (
          <div className="incompatible-notice">
            需要 {tournament.minPlayers}-{tournament.maxPlayers} 位選手
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedOptions = () => {
    if (!selectedType || !showAdvanced) return null;
    
    const options = TournamentEngineManager.getTournamentOptions(selectedType);
    
    if (Object.keys(options).length === 0) {
      return (
        <div className="advanced-options">
          <p className="no-options">此賽制無額外設定選項</p>
        </div>
      );
    }

    return (
      <div className="advanced-options">
        <h4>進階設定</h4>
        {Object.entries(options).map(([key, config]) => (
          <div key={key} className="option-item">
            <label className="option-label">
              {config.label}
              {config.description && (
                <span className="option-description">{config.description}</span>
              )}
            </label>
            
            {config.type === 'boolean' && (
              <input
                type="checkbox"
                checked={tournamentOptions[key] || false}
                onChange={(e) => handleOptionChange(key, e.target.checked)}
                disabled={disabled}
                className="option-checkbox"
              />
            )}
            
            {config.type === 'number' && (
              <input
                type="number"
                value={tournamentOptions[key] || config.default}
                min={config.min}
                max={config.max}
                onChange={(e) => handleOptionChange(key, parseInt(e.target.value))}
                disabled={disabled}
                className="option-number"
              />
            )}
            
            {config.type === 'select' && (
              <select
                value={tournamentOptions[key] || config.default}
                onChange={(e) => handleOptionChange(key, e.target.value)}
                disabled={disabled}
                className="option-select"
              >
                {config.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderValidationMessages = () => {
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="validation-messages">
        {validation.errors.map((error, index) => (
          <div key={`error-${index}`} className="validation-error">
            ⚠️ {error}
          </div>
        ))}
        {validation.warnings.map((warning, index) => (
          <div key={`warning-${index}`} className="validation-warning">
            💡 {warning}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="tournament-selector">
      <div className="selector-header">
        <h2>選擇賽制</h2>
        <p className="player-count">
          當前選手數量: <strong>{players.length}</strong> 人
        </p>
      </div>

      {renderValidationMessages()}

      <div className="tournament-grid">
        {availableTournaments.map(renderTournamentCard)}
      </div>

      {selectedType && (
        <div className="advanced-section">
          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '隱藏' : '顯示'} 進階設定
            <span className={`toggle-arrow ${showAdvanced ? 'up' : 'down'}`}>▼</span>
          </button>
          
          {renderAdvancedOptions()}
        </div>
      )}

      {selectedType && validation.isValid && (
        <div className="selection-summary">
          <h4>選擇摘要</h4>
          <div className="summary-content">
            <p><strong>賽制:</strong> {availableTournaments.find(t => t.id === selectedType)?.name}</p>
            <p><strong>選手數量:</strong> {players.length} 人</p>
            <p><strong>預估時間:</strong> {TournamentEngineManager.estimateDuration(selectedType, players.length).formattedDuration}</p>
            <p><strong>總場次:</strong> {TournamentEngineManager.estimateDuration(selectedType, players.length).totalMatches} 場</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentSelector;