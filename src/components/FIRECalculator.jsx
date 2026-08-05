import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Tooltip from './Tooltip';
import AnimatedNumber from './AnimatedNumber';
import Slider from './Slider';
import { useLanguage } from '../contexts/LanguageContext';
import './Calculator.css';

const FIRECalculator = () => {
  const { t } = useLanguage();
  const [monthlyExpenses, setMonthlyExpenses] = useLocalStorage('fire_monthlyExpenses', 100000);
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useLocalStorage('fire_safeWithdrawalRate', 4);
  const [currentCapital, setCurrentCapital] = useLocalStorage('fire_currentCapital', 500000);
  const [monthlyContribution, setMonthlyContribution] = useLocalStorage('fire_monthlyContribution', 30000);
  const [indexInflation, setIndexInflation] = useLocalStorage('fire_indexInflation', false);
  const [annualReturn, setAnnualReturn] = useLocalStorage('fire_annualReturn', 15); // Nominal return
  const [inflation, setInflation] = useLocalStorage('fire_inflation', 7);
  const [useTax, setUseTax] = useLocalStorage('fire_useTax', false);

  const [results, setResults] = useState({
    fireTarget: 0,
    yearsToFire: 0
  });

  useEffect(() => {
    // Target Capital = Annual Expenses / Safe Withdrawal Rate
    const expenses = Number(monthlyExpenses) || 0;
    
    // Safe rates
    const safeSwr = Math.max(0.1, safeWithdrawalRate);
    const safeAnnualReturn = Math.max(-99.9, annualReturn);
    const safeInflation = Math.max(-99.9, inflation);

    // Учет налогов НДФЛ при изъятии (если применимо)
    const taxRate = useTax ? 0.13 : 0;
    const grossExpenses = expenses / (1 - taxRate);

    // Целевой капитал по правилу 4% (или другому)
    const target = (grossExpenses * 12) / (safeSwr / 100);
    
    // Начинаем с нуля
    let current = Number(currentCapital) || 0;
    let months = 0;
    // Real Return calculated via Fisher equation
    const realAnnualRate = (1 + safeAnnualReturn / 100) / (1 + safeInflation / 100) - 1;
    const monthlyRate = Math.pow(1 + realAnnualRate, 1/12) - 1;
    let realInflationMonthlyRate = Math.pow(1 + safeInflation / 100, 1/12) - 1;
    let currentMonthlyContribReal = Number(monthlyContribution) || 0;

    // Failsafe to prevent infinite loops (max 100 years)
    while (current < target && months < 1200) {
      current = current * (1 + monthlyRate) + currentMonthlyContribReal;
      if (!indexInflation) {
          currentMonthlyContribReal /= (1 + realInflationMonthlyRate);
      }
      months++;
    }

    setResults({
      fireTarget: Math.round(target),
      yearsToFire: months >= 1200 ? -1 : +(months / 12).toFixed(1)
    });
  }, [monthlyExpenses, safeWithdrawalRate, currentCapital, monthlyContribution, annualReturn, inflation, indexInflation, useTax]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="calculator-wrapper">
      <div className="calculator-panel glass">
        <h2 className="calc-title">{t('fire.title')}</h2>
        <p className="calc-subtitle">{t('fire.subtitle')}</p>
        
        <div className="input-group">
          <Tooltip 
            title={t('fire.expensesTitle')} 
            content={t('fire.expensesContent')}
          >
            <label>{t('fire.expensesLabel')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={monthlyExpenses} 
            onChange={(e) => setMonthlyExpenses(e.target.value === '' ? '' : Number(e.target.value))} 
          />
          <div className="checkbox-wrapper" style={{ marginTop: '10px' }}>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={useTax} 
                onChange={(e) => setUseTax(e.target.checked)} 
              />
              <span className="checkbox-custom"></span>
              {t('fire.useTax')}
            </label>
            <Tooltip title={t('fire.useTax')} content={t('fire.useTaxTooltip')} hideIcon={true}>
              <span className="info-icon" style={{ marginLeft: '5px' }}>?</span>
            </Tooltip>
          </div>
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('fire.swrTitle')} 
              content={t('fire.swrContent')}
            >
              <label>{t('fire.swrLabel')} ({safeWithdrawalRate}%)</label>
            </Tooltip>
          </div>
          <Slider min={2} max={7} step={0.1} value={safeWithdrawalRate} onChange={setSafeWithdrawalRate} />
        </div>

        <div className="input-group">
          <Tooltip 
            title={t('fire.currentCapTitle')} 
            content={t('fire.currentCapContent')}
          >
            <label>{t('fire.currentCapLabel')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={currentCapital} 
            onChange={(e) => setCurrentCapital(e.target.value === '' ? '' : Number(e.target.value))} 
          />
        </div>

        <div className="input-group">
          <Tooltip 
            title={t('fire.contribTitle')} 
            content={t('fire.contribContent')}
          >
            <label>{t('fire.contribLabel')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={monthlyContribution} 
            onChange={(e) => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <input 
              type="checkbox" 
              id="indexInflationFire"
              checked={indexInflation} 
              onChange={(e) => setIndexInflation(e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
            <Tooltip title={t('calc.indexInflation')} content={t('calc.indexInflationTooltip')}>
              <label htmlFor="indexInflationFire" style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer' }}>
                {t('calc.indexInflation')}
              </label>
            </Tooltip>
          </div>
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('fire.returnTitle')} 
              content={t('fire.returnContent')}
            >
              <label>{t('fire.returnLabel')} ({annualReturn}%)</label>
            </Tooltip>
          </div>
          <Slider min={1} max={30} step={0.1} value={annualReturn} onChange={setAnnualReturn} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('fire.inflationTitle')} 
              content={t('fire.inflationContent')}
            >
              <label>{t('fire.inflationLabel')} ({inflation}%)</label>
            </Tooltip>
          </div>
          <Slider min={0} max={25} step={0.1} value={inflation} onChange={setInflation} />
        </div>
      </div>

      <div className="results-panel glass">
        <h3>{t('fire.targetTitle')}</h3>
        
        <div className="result-card primary-result">
          <Tooltip 
            title={t('fire.fireTargetTitle')} 
            content={t('fire.fireTargetContent')}
          >
            <span className="result-label">{t('fire.fireTargetLabel')}</span>
          </Tooltip>
          <div className="result-value"><AnimatedNumber value={results.fireTarget} /></div>
        </div>

        <div className="result-card secondary-result">
          <Tooltip 
            title={t('fire.yearsTitle')} 
            content={t('fire.yearsContent')}
          >
            <span className="result-label">{t('fire.yearsLabel')}</span>
          </Tooltip>
          <div className="result-value">
            {results.yearsToFire === -1 ? t('fire.unreachable') : `${results.yearsToFire} ${t('fire.yearsValueSuffix')}`}
          </div>
        </div>
        
        <div className="result-breakdown" style={{ marginTop: '40px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>{t('fire.howItWorks').split(':')[0]}:</strong> {t('fire.howItWorks').replace('{month}', formatCurrency(monthlyExpenses)).replace('{year}', formatCurrency(monthlyExpenses * 12)).replace('{rate}', safeWithdrawalRate).split(':')[1]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FIRECalculator;
