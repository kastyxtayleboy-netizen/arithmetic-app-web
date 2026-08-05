import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Tooltip from './Tooltip';
import AnimatedNumber from './AnimatedNumber';

// Box-Muller transform for normal distribution
function randomNormal() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const MonteCarlo = () => {
  const { t } = useLanguage();
  
  // States
  const [initCap, setInitCap] = useState(100000);
  const [monthlyContrib, setMonthlyContrib] = useState(15000);
  const [years, setYears] = useState(20);
  const [annualReturn, setAnnualReturn] = useState(10);
  const [volatility, setVolatility] = useState(15);
  const [simulations, setSimulations] = useState(200);

  // Results
  const [paths, setPaths] = useState([]);
  const [percentiles, setPercentiles] = useState({ p10: 0, p50: 0, p90: 0, p10Index: 0, p50Index: 0, p90Index: 0 });

  // Run Simulation
  useEffect(() => {
    const mu = annualReturn / 100;
    const sigma = volatility / 100;
    
    // Log-Normal parameters to precisely match the user's expected Arithmetic Mean and Variance
    // S_t = S_{t-1} * exp(m + s * Z)
    const expectedMean = 1 + mu;
    const expectedVar = sigma * sigma;
    
    const s = Math.sqrt(Math.log(1 + expectedVar / (expectedMean * expectedMean)));
    const m = Math.log(expectedMean) - (s * s) / 2;
    
    let newPaths = [];
    let finalValues = [];

    for (let sim = 0; sim < simulations; sim++) {
      let currentCap = initCap;
      let path = [currentCap];
      
      for (let y = 0; y < years; y++) {
        // Geometric return multiplier that ensures prices never go below 0
        let logNormalReturn = Math.exp(m + s * randomNormal());
        // Give contributions half a year's growth on average
        let yearlyContrib = monthlyContrib * 12;
        currentCap = currentCap * logNormalReturn + (yearlyContrib * (1 + (logNormalReturn - 1) / 2));
        
        path.push(currentCap);
      }
      newPaths.push(path);
      finalValues.push(currentCap);
    }

    finalValues.sort((a, b) => a - b);
    
    const p10Index = Math.floor(simulations * 0.1);
    const p50Index = Math.floor(simulations * 0.5);
    const p90Index = Math.floor(simulations * 0.9);

    setPercentiles({
      p10: finalValues[p10Index] || 0,
      p50: finalValues[p50Index] || 0,
      p90: finalValues[p90Index] || 0,
      p10Index,
      p50Index,
      p90Index
    });
    
    newPaths.sort((a, b) => a[a.length - 1] - b[b.length - 1]);
    setPaths(newPaths);
  }, [initCap, monthlyContrib, years, annualReturn, volatility, simulations]);

  // SVG Drawing Logic
  const svgWidth = 600;
  const svgHeight = 300;
  const margin = { top: 20, right: 20, bottom: 30, left: 20 };
  
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  const maxVal = useMemo(() => {
    if (!paths.length) return 1;
    // Cap the max value at p95 to avoid huge outliers ruining the scale
    const p95Index = Math.floor(simulations * 0.95);
    return paths[p95Index][paths[p95Index].length - 1] || 1;
  }, [paths, simulations]);

  const getCoordinates = (path) => {
    return path.map((val, idx) => {
      const x = (idx / years) * innerWidth;
      const clampedVal = Math.min(val, maxVal * 1.1); 
      const y = innerHeight - (clampedVal / (maxVal * 1.1)) * innerHeight;
      return `${x},${y}`;
    }).join(' L ');
  };

  return (
    <div className="calculator-wrapper">
      {/* LEFT PANEL: Inputs */}
      <div className="calculator-panel glass">
        <div className="panel-header">
          <h2>{t('monteCarlo.title')}</h2>
          <p>{t('monteCarlo.subtitle')}</p>
        </div>

        <div className="input-group">
          <Tooltip title={t('calc.initCap')} content={t('calc.initCapContent')}>
            <label>{t('calc.initCap')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={initCap} 
            onChange={(e) => setInitCap(e.target.value === '' ? '' : Number(e.target.value))}
            min="0"
          />
        </div>

        <div className="input-group">
          <Tooltip title={t('calc.monthContrib')} content={t('calc.monthContribContent')}>
            <label>{t('calc.monthContrib')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={monthlyContrib} 
            onChange={(e) => setMonthlyContrib(e.target.value === '' ? '' : Number(e.target.value))}
            min="0"
          />
        </div>

        <div className="input-group">
          <Tooltip title={t('calc.yearsTitleTooltip')} content={t('calc.yearsContent')}>
            <label>{t('calc.years')} ({years} {t('calc.yearsSuffix')})</label>
          </Tooltip>
          <input 
            type="range" 
            min="1" max="50" 
            value={years} 
            onChange={(e) => setYears(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <Tooltip title={t('calc.annualReturnTitle')} content={t('calc.annualReturnContent')}>
            <label>{t('calc.annualReturn')} ({annualReturn}%)</label>
          </Tooltip>
          <input 
            type="range" 
            min="0" max="30" step="0.5"
            value={annualReturn} 
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <Tooltip title={t('monteCarlo.volatilityTitle')} content={t('monteCarlo.volatilityContent')}>
            <label>{t('monteCarlo.volatility')} ({volatility}%)</label>
          </Tooltip>
          <input 
            type="range" 
            min="0" max="100" step="1"
            value={volatility} 
            onChange={(e) => setVolatility(Number(e.target.value))}
          />
        </div>

      </div>

      {/* RIGHT PANEL: Results */}
      <div className="results-panel glass">
        <h3 className="results-title">{t('monteCarlo.resultsTitle') ? t('monteCarlo.resultsTitle').replace('{years}', years) : 'Results'}</h3>
        
        <div className="result-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <Tooltip title={t('monteCarlo.p10Title')} content={t('monteCarlo.p10Content')} position="top">
            <span className="result-label" style={{ color: '#EF4444' }}>{t('monteCarlo.p10Title')}</span>
          </Tooltip>
          <div className="result-value" style={{ color: '#EF4444' }}>
            <AnimatedNumber value={Math.round(percentiles.p10)} /> ₽
          </div>
        </div>

        <div className="result-card" style={{ borderColor: 'rgba(16, 185, 129, 0.6)', background: 'rgba(16, 185, 129, 0.1)' }}>
          <Tooltip title={t('monteCarlo.p50Title')} content={t('monteCarlo.p50Content')} position="top">
            <span className="result-label" style={{ color: '#10B981' }}>{t('monteCarlo.p50Title')}</span>
          </Tooltip>
          <div className="result-value" style={{ color: '#10B981' }}>
            <AnimatedNumber value={Math.round(percentiles.p50)} /> ₽
          </div>
        </div>

        <div className="result-card" style={{ borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.05)' }}>
          <Tooltip title={t('monteCarlo.p90Title')} content={t('monteCarlo.p90Content')} position="top">
            <span className="result-label" style={{ color: '#3B82F6' }}>{t('monteCarlo.p90Title')}</span>
          </Tooltip>
          <div className="result-value" style={{ color: '#3B82F6' }}>
            <AnimatedNumber value={Math.round(percentiles.p90)} /> ₽
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ marginTop: '32px', position: 'relative', width: '100%', aspectRatio: '2/1', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="none">
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Draw faint paths first (max 50 for performance) */}
              {paths.slice(0, 50).map((path, idx) => {
                // If it's one of the percentiles, we'll draw it highlighted later
                const globalIdx = paths.indexOf(path);
                if (globalIdx === percentiles.p10Index || globalIdx === percentiles.p50Index || globalIdx === percentiles.p90Index) return null;
                return (
                  <path 
                    key={idx} 
                    d={`M ${getCoordinates(path)}`} 
                    fill="none" 
                    stroke="rgba(255, 255, 255, 0.05)" 
                    strokeWidth="1" 
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              
              {/* Draw P10 Path */}
              {paths[percentiles.p10Index] && (
                <path 
                  d={`M ${getCoordinates(paths[percentiles.p10Index])}`} 
                  fill="none" 
                  stroke="#EF4444" 
                  strokeWidth="3" 
                  vectorEffect="non-scaling-stroke"
                />
              )}
              
              {/* Draw P50 Path */}
              {paths[percentiles.p50Index] && (
                <path 
                  d={`M ${getCoordinates(paths[percentiles.p50Index])}`} 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="4" 
                  vectorEffect="non-scaling-stroke"
                />
              )}
              
              {/* Draw P90 Path */}
              {paths[percentiles.p90Index] && (
                <path 
                  d={`M ${getCoordinates(paths[percentiles.p90Index])}`} 
                  fill="none" 
                  stroke="#3B82F6" 
                  strokeWidth="3" 
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </g>
          </svg>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ⚠️ <strong>Важное допущение:</strong> Симуляция использует логнормальное распределение (геометрическое броуновское движение). 
            Она не учитывает рыночные шоки ("черных лебедей"), налоги, комиссии и смену налогового резидентства. Результаты являются вероятностными и не гарантируют будущую доходность.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonteCarlo;
