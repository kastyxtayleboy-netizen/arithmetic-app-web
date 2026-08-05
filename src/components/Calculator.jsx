import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Tooltip from './Tooltip';
import AnimatedNumber from './AnimatedNumber';
import Slider from './Slider';
import ReceiptModal from './ReceiptModal';
import { Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Calculator.css';

const Calculator = () => {
  const { t } = useLanguage();
  const [initialCapital, setInitialCapital] = useLocalStorage('calc_initialCapital', 100000);
  const [monthlyContribution, setMonthlyContribution] = useLocalStorage('calc_monthlyContribution', 15000);
  const [annualReturn, setAnnualReturn] = useLocalStorage('calc_annualReturn', 10);
  const [inflationRate, setInflationRate] = useLocalStorage('calc_inflationRate', 6);
  const [years, setYears] = useLocalStorage('calc_years', 20);
  const [indexInflation, setIndexInflation] = useLocalStorage('calc_indexInflation', false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  
  const [results, setResults] = useState({
    totalInvested: 0,
    finalBalanceNominal: 0,
    finalBalanceReal: 0,
    profitOnly: 0
  });

  useEffect(() => {
    const months = years * 12;
    const initCap = Number(initialCapital) || 0;
    const monthlyContrib = Number(monthlyContribution) || 0;

    // Safe rates to prevent division by zero or NaN
    const safeAnnualReturn = Math.max(-99.9, annualReturn);
    const safeInflationRate = Math.max(-99.9, inflationRate);

    // 1. Real Calculation (Purchasing Power in today's money)
    const realAnnualRate = (1 + safeAnnualReturn / 100) / (1 + safeInflationRate / 100) - 1;
    const realMonthlyRate = Math.pow(1 + realAnnualRate, 1/12) - 1;

    let currentReal = initCap;
    let totalInvestedReal = initCap;
    let currentMonthlyContribReal = monthlyContrib;
    let realInflationMonthlyRate = Math.pow(1 + safeInflationRate / 100, 1/12) - 1;

    for (let i = 0; i < months; i++) {
      currentReal = currentReal * (1 + realMonthlyRate) + currentMonthlyContribReal;
      totalInvestedReal += currentMonthlyContribReal;
      if (!indexInflation) {
          currentMonthlyContribReal /= (1 + realInflationMonthlyRate);
      }
    }

    // 2. Nominal Calculation (Actual account balance, contributions grow with inflation)
    const nominalMonthlyRate = Math.pow(1 + safeAnnualReturn / 100, 1/12) - 1;
    let currentNominal = initCap;
    let currentMonthlyContribNominal = monthlyContrib;
    let totalInvestedNominal = initCap;

    for (let y = 0; y < years; y++) {
      for (let m = 0; m < 12; m++) {
        currentNominal = currentNominal * (1 + nominalMonthlyRate) + currentMonthlyContribNominal;
        totalInvestedNominal += currentMonthlyContribNominal;
      }
      if (indexInflation) {
        currentMonthlyContribNominal *= (1 + safeInflationRate / 100);
      }
    }

    setResults({
      totalInvested: Math.round(totalInvestedNominal),
      finalBalanceNominal: Math.round(currentNominal),
      finalBalanceReal: Math.round(currentReal),
      profitOnly: Math.round(currentNominal - totalInvestedNominal)
    });
  }, [initialCapital, monthlyContribution, annualReturn, inflationRate, years, indexInflation]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="calculator-wrapper">
      <div className="calculator-panel glass">
        <h2 className="calc-title">{t('calc.title')}</h2>
        <p className="calc-subtitle">{t('calc.subtitle')}</p>
        
        <div className="input-group">
          <Tooltip 
            title={t('calc.initCap')} 
            content={t('calc.initCapContent')}
          >
            <label>{t('calc.initCap')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={initialCapital} 
            onChange={(e) => setInitialCapital(e.target.value === '' ? '' : Number(e.target.value))} 
          />
        </div>

        <div className="input-group">
          <Tooltip 
            title={t('calc.monthContrib')} 
            content={t('calc.monthContribContent')}
          >
            <label>{t('calc.monthContrib')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={monthlyContribution} 
            onChange={(e) => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <input 
              type="checkbox" 
              id="indexInflationCalc"
              checked={indexInflation} 
              onChange={(e) => setIndexInflation(e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
            <Tooltip title={t('calc.indexInflation')} content={t('calc.indexInflationTooltip')}>
              <label htmlFor="indexInflationCalc" style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer' }}>
                {t('calc.indexInflation')}
              </label>
            </Tooltip>
          </div>
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('calc.annualReturnTitle')} 
              content={t('calc.annualReturnContent')}
            >
              <label>{t('calc.annualReturn')} ({annualReturn}%)</label>
            </Tooltip>
          </div>
          <Slider min={1} max={40} step={0.1} value={annualReturn} onChange={setAnnualReturn} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('calc.inflationTitle')} 
              content={t('calc.inflationContent')}
            >
              <label>{t('calc.inflation')} ({inflationRate}%)</label>
            </Tooltip>
          </div>
          <Slider min={0} max={30} step={0.1} value={inflationRate} onChange={setInflationRate} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('calc.yearsTitleTooltip')} 
              content={t('calc.yearsContent')}
            >
              <label>{t('calc.years')} ({years} {t('calc.yearsSuffix')})</label>
            </Tooltip>
          </div>
          <Slider min={1} max={50} value={years} onChange={setYears} />
        </div>
      </div>

      <div className="results-panel glass">
        <h3>{t('calc.resultsTitle')}</h3>
        
        <div className="result-card primary-result">
          <Tooltip 
            title={t('calc.finalNominalTitle')} 
            content={t('calc.finalNominalContent')}
          >
            <span className="result-label">{t('calc.finalNominalLabel')}</span>
          </Tooltip>
          <div className="result-value"><AnimatedNumber value={results.finalBalanceNominal} /></div>
        </div>

        <div className="result-card secondary-result">
          <Tooltip 
            title={t('calc.finalRealTitle')} 
            content={t('calc.finalRealContent')}
          >
            <span className="result-label">{t('calc.finalRealLabel')}</span>
          </Tooltip>
          <div className="result-value"><AnimatedNumber value={results.finalBalanceReal} /></div>
        </div>

        <div className="result-breakdown">
          <div className="breakdown-item">
            <span className="dot dot-invested"></span>
            <div>
              <span className="label">{t('calc.invested')}</span>
              <span className="val">{formatCurrency(results.totalInvested)}</span>
            </div>
          </div>
          <div className="breakdown-item">
            <span className="dot dot-profit"></span>
            <div>
              <Tooltip 
                title={t('calc.profitTitle')} 
                content={t('calc.profitContent')}
              >
                <span className="label">{t('calc.profitLabel')}</span>
              </Tooltip>
              <span className="val">{formatCurrency(results.profitOnly)}</span>
            </div>
          </div>
        </div>
        
        {/* Simple Visual Bar (Based on Nominal values for consistency) */}
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
        
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '24px' }}>
          {t('calc.realNote')}
        </p>
        <div style={{ marginTop: '30px' }}>
          <button 
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            onClick={() => setIsReceiptOpen(true)}
          >
            <Share2 size={20} />
            {t('calc.shareBtn')}
          </button>
        </div>
      </div>

      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={{
          years: years,
          rate: annualReturn,
          invested: results.totalInvested,
          final: results.finalBalanceNominal,
          real: results.finalBalanceReal
        }}
      />
    </div>
  );
};

export default Calculator;
