import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import AnimatedNumber from './AnimatedNumber';
import Tooltip from './Tooltip';
import { Coffee, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

const LatteEffect = () => {
  const { t, language } = useLanguage();
  const [expense, setExpense] = useState(300);
  const [frequency, setFrequency] = useState('daily');
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(10);

  const getLostItem = (amount) => {
    const isUSD = language === 'en';
    let m = amount;
    if (isUSD) {
       m = amount * 90; // Normalize back to RUB scale for logic map
    }
    
    if (m >= 15000000) return t('latte.itemApartmentMoscow');
    if (m >= 7000000) return t('latte.itemApartmentRegion');
    if (m >= 3000000) return t('latte.itemCar');
    if (m >= 1500000) return t('latte.itemMortgage');
    if (m >= 500000) return t('latte.itemMaldives');
    if (m >= 200000) return t('latte.itemMacbook');
    if (m >= 100000) return t('latte.itemIphone');
    if (m >= 50000) return t('latte.itemPs5');
    return t('latte.itemVacuum');
  }

  const result = useMemo(() => {
    const amount = Number(expense) || 0;
    
    let monthlyContrib = 0;
    if (frequency === 'daily') monthlyContrib = amount * (365 / 12);
    if (frequency === 'weekly') monthlyContrib = amount * (52 / 12);
    if (frequency === 'monthly') monthlyContrib = amount;

    const r = (Number(returnRate) || 0) / 100;
    const y = Number(years) || 0;
    
    const monthlyRate = r / 12;
    const months = y * 12;
    
    let futureValue = 0;
    if (monthlyRate === 0) {
      futureValue = monthlyContrib * months;
    } else {
      futureValue = monthlyContrib * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    }
    
    return {
      fv: futureValue,
      totalSpent: monthlyContrib * months,
      item: getLostItem(futureValue)
    };
  }, [expense, frequency, returnRate, years, language, t]);

  return (
    <div className="calculator-container slide-up">
      <div className="calculator-header">
        <h2 className="title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Coffee size={32} color="var(--accent-color)" />
          {t('latte.title')}
        </h2>
        <p className="subtitle">{t('latte.desc')}</p>
      </div>

      <div className="calculator-grid">
        <div className="input-section glass-panel">
          <div className="input-group">
            <label>{t('latte.expenseLabel')}</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                value={expense}
                placeholder={t('latte.expensePlaceholder')}
                onChange={(e) => setExpense(e.target.value)} 
                style={{ flex: 1, minWidth: '0' }}
              />
              <select 
                value={frequency} 
                onChange={(e) => setFrequency(e.target.value)}
                style={{ width: '130px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', outline: 'none' }}
              >
                <option value="daily" style={{ color: 'black' }}>{t('latte.freqDaily')}</option>
                <option value="weekly" style={{ color: 'black' }}>{t('latte.freqWeekly')}</option>
                <option value="monthly" style={{ color: 'black' }}>{t('latte.freqMonthly')}</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <Tooltip title={t('latte.returnLabel')} content={t('latte.returnDesc')}>
              <label>{t('latte.returnLabel')} <span className="value-badge">{returnRate}%</span></label>
            </Tooltip>
            <input 
              type="range" 
              min="1" 
              max="40" 
              step="1"
              value={returnRate} 
              onChange={(e) => setReturnRate(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <Tooltip title={t('latte.yearsLabel')} content={t('latte.yearsDesc')}>
              <label>{t('latte.yearsLabel')} <span className="value-badge">{years}</span></label>
            </Tooltip>
            <input 
              type="range" 
              min="1" 
              max="50" 
              step="1"
              value={years} 
              onChange={(e) => setYears(e.target.value)} 
            />
          </div>
        </div>

        <div className="results-section">
          <h3 className="results-title">{t('latte.resultTitle')}</h3>
          
          <div className="result-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.05)', textAlign: 'center', padding: '30px 20px' }}>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '1rem' }}>
                {t('latte.resultDesc').replace('{years}', years)}
             </p>
             <div className="total-value" style={{ fontSize: '3rem', wordBreak: 'break-word', color: 'var(--accent-color)' }}>
               <AnimatedNumber value={result.fv} />
             </div>
          </div>

          <div className="result-card" style={{ marginTop: '24px', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)', textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '50%' }}>
                <AlertTriangle size={48} color="#ef4444" />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '8px' }}>
                  {t('latte.lostItemIntro')}
                </p>
                <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1.2' }}>
                  {result.item}
                </h2>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LatteEffect;
