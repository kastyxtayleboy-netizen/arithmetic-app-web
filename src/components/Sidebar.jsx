import React from 'react';
import { BarChart2, PiggyBank, Flame, Scale, History, Home, Target, MessageSquare, Heart, Globe, Dices, Trophy, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ activeTab, setActiveTab, onOpenFeedback }) => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <nav className="sidebar glass">
      <div className="sidebar-logo">
        <span className="logo-icon"><BarChart2 size={28} /></span>
        <span className="logo-text">{t('app.title')}</span>
      </div>

      <div className="sidebar-links">
        <button
          className={`sidebar-link ${activeTab === 'compound' ? 'active' : ''}`}
          onClick={() => setActiveTab('compound')}
        >
          <span className="link-icon"><PiggyBank size={22} /></span>
          <span className="link-text">{t('nav.capitalTab').replace('💰 ', '')}</span>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'fire' ? 'active' : ''}`}
          onClick={() => setActiveTab('fire')}
        >
          <span className="link-icon"><Flame size={22} /></span>
          <span className="link-text">{t('nav.fireTab').replace('🔥 ', '')}</span>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          <span className="link-icon"><Scale size={22} /></span>
          <span className="link-text">{t('nav.compTab').replace('⚖️ ', '')}</span>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="link-icon"><History size={22} /></span>
          <span className="link-text">{t('nav.histTab').replace('⏳ ', '')}</span>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'rent' ? 'active' : ''}`}
          onClick={() => setActiveTab('rent')}
        >
          <span className="link-icon"><Home size={22} /></span>
          <span className="link-text">{t('nav.rentTab').replace('🏠 ', '')}</span>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'kelly' ? 'active' : ''}`}
          onClick={() => setActiveTab('kelly')}
        >
          <span className="link-icon"><Target size={22} /></span>
          <span className="link-text">{t('nav.kellyTab').replace('🎯 ', '')}</span>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'montecarlo' ? 'active' : ''}`}
          onClick={() => setActiveTab('montecarlo')}
        >
          <span className="link-icon"><Dices size={22} /></span>
          <span className="link-text">{t('nav.monteCarloTab').replace('🎲 ', '')}</span>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'goal' ? 'active' : ''}`}
          onClick={() => setActiveTab('goal')}
        >
          <span className="link-icon"><Trophy size={22} /></span>
          <span className="link-text">{t('nav.goalTab').replace('🏆 ', '')}</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-link feedback-btn" onClick={onOpenFeedback}>
          <span className="link-icon"><MessageSquare size={22} /></span>
          <span className="link-text">{t('feedback.btn')}</span>
        </button>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link youtube-btn"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <span className="link-icon"><Youtube size={22} color="#EF4444" /></span>
          <span className="link-text">YouTube</span>
        </a>
        <a
          href="https://boosty.to/arifmetikaofmoney"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link donation-btn"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <span className="link-icon"><Heart size={22} /></span>
          <span className="link-text">{t('nav.donate')}</span>
        </a>
        <button className="lang-toggle" onClick={toggleLanguage}>
          <span className="link-icon"><Globe size={22} /></span>
          <span className="link-text">{language.toUpperCase()}</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
