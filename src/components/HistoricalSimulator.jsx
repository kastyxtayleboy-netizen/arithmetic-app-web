import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';
import AnimatedNumber from './AnimatedNumber';
import Slider from './Slider';
import { useLanguage } from '../contexts/LanguageContext';
import './Calculator.css';

// 2005 - 2023 
const historicalData = {
  moex: [
    { year: 2005, return: 83.3 },
    { year: 2006, return: 67.5 },
    { year: 2007, return: 11.5 },
    { year: 2008, return: -67.2 },
    { year: 2009, return: 119.3 },
    { year: 2010, return: 22.5 },
    { year: 2011, return: -17.0 },
    { year: 2012, return: 5.3 },
    { year: 2013, return: 2.0 },
    { year: 2014, return: -7.1 },
    { year: 2015, return: 26.1 },
    { year: 2016, return: 26.8 },
    { year: 2017, return: -5.5 },
    { year: 2018, return: 11.8 },
    { year: 2019, return: 28.6 },
    { year: 2020, return: 8.0 },
    { year: 2021, return: 15.1 },
    { year: 2022, return: -42.9 },
    { year: 2023, return: 43.8 },
  ],
  sp500: [
    { year: 2005, return: 4.9 },
    { year: 2006, return: 15.8 },
    { year: 2007, return: 5.5 },
    { year: 2008, return: -37.0 },
    { year: 2009, return: 26.5 },
    { year: 2010, return: 15.1 },
    { year: 2011, return: 2.1 },
    { year: 2012, return: 16.0 },
    { year: 2013, return: 32.4 },
    { year: 2014, return: 13.7 },
    { year: 2015, return: 1.4 },
    { year: 2016, return: 12.0 },
    { year: 2017, return: 21.8 },
    { year: 2018, return: -4.4 },
    { year: 2019, return: 31.5 },
    { year: 2020, return: 18.4 },
    { year: 2021, return: 28.7 },
    { year: 2022, return: -18.1 },
    { year: 2023, return: 26.3 },
  ]
};

