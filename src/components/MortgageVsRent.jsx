import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Tooltip from './Tooltip';
import AnimatedNumber from './AnimatedNumber';
import Slider from './Slider';
import { useLanguage } from '../contexts/LanguageContext';
import './Calculator.css';

const MortgageVsRent = () => {
  const { t } = useLanguage();
  
  const [propPrice, setPropPrice] = useLocalStorage('mvr_propPrice', 10000000);
  const [downpayment, setDownpayment] = useLocalStorage('mvr_downpayment', 2000000);
  const [maternityCapital, setMaternityCapital] = useLocalStorage('mvr_maternityCapital', 0);
  const [useTaxDeduction, setUseTaxDeduction] = useLocalStorage('mvr_useTaxDeduction', false);
  const [mortgageRate, setMortgageRate] = useLocalStorage('mvr_mortgageRate', 16);
  const [years, setYears] = useLocalStorage('mvr_years', 20);
  const [rentPrice, setRentPrice] = useLocalStorage('mvr_rentPrice', 50000);
  const [investRate, setInvestRate] = useLocalStorage('mvr_investRate', 15);
  const [propGrowth, setPropGrowth] = useLocalStorage('mvr_propGrowth', 5);
  const [maintenanceRate, setMaintenanceRate] = useLocalStorage('mvr_maintenanceRate', 1);

  const [results, setResults] = useState({
    monthlyPayment: 0,
    monthlyInvested: 0,
    buyFinalNetWorth: 0,
    rentFinalNetWorth: 0,
    totalRentPaid: 0,
    totalMortgagePaid: 0
  });

  useEffect(() => {
    // 1. Calculate Mortgage Payment
    const principal = Math.max(0, propPrice - downpayment - maternityCapital);
    const months = years * 12;
    const monthlyMortgageRate = (mortgageRate / 100) / 12;
    
    let monthlyPayment = 0;
    if (monthlyMortgageRate === 0) {
      monthlyPayment = principal / months;
    } else {
      monthlyPayment = principal * 
        (monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, months)) / 
        (Math.pow(1 + monthlyMortgageRate, months) - 1);
    }
    
    // 2. Buy Scenario
    // After N years, property is fully paid off.
    const finalPropValue = propPrice * Math.pow(1 + propGrowth / 100, years);
    
    let taxDeductionValue = 0;
    if (useTaxDeduction) {
      // Максимальный вычет 650к рублей (получаем примерно через год)
      const deductionAmount = 650000;
      // Допустим, мы его реинвестируем под ту же ставку до конца срока
      taxDeductionValue = deductionAmount * Math.pow(1 + investRate / 100, Math.max(0, years - 1));
    }
    
    const buyFinalNetWorth = finalPropValue + taxDeductionValue;

    // 3. Rent Scenario and Fair Comparison
    let buyerPortfolio = 0;
    let renterPortfolio = downpayment;
    let currentRent = rentPrice;
    let currentPropPrice = propPrice;
    const monthlyInvestRate = (investRate / 100) / 12;
    let totalRentPaid = 0;
    
    // Initial display logic
    const initialMonthlyMaintenance = (propPrice * maintenanceRate / 100) / 12;
    const initialBuyerCost = monthlyPayment + initialMonthlyMaintenance;
    let initialMonthlyInvest = Math.abs(initialBuyerCost - rentPrice);

    for (let y = 0; y < years; y++) {
      const monthlyMaintenance = (currentPropPrice * maintenanceRate / 100) / 12;
      for (let m = 0; m < 12; m++) {
        // Buyer's total monthly cost includes mortgage and maintenance
        const buyerMonthlyCost = monthlyPayment + monthlyMaintenance;
        const renterCost = currentRent;
        
        // Both buyer and renter spend the same total budget per month
        // This ensures that if rent goes up, the buyer is properly credited for having extra cash to invest
        const budget = Math.max(buyerMonthlyCost, renterCost);
        
        const buyerInvest = budget - buyerMonthlyCost;
        const renterInvest = budget - renterCost;

        buyerPortfolio = buyerPortfolio * (1 + monthlyInvestRate) + buyerInvest;
        renterPortfolio = renterPortfolio * (1 + monthlyInvestRate) + renterInvest;
        totalRentPaid += currentRent;
      }
      // Rent and property value increase every year
      currentRent = currentRent * (1 + propGrowth / 100);
      currentPropPrice = currentPropPrice * (1 + propGrowth / 100);
    }

    const totalBuyFinalNetWorth = buyFinalNetWorth + buyerPortfolio;

    setResults({
      monthlyPayment: Math.round(monthlyPayment),
      monthlyInvested: Math.round(initialMonthlyInvest), // Just for display (Year 1)
      buyFinalNetWorth: Math.round(totalBuyFinalNetWorth),
      rentFinalNetWorth: Math.round(renterPortfolio),
      totalRentPaid: Math.round(totalRentPaid),
      totalMortgagePaid: Math.round(monthlyPayment * months + downpayment)
    });

  }, [propPrice, downpayment, maternityCapital, mortgageRate, years, rentPrice, investRate, propGrowth, maintenanceRate, useTaxDeduction]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  };

  const maxValue = Math.max(results.buyFinalNetWorth, results.rentFinalNetWorth, 1);

  return (
    <div className="calculator-wrapper">
      <div className="calculator-panel glass">
        <h2 className="calc-title">{t('rentVsBuy.title')}</h2>
        <p className="calc-subtitle">{t('rentVsBuy.subtitle')}</p>
        
        <div className="input-group">
          <Tooltip 
            title={t('rentVsBuy.propPriceTitle')} 
            content={t('rentVsBuy.propPriceContent')}
          >
            <label>{t('rentVsBuy.propPrice')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={propPrice} 
            onChange={(e) => setPropPrice(e.target.value === '' ? '' : Number(e.target.value))} 
          />
        </div>

        <div className="input-group">
          <Tooltip 
            title={t('rentVsBuy.downpaymentTitle')} 
            content={t('rentVsBuy.downpaymentContent')}
          >
            <label>{t('rentVsBuy.downpayment')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={downpayment} 
            onChange={(e) => setDownpayment(e.target.value === '' ? '' : Number(e.target.value))} 
          />
        </div>

        <div className="input-group">
          <Tooltip 
            title={t('rentVsBuy.maternityCapitalTitle')} 
            content={t('rentVsBuy.maternityCapitalContent')}
          >
            <label>{t('rentVsBuy.maternityCapital')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={maternityCapital} 
            onChange={(e) => setMaternityCapital(e.target.value === '' ? '' : Number(e.target.value))} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <input 
              type="checkbox" 
              id="taxDeductionProp"
              checked={useTaxDeduction} 
              onChange={(e) => setUseTaxDeduction(e.target.checked)}
              style={{ width: 'auto', margin: 0 }}
            />
            <Tooltip title={t('rentVsBuy.taxDeduction')} content={t('rentVsBuy.taxDeductionTooltip')}>
              <label htmlFor="taxDeductionProp" style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer' }}>
                {t('rentVsBuy.taxDeduction')}
              </label>
            </Tooltip>
          </div>
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('rentVsBuy.mortgageRateTitle')} 
              content={t('rentVsBuy.mortgageRateContent')}
            >
              <label>{t('rentVsBuy.mortgageRate')} (%)</label>
            </Tooltip>
          </div>
          
          <div className="presets-row" style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <button className={`preset-btn ${mortgageRate === 20 ? 'active' : ''}`} onClick={() => setMortgageRate(20)}>
              {t('rentVsBuy.presetMarket')}
            </button>
            <button className={`preset-btn ${mortgageRate === 6 ? 'active' : ''}`} onClick={() => setMortgageRate(6)}>
              {t('rentVsBuy.presetFamily')}
            </button>
            <button className={`preset-btn ${mortgageRate === 5 ? 'active' : ''}`} onClick={() => setMortgageRate(5)}>
              {t('rentVsBuy.presetIT')}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <Slider min={2} max={25} step={0.1} value={mortgageRate} onChange={setMortgageRate} />
            </div>
            <input 
              type="number" 
              step="0.1"
              value={mortgageRate} 
              onChange={(e) => setMortgageRate(e.target.value === '' ? '' : Number(e.target.value))} 
              style={{ width: '80px', padding: '8px', margin: '0' }}
            />
          </div>
        </div>

        <div className="input-group">
          <Tooltip 
            title={t('rentVsBuy.rentPriceTitle')} 
            content={t('rentVsBuy.rentPriceContent')}
          >
            <label>{t('rentVsBuy.rentPrice')} (₽)</label>
          </Tooltip>
          <input 
            type="number" 
            value={rentPrice} 
            onChange={(e) => setRentPrice(e.target.value === '' ? '' : Number(e.target.value))} 
          />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <label>{t('rentVsBuy.years')} ({years})</label>
          </div>
          <Slider min={5} max={40} value={years} onChange={setYears} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('rentVsBuy.investRateTitle')} 
              content={t('rentVsBuy.investRateContent')}
            >
              <label>{t('rentVsBuy.investRate')} ({investRate}%)</label>
            </Tooltip>
          </div>
          <Slider min={5} max={30} step={0.1} value={investRate} onChange={setInvestRate} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('rentVsBuy.propGrowthTitle')} 
              content={t('rentVsBuy.propGrowthContent')}
            >
              <label>{t('rentVsBuy.propGrowth')} ({propGrowth}%)</label>
            </Tooltip>
          </div>
          <Slider min={0} max={20} step={0.1} value={propGrowth} onChange={setPropGrowth} />
        </div>

        <div className="input-group">
          <div className="slider-header">
            <Tooltip 
              title={t('rentVsBuy.maintenanceTitle')} 
              content={t('rentVsBuy.maintenanceContent')}
            >
              <label>{t('rentVsBuy.maintenance')} ({maintenanceRate}%)</label>
            </Tooltip>
          </div>
          <Slider min={0} max={5} step={0.1} value={maintenanceRate} onChange={setMaintenanceRate} />
        </div>
      </div>

      <div className="results-panel glass">
        <h3>{t('rentVsBuy.resultsTitle').replace('{years}', years)}</h3>
        
        <div style={{ marginTop: '20px', marginBottom: '30px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {results.monthlyPayment > rentPrice ? 
              t('rentVsBuy.monthlyPaymentInfo')
                .replace('{payment}', formatCurrency(results.monthlyPayment))
                .replace('{rent}', formatCurrency(rentPrice))
                .replace('{diff}', formatCurrency(results.monthlyPayment - rentPrice))
              : 
              t('rentVsBuy.monthlyPaymentWarning')
            }
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Tooltip title={t('rentVsBuy.buyNetWorthTitle')} content={t('rentVsBuy.buyNetWorthContent')}>
                <span>{t('rentVsBuy.buyNetWorth')}</span>
              </Tooltip>
              <strong><AnimatedNumber value={results.buyFinalNetWorth} /></strong>
            </div>
            <div className="visual-bar">
              <div style={{ background: '#3B82F6', height: '100%', width: `${(results.buyFinalNetWorth / maxValue) * 100}%`, transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Tooltip title={t('rentVsBuy.rentNetWorthTitle')} content={t('rentVsBuy.rentNetWorthContent')}>
                <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{t('rentVsBuy.rentNetWorth')}</span>
              </Tooltip>
              <strong style={{ color: 'var(--accent-color)' }}><AnimatedNumber value={results.rentFinalNetWorth} /></strong>
            </div>
            <div className="visual-bar">
              <div style={{ background: 'var(--accent-color)', height: '100%', width: `${(results.rentFinalNetWorth / maxValue) * 100}%`, transition: 'width 0.5s ease-out', boxShadow: 'var(--shadow-glow)' }}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MortgageVsRent;
