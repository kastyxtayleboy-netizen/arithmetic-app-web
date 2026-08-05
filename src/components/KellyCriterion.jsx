import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';
import AnimatedNumber from './AnimatedNumber';
import Slider from './Slider';
import { useLanguage } from '../contexts/LanguageContext';
import './Calculator.css';

const KellyCriterion = () => {
  const { t } = useLanguage();
  const [capital, setCapital] = useState(100000);
  const [winProb, setWinProb] = useState(55);
  const [profit, setProfit] = useState(20);
  const [loss, setLoss] = useState(10);
  const [fraction, setFraction] = useState(0.5);

  const [results, setResults] = useState({
    optPercent: 0,
    optAmount: 0,
    ev: 0,
    isNegative: false,
    isOver100: false
  });

  useEffect(() => {
    const W = winProb / 100;
    const L = 1 - W;
    const Reward = Number(profit);
    const Risk = Number(loss);
    
    let ev = 0;
    let kellyP = 0;

    if (Risk > 0 && Reward > 0) {
      ev = (W * Reward) - (L * Risk);
      kellyP = (W / (Risk / 100)) - (L / (Reward / 100));
      kellyP *= 100; // Convert to percentage
    } else if (Risk === 0 && Reward > 0) {
       kellyP = 100; // Safe to bet everything if 0 risk, but mathematically it's infinity
       ev = W * Reward;
    }

    const finalPercent = kellyP * fraction;

    setResults({
      optPercent: Math.max(0, finalPercent),
      optAmount: Math.max(0, finalPercent / 100 * (Number(capital) || 0)),
      ev: ev,
      isNegative: ev <= 0 || kellyP <= 0,
      isOver100: finalPercent > 100
    });
  }, [capital, winProb, profit, loss, fraction]);

  return (
    <div className="calculator-wrapper">
      <div className="calculator-panel glass">
        <h2 className="calc-title">{t('kelly.title')}</h2>
        <p className="calc-subtitle">{t('kelly.subtitle')}</p>
        
        <div className="input-group">
          <Tooltip title={t('kelly.capitalTitle')} content={t('kelly.capitalContent')}>
            <label>{t('kelly.capital')}</label>
          </Tooltip>
          <input 
            type="number" 
            value={capital} 
            onChange={(e) => setCapital(e.target.value === '' ? '' : Number(e.target.value))} 
          />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip title={t('kelly.winProbTitle')} content={t('kelly.winProbContent')}>
              <label>{t('kelly.winProb')} ({winProb}%)</label>
            </Tooltip>
          </div>
          <Slider min={1} max={99} step={1} value={winProb} onChange={setWinProb} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip title={t('kelly.profitTitle')} content={t('kelly.profitContent')}>
              <label>{t('kelly.profit')} ({profit}%)</label>
            </Tooltip>
          </div>
          <Slider min={1} max={500} step={1} value={profit} onChange={setProfit} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip title={t('kelly.lossTitle')} content={t('kelly.lossContent')}>
              <label>{t('kelly.loss')} ({loss}%)</label>
            </Tooltip>
          </div>
          <Slider min={0} max={100} step={1} value={loss} onChange={setLoss} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip title={t('kelly.fractionTitle')} content={t('kelly.fractionContent')}>
              <label>{t('kelly.fraction')}</label>
            </Tooltip>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              className={`tab-btn ${fraction === 1.0 ? 'active' : ''}`}
              onClick={() => setFraction(1.0)}
              style={{ flex: 1, padding: '8px' }}
            >
              {t('kelly.fullKelly')}
            </button>
            <button 
              className={`tab-btn ${fraction === 0.5 ? 'active' : ''}`}
              onClick={() => setFraction(0.5)}
              style={{ flex: 1, padding: '8px' }}
            >
              {t('kelly.halfKelly')}
            </button>
            <button 
              className={`tab-btn ${fraction === 0.25 ? 'active' : ''}`}
              onClick={() => setFraction(0.25)}
              style={{ flex: 1, padding: '8px' }}
            >
              {t('kelly.quarterKelly')}
            </button>
          </div>
        </div>
      </div>

      <div className="results-panel glass">
        <h3>{t('kelly.resultsTitle')}</h3>
        
        {results.isNegative ? (
          <div className="result-card secondary-result" style={{ backgroundColor: 'rgba(255, 77, 79, 0.1)', borderColor: '#ff4d4f' }}>
            <span className="result-label" style={{ color: '#ff4d4f' }}>⚠️ {t('kelly.warningNegative')}</span>
            <div className="result-value">0%</div>
          </div>
        ) : (
          <>
            <div className="result-card primary-result" style={results.isOver100 ? { backgroundColor: 'rgba(255, 169, 64, 0.1)', borderColor: '#ffa940' } : {}}>
              <Tooltip title={t('kelly.optPercentTitle')} content={t('kelly.optPercentContent')}>
                <span className="result-label" style={results.isOver100 ? { color: '#ffa940' } : {}}>
                  {t('kelly.optPercent')}
                </span>
              </Tooltip>
              <div className="result-value" style={results.isOver100 ? { color: '#ffa940' } : {}}>
                {results.optPercent.toFixed(2)}%
              </div>
              {results.isOver100 && (
                <div style={{ fontSize: '0.8rem', color: '#ffa940', marginTop: '8px' }}>
                  {t('kelly.warningOver100')}
                </div>
              )}
            </div>

            <div className="result-card secondary-result">
              <Tooltip title={t('kelly.optAmountTitle')} content={t('kelly.optAmountContent')}>
                <span className="result-label">{t('kelly.optAmount')}</span>
              </Tooltip>
              <div className="result-value"><AnimatedNumber value={results.optAmount} /></div>
            </div>
          </>
        )}

        <div className="result-breakdown" style={{ marginTop: '30px' }}>
          <div className="breakdown-item">
            <span className="dot" style={{ background: results.ev > 0 ? 'var(--primary-color)' : '#ff4d4f' }}></span>
            <div>
              <Tooltip title={t('kelly.evTitle')} content={t('kelly.evContent')}>
                <span className="label">{t('kelly.ev')}</span>
              </Tooltip>
              <span className="val" style={{ color: results.ev > 0 ? 'var(--primary-color)' : '#ff4d4f' }}>
                {results.ev > 0 ? '+' : ''}{results.ev.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default KellyCriterion;