const HistoricalSimulator = () => {
  const { t } = useLanguage();
  const [market, setMarket] = useState('moex');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(15000);
  const [inflation, setInflation] = useState(7);
  const [indexInflation, setIndexInflation] = useState(false);
  
  const [results, setResults] = useState({
    finalBalanceNominal: 0,
    finalBalanceReal: 0,
    totalInvested: 0,
    profitOnly: 0,
    years: 0
  });

  useEffect(() => {
    const data = historicalData[market];
    const initCap = Number(initialCapital) || 0;
    const monthlyContrib = Number(monthlyContribution) || 0;
    
    let balanceNominal = initCap;
    let currentMonthlyContribNominal = monthlyContrib;
    let totalInvestedNominal = initCap;
    
    let balanceReal = initCap;
    let currentMonthlyContribReal = monthlyContrib;

    // Simulate year by year
    for (let i = 0; i < data.length; i++) {
      const annualReturnRate = data[i].return / 100;
      
      // 1. Nominal logic (contributions grow with inflation to maintain lifestyle)
      const yearContribNominal = currentMonthlyContribNominal * 12;
      balanceNominal = (balanceNominal * (1 + annualReturnRate)) + (yearContribNominal * (1 + annualReturnRate / 2));
      totalInvestedNominal += yearContribNominal;
      
      if (indexInflation) {
        currentMonthlyContribNominal *= (1 + inflation / 100);
      }
      
      // 2. Real logic (flat contributions, real interest rate via Fisher equation)
      const realAnnualRate = (1 + annualReturnRate) / (1 + inflation / 100) - 1;
      const yearContribReal = currentMonthlyContribReal * 12;
      balanceReal = (balanceReal * (1 + realAnnualRate)) + (yearContribReal * (1 + realAnnualRate / 2));
      
      if (!indexInflation) {
        currentMonthlyContribReal /= (1 + inflation / 100);
      }
    }

    setResults({
      finalBalanceNominal: Math.round(balanceNominal),
      finalBalanceReal: Math.round(balanceReal),
      totalInvested: Math.round(totalInvestedNominal),
      profitOnly: Math.round(balanceNominal - totalInvestedNominal),
      years: data.length
    });
  }, [market, initialCapital, monthlyContribution, inflation, indexInflation]);

  const formatCurrency = (value) => {
    const curr = market === 'sp500' ? 'USD' : 'RUB';
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(value);
  };

  const currentData = {
    name: market === 'sp500' ? t('hist.marketSp500') : t('hist.marketMoex')
  };

  return (
    <div className="calculator-wrapper">
      <div className="calculator-panel glass">
        <h2 className="calc-title">{t('hist.title')}</h2>
        <p className="calc-subtitle">{t('hist.subtitle')}</p>
        
        <div className="input-group">
          <label>{t('hist.market')}</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              className={`tab-btn ${market === 'moex' ? 'active' : ''}`}
              onClick={() => setMarket('moex')}
              style={{ flex: 1, padding: '10px' }}
            >
              🇷🇺 {t('hist.marketMoex')}
            </button>
            <button 
              className={`tab-btn ${market === 'sp500' ? 'active' : ''}`}
              onClick={() => setMarket('sp500')}
              style={{ flex: 1, padding: '10px' }}
            >
              🇺🇸 {t('hist.marketSp500')}
            </button>
          </div>
        </div>

        <div className="input-group" style={{ marginTop: '20px' }}>
          <Tooltip 
            title={t('calc.initCap')} 
            content={t('calc.initCapContent')}
          >
            <label>{t('calc.initCap')} ({market === 'sp500' ? '$' : '₽'})</label>
          </Tooltip>
          <input 
            type="number" 
            value={initialCapital} 
            onChange={(e) => setInitialCapital(e.target.value === '' ? '' : Number(e.target.value))} 
          />
        </div>

        <div className="input-group">
          <Tooltip 
            title={t('hist.contribTitle')} 
            content={t('hist.contribContent')}
          >
            <label>{t('hist.contribLabel')} ({market === 'sp500' ? '$' : '₽'})</label>
          </Tooltip>
          <input 
            type="number" 
            value={monthlyContribution} 
            onChange={(e) => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <input 
              type="checkbox" 
              id="indexInflationHist"
              checked={indexInflation} 
              onChange={(e) => setIndexInflation(e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
            <Tooltip title={t('calc.indexInflation')} content={t('calc.indexInflationTooltip')}>
              <label htmlFor="indexInflationHist" style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer' }}>
                {t('calc.indexInflation')}
              </label>
            </Tooltip>
          </div>
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('calc.inflationTitle')} 
              content={t('calc.inflationContent')}
            >
              <label>{t('calc.inflation')} ({inflation}%)</label>
            </Tooltip>
          </div>
          <Slider min={0} max={25} step={0.1} value={inflation} onChange={setInflation} />
        </div>

        <div style={{ marginTop: '40px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>{t('hist.dataSourceLabel')}</strong> {t('hist.dataSource').replace('{name}', currentData.name)} (с 2005 по 2023 год).
          </p>
          <p style={{ fontSize: '0.85rem', color: '#ffa940', marginTop: '12px' }}>
            ⚠️ <strong>Важное допущение:</strong> Симулятор использует реальные исторические рыночные доходности, но накладывает на них <strong>фиксированную пользовательскую инфляцию</strong>. Это означает, что исторические кризисы (например, 2008 или 2022) моделируются без учета реальной инфляции того времени.
          </p>
        </div>
      </div>

      <div className="results-panel glass">
        <h3>{t('hist.resultsTitle')} ({results.years} {t('hist.resultsYears')})</h3>
        
        <div className="result-card primary-result">
          <Tooltip 
            title={t('calc.finalNominalTitle')} 
            content={t('calc.finalNominalContent')}
          >
            <span className="result-label">{t('calc.finalNominalLabel')}</span>
          </Tooltip>
          <div className="result-value"><AnimatedNumber value={results.finalBalanceNominal} currency={market === 'sp500' ? 'USD' : 'RUB'} /></div>
        </div>

        <div className="result-card secondary-result">
          <Tooltip 
            title={t('calc.finalRealTitle')} 
            content={t('calc.finalRealContent')}
          >
            <span className="result-label">{t('calc.finalRealLabel')}</span>
          </Tooltip>
          <div className="result-value"><AnimatedNumber value={results.finalBalanceReal} currency={market === 'sp500' ? 'USD' : 'RUB'} /></div>
        </div>

        <div className="result-breakdown">
          <div className="breakdown-item">
            <span className="dot dot-invested"></span>
            <div>
              <span className="label">{t('hist.invested')}</span>
              <span className="val">{formatCurrency(results.totalInvested)}</span>
            </div>
          </div>
          <div className="breakdown-item">
            <span className="dot dot-profit"></span>
            <div>
              <Tooltip 
                title={t('hist.profitTitle')} 
                content={t('hist.profitContent')}
              >
                <span className="label">{t('hist.profitLabel')}</span>
              </Tooltip>
              <span className="val">{formatCurrency(results.profitOnly)}</span>
            </div>
          </div>
        </div>

        <div className="visual-bar">
          <div 
            className="bar-invested" 
            style={{ width: `${Math.max(0, Math.min(100, (results.totalInvested / results.finalBalanceNominal) * 100))}%` }}
          ></div>
          <div 
            className="bar-profit" 
            style={{ width: `${Math.max(0, Math.min(100, ((results.finalBalanceNominal - results.totalInvested) / results.finalBalanceNominal) * 100))}%` }}
          ></div>
        </div>
        <p className="note" style={{marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', borderLeft: '4px solid #f59e0b', paddingLeft: '10px'}}>
          {t('hist.realWarning')}
        </p>
      </div>
    </div>
  );
};

export default HistoricalSimulator;
