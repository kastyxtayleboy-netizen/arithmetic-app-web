import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';
import AnimatedNumber from './AnimatedNumber';
import Slider from './Slider';
import { useLanguage } from '../contexts/LanguageContext';
import './Calculator.css';

const Comparison = () => {
  const { t } = useLanguage();
  const [initialCapital, setInitialCapital] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(10000);
  const [indexInflation, setIndexInflation] = useState(false);
  const [years, setYears] = useState(15);
  const [inflation, setInflation] = useState(7);
  const [depositRate, setDepositRate] = useState(8); // Nominal deposit rate
  const [investRate, setInvestRate] = useState(15); // Nominal invest rate

  const [results, setResults] = useState({
    cashReal: 0,
    depositReal: 0,
    investReal: 0
  });

  useEffect(() => {
    const months = years * 12;
    const initCap = Number(initialCapital) || 0;
    const monthlyContrib = Number(monthlyContribution) || 0;

    // Safe rates
    const safeInflation = Math.max(-99.9, inflation);
    const safeDeposit = Math.max(-99.9, depositRate);
    const safeInvest = Math.max(-99.9, investRate);

    // Real Rates (Fisher equation for exact inflation discounting)
    // Cash earns 0% nominal return.
    const realCashAnnual = (1 + 0) / (1 + safeInflation / 100) - 1;
    const realCashMonthly = Math.pow(1 + realCashAnnual, 1/12) - 1;

    const realDepositAnnual = (1 + safeDeposit / 100) / (1 + safeInflation / 100) - 1;
    const realDepositMonthly = Math.pow(1 + realDepositAnnual, 1/12) - 1;

    const realInvestAnnual = (1 + safeInvest / 100) / (1 + safeInflation / 100) - 1;
    const realInvestMonthly = Math.pow(1 + realInvestAnnual, 1/12) - 1;

    let cashReal = initCap;
    let depositReal = initCap;
    let investReal = initCap;
    let currentMonthlyContribReal = monthlyContrib;
    let realInflationMonthlyRate = Math.pow(1 + safeInflation / 100, 1/12) - 1;

    for (let i = 0; i < months; i++) {
      cashReal = cashReal * (1 + realCashMonthly) + currentMonthlyContribReal;
      depositReal = depositReal * (1 + realDepositMonthly) + currentMonthlyContribReal;
      investReal = investReal * (1 + realInvestMonthly) + currentMonthlyContribReal;
      if (!indexInflation) {
          currentMonthlyContribReal /= (1 + realInflationMonthlyRate);
      }
    }

    setResults({
      cashReal: Math.round(cashReal),
      depositReal: Math.round(depositReal),
      investReal: Math.round(investReal)
    });
  }, [initialCapital, monthlyContribution, years, inflation, depositRate, investRate, indexInflation]);



  const maxValue = Math.max(results.cashReal, results.depositReal, results.investReal, 1);

  return (
    <div className="calculator-wrapper">
      <div className="calculator-panel glass">
        <h2 className="calc-title">{t('comp.title')}</h2>
        <p className="calc-subtitle">{t('comp.subtitle')}</p>
        
        <div className="input-group">
          <label>{t('comp.initCap')} (₽)</label>
          <input 
            type="number" 
            value={initialCapital} 
            onChange={(e) => setInitialCapital(e.target.value === '' ? '' : Number(e.target.value))} 
          />
        </div>

        <div className="input-group">
          <label>{t('comp.contrib')} (₽)</label>
          <input 
            type="number" 
            value={monthlyContribution} 
            onChange={(e) => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <input 
              type="checkbox" 
              id="indexInflationComp"
              checked={indexInflation} 
              onChange={(e) => setIndexInflation(e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
            <Tooltip title={t('calc.indexInflation')} content={t('calc.indexInflationTooltip')}>
              <label htmlFor="indexInflationComp" style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer' }}>
                {t('calc.indexInflation')}
              </label>
            </Tooltip>
          </div>
        </div>

        <div className="input-group">
          <div className="slider-header">
            <label>{t('comp.years')} ({years} {t('comp.yearsSuffix')})</label>
          </div>
          <Slider min={1} max={40} value={years} onChange={setYears} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <label>{t('comp.inflation')} ({inflation}%)</label>
          </div>
          <Slider min={2} max={25} step={0.1} value={inflation} onChange={setInflation} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <label>{t('comp.deposit')} ({depositRate}%)</label>
          </div>
          <Slider min={1} max={25} step={0.1} value={depositRate} onChange={setDepositRate} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('comp.investTitle')} 
              content={t('comp.investContent')}
            >
              <label>{t('comp.investLabel')} ({investRate}%)</label>
            </Tooltip>
          </div>
          <Slider min={5} max={30} step={0.1} value={investRate} onChange={setInvestRate} />
        </div>
      </div>

      <div className="results-panel glass">
        <h3>{t('comp.resultsTitle')}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {t('comp.resultsNote')}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Tooltip title={t('comp.cashTitle')} content={t('comp.cashContent')}>
                <span>{t('comp.cashLabel')}</span>
              </Tooltip>
              <strong><AnimatedNumber value={results.cashReal} /></strong>
            </div>
            <div className="visual-bar">
              <div style={{ background: '#EF4444', height: '100%', width: `${Math.max(2, (Math.max(0, results.cashReal) / maxValue) * 100)}%`, transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Tooltip title={t('comp.depoTitle')} content={t('comp.depoContent')}>
                <span>{t('comp.depoLabel')}</span>
              </Tooltip>
              <strong><AnimatedNumber value={results.depositReal} /></strong>
            </div>
            <div className="visual-bar">
              <div style={{ background: '#F59E0B', height: '100%', width: `${Math.max(2, (Math.max(0, results.depositReal) / maxValue) * 100)}%`, transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Tooltip title={t('comp.idxTitle')} content={t('comp.idxContent')}>
                <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{t('comp.idxLabel')}</span>
              </Tooltip>
              <strong style={{ color: 'var(--accent-color)' }}><AnimatedNumber value={results.investReal} /></strong>
            </div>
            <div className="visual-bar">
              <div style={{ background: 'var(--accent-color)', height: '100%', width: `${Math.max(2, (Math.max(0, results.investReal) / maxValue) * 100)}%`, transition: 'width 0.5s ease-out', boxShadow: 'var(--shadow-glow)' }}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Comparison;
