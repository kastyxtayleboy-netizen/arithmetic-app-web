import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Calculator from './components/Calculator';
import FIRECalculator from './components/FIRECalculator';
import Comparison from './components/Comparison';
import HistoricalSimulator from './components/HistoricalSimulator';
import MortgageVsRent from './components/MortgageVsRent';
import KellyCriterion from './components/KellyCriterion';
import MonteCarlo from './components/MonteCarlo';
import GoalTracker from './components/GoalTracker';
import FeedbackModal from './components/FeedbackModal';
import { useLanguage } from './contexts/LanguageContext';
import './index.css';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('compound');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { t } = useLanguage();

  const renderContent = () => {
    switch (activeTab) {
      case 'compound': return <Calculator />;
      case 'fire': return <FIRECalculator />;
      case 'comparison': return <Comparison />;
      case 'history': return <HistoricalSimulator />;
      case 'rent': return <MortgageVsRent />;
      case 'kelly': return <KellyCriterion />;
      case 'montecarlo': return <MonteCarlo />;
      case 'goal': return <GoalTracker />;
      default: return <Calculator />;
    }
  };

  return (
    <div className="app-layout">
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      <div className="main-wrapper">
        <main className="main-content fade-in">
          {renderContent()}
        </main>

        <footer className="footer fade-in">
          <p>{t('app.footer')}</p>
          <p style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.5 }}>{t('app.disclaimer')}</p>
        </footer>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}

export default App;
