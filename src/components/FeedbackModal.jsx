import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const FeedbackModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [status, setStatus] = useState(''); // '', 'loading', 'success', 'error'

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/maewwlyj", {
        method: "POST",
        body: data,
        headers: {
            'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setStatus('success');
        form.reset();
        setTimeout(() => {
          setStatus('');
          onClose();
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2>{t('feedback.title')}</h2>
        <p className="modal-subtitle">{t('feedback.subtitle')}</p>

        {status === 'success' ? (
          <div className="feedback-success">
            <span className="success-icon">✅</span>
            <p>{t('feedback.successMsg')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            {/* Honeypot field for spam bots */}
            <input type="text" name="_gotcha" style={{ display: 'none' }} />
            
            <div className="form-group">
              <label>{t('feedback.messageLabel')} *</label>
              <textarea 
                name="message" 
                rows="5" 
                required 
                placeholder={t('feedback.messagePlaceholder')}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>{t('feedback.contactLabel')}</label>
              <input 
                type="text" 
                name="contact" 
                placeholder={t('feedback.contactPlaceholder')} 
              />
            </div>
            
            {status === 'error' && <p className="feedback-error">{t('feedback.errorMsg')}</p>}
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={status === 'loading'}
            >
              {status === 'loading' ? t('feedback.sending') : t('feedback.submitBtn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
