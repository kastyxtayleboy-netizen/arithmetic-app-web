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
import { PlaySquare, MessageSquare, Heart, Globe, BarChart2 } from 'lucide-react';
import './index.css';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('compound');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();

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

      <header className="mobile-header">
        <div className="mobile-logo">
          <BarChart2 size={24} className="mobile-logo-icon" />
          <span className="mobile-logo-text">{t('app.title')}</span>
        </div>
        <div className="mobile-utils">
          <button className="mobile-util-btn" onClick={() => setIsFeedbackOpen(true)}>
            <MessageSquare size={20} />
          </button>
          <a
            href="https://boosty.to/arifmetikaofmoney"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-util-btn"
          >
            <Heart size={20} />
          </a>
          <button className="mobile-util-btn lang-btn" onClick={toggleLanguage}>
            <Globe size={20} />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </header>

      <div className="main-wrapper">
        <a
          href="https://youtube.com/channel/UCYF93yEBV4m8eod9Vr7qaig?si=GCl44Bt6UgwfA7uD"
          target="_blank"
          rel="noopener noreferrer"
          className="youtube-top-btn"
        >
          <PlaySquare size={20} />
          <span>Мой YouTube</span>
        </a>

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
