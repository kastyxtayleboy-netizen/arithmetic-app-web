import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Tooltip from './Tooltip';
import AnimatedNumber from './AnimatedNumber';

const GoalTracker = () => {
  const { t } = useLanguage();
  
  const [initCap, setInitCap] = useState(100000);
  const [monthlyContrib, setMonthlyContrib] = useState(25000);
  const [targetGoal, setTargetGoal] = useState(10000000); // 10M
  const [annualReturn, setAnnualReturn] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [indexInflation, setIndexInflation] = useState(false);

  // Helper to calculate months to goal
  const calculateMonthsToGoal = (startCap, monthly, goal, rate, infl, indexInf) => {
    const safeRate = Math.max(-99.9, rate);
    const safeInfl = Math.max(-99.9, infl);
    
    let currentNominal = startCap;
    let currentContrib = monthly;
    let months = 0;
    const monthlyRate = Math.pow(1 + safeRate / 100, 1 / 12) - 1;
    const monthlyInflation = Math.pow(1 + safeInfl / 100, 1 / 12) - 1;
    
    // Safety limit: 120 years
    const MAX_MONTHS = 1200;

    // Check if goal is already met
    if (startCap >= goal) return 0;

    while (months < MAX_MONTHS) {
      months++;
      currentNominal = currentNominal * (1 + monthlyRate) + currentContrib;
      
      // Index contribution once a year
      if (indexInf && months % 12 === 0) {
        currentContrib *= (1 + safeInfl / 100);
      }

      const realCap = currentNominal / Math.pow(1 + monthlyInflation, months);
      if (realCap >= goal) {
        return months;
      }
    }
    return -1; // Unreachable
  };

  // Binary search helper for suggestions
  const findRequiredContribution = (startCap, goal, rate, infl, indexInf, targetMonths) => {
    let low = 0;
    let high = goal; // In worst case you need to save the whole goal per month
    let best = -1;
    for (let i = 0; i < 50; i++) { // 50 iterations is enough for precision
      let mid = (low + high) / 2;
      let months = calculateMonthsToGoal(startCap, mid, goal, rate, infl, indexInf);
      if (months !== -1 && months <= targetMonths) {
        best = mid;
        high = mid; // Try to find a lower contribution
      } else {
        low = mid;
      }
    }
    return best !== -1 ? Math.ceil(best) : -1;
  };

  const results = useMemo(() => {
    const baseMonths = calculateMonthsToGoal(initCap, monthlyContrib, targetGoal, annualReturn, inflation, indexInflation);
    
    // Smart Suggestions (Targeting within 30 years or 10% faster)
    const targetHorizon = baseMonths === -1 ? 360 : Math.max(12, Math.floor(baseMonths * 0.9));
    
    // Suggestion 1: Extra Contribution
    let reqContrib = findRequiredContribution(initCap, targetGoal, annualReturn, inflation, indexInflation, targetHorizon);
    let extraContrib = reqContrib !== -1 ? Math.max(1000, reqContrib - monthlyContrib) : 5000;
    let suggContribMonths = reqContrib !== -1 ? calculateMonthsToGoal(initCap, monthlyContrib + extraContrib, targetGoal, annualReturn, inflation, indexInflation) : -1;

    // Suggestion 2: Increase Return by 2-5%
    let suggReturnMonths = calculateMonthsToGoal(initCap, monthlyContrib, targetGoal, annualReturn + 3, inflation, indexInflation);

    // Suggestion 3: Decrease Goal
    const decreasedGoal = targetGoal * 0.8;
    let suggGoalMonths = calculateMonthsToGoal(initCap, monthlyContrib, decreasedGoal, annualReturn, inflation, indexInflation);

    return {
      months: baseMonths,
      suggContribMonths,
      extraContribAmount: extraContrib,
      suggReturnMonths,
      suggGoalMonths,
      decreasedGoalAmount: decreasedGoal
    };
  }, [initCap, monthlyContrib, targetGoal, annualReturn, inflation, indexInflation]);

  const yearsDisplay = results.months > 0 ? Math.floor(results.months / 12) : 0;
  const monthsDisplay = results.months > 0 ? results.months % 12 : 0;

  return (
    <div className="calculator-wrapper">
      {/* LEFT PANEL: Inputs */}
      <div className="calculator-panel glass">
        <div className="panel-header">
          <h2>{t('goal.title')}</h2>
          <p>{t('goal.subtitle')}</p>
        </div>

        <div className="input-group">
          <Tooltip title={t('goal.targetTitleTooltip')} content={t('goal.targetContent')}>
            <label>{t('goal.targetTitle')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={targetGoal} 
            onChange={(e) => setTargetGoal(e.target.value === '' ? '' : Number(e.target.value))}
            min="0"
          />
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

        <div className="input-group checkbox-group">
          <input 
            type="checkbox" 
            id="indexInflationGoal" 
            checked={indexInflation} 
            onChange={(e) => setIndexInflation(e.target.checked)}
          />
          <Tooltip title={t('calc.indexInflation')} content={t('calc.indexInflationTooltip')}>
            <label htmlFor="indexInflationGoal">{t('calc.indexInflation')}</label>
          </Tooltip>
        </div>

        <div className="input-group">
          <Tooltip title={t('calc.annualReturnTitle')} content={t('calc.annualReturnContent')}>
            <label>{t('calc.annualReturn')} ({annualReturn}%)</label>
          </Tooltip>
          <input 
            type="range" 
            min="0" max="40" step="0.5"
            value={annualReturn} 
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <Tooltip title={t('calc.inflationTitle')} content={t('calc.inflationContent')}>
            <label>{t('calc.inflation')} ({inflation}%)</label>
          </Tooltip>
          <input 
            type="range" 
            min="0" max="25" step="0.5"
            value={inflation} 
            onChange={(e) => setInflation(Number(e.target.value))}
          />
        </div>
      </div>

      {/* RIGHT PANEL: Results */}
      <div className="results-panel glass">
        <h3 className="results-title">{t('goal.resultsTitle')}</h3>

        {results.months === -1 ? (
          <>
            <div className="result-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <h2 style={{ color: '#EF4444', fontSize: '1.5rem', marginBottom: '8px' }}>⚠️ Цель недостижима</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {t('goal.unreachable')}
              </p>
            </div>
            
            <h4 style={{ marginTop: '32px', marginBottom: '16px', color: 'var(--text-primary)' }}>💡 {t('goal.suggestionTitle')}</h4>
            
            {results.suggContribMonths !== -1 && (
              <div className="result-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {t('goal.suggIncreaseContribUnreachable')
                    .replace('{amount}', results.extraContribAmount.toLocaleString())
                    .replace('{years}', Math.floor(results.suggContribMonths / 12))
                    .replace('{months}', results.suggContribMonths % 12)}
                </p>
              </div>
            )}

            {results.suggReturnMonths !== -1 && (
              <div className="result-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {t('goal.suggIncreaseReturnUnreachable')
                    .replace('{years}', Math.floor(results.suggReturnMonths / 12))
                    .replace('{months}', results.suggReturnMonths % 12)}
                </p>
              </div>
            )}

            {results.suggGoalMonths !== -1 && (
              <div className="result-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {t('goal.suggDecreaseGoalUnreachable')
                    .replace('{newGoal}', results.decreasedGoalAmount.toLocaleString())
                    .replace('{years}', Math.floor(results.suggGoalMonths / 12))
                    .replace('{months}', results.suggGoalMonths % 12)}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="result-card" style={{ borderColor: 'rgba(16, 185, 129, 0.6)', background: 'rgba(16, 185, 129, 0.1)', textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '4rem', fontWeight: 'bold', color: '#10B981', lineHeight: '1' }}>
                  <AnimatedNumber value={yearsDisplay} formatCurrency={false} />
                </span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{t('goal.yearsLabel')}</span>
                
                {monthsDisplay > 0 && (
                  <>
                    <span style={{ fontSize: '4rem', fontWeight: 'bold', color: '#10B981', lineHeight: '1', marginLeft: '16px' }}>
                      <AnimatedNumber value={monthsDisplay} formatCurrency={false} />
                    </span>
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{t('goal.monthsLabel')}</span>
                  </>
                )}
              </div>
            </div>

            {/* Smart Suggestions */}
            <h4 style={{ marginTop: '32px', marginBottom: '16px', color: 'var(--text-primary)' }}>💡 {t('goal.suggestionTitle')}</h4>
            
            {results.suggContribMonths !== -1 && results.months - results.suggContribMonths > 0 && (
              <div className="result-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {t('goal.suggIncreaseContrib')
                    .replace('{amount}', results.extraContribAmount.toLocaleString())
                    .replace('{months}', results.months - results.suggContribMonths)}
                </p>
              </div>
            )}

            {results.suggReturnMonths !== -1 && results.months - results.suggReturnMonths > 0 && (
              <div className="result-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {t('goal.suggIncreaseReturn')
                    .replace('{months}', results.months - results.suggReturnMonths)}
                </p>
              </div>
            )}

            {results.suggGoalMonths !== -1 && (
              <div className="result-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {t('goal.suggDecreaseGoal')
                    .replace('{newGoal}', results.decreasedGoalAmount.toLocaleString())
                    .replace('{years}', Math.floor(results.suggGoalMonths / 12))
                    .replace('{months}', results.suggGoalMonths % 12)}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
