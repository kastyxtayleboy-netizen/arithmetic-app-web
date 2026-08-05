import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ReceiptModal = ({ isOpen, onClose, data }) => {
  const { t } = useLanguage();
  const receiptRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setImageUrl(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        backgroundColor: '#0a0a0a',
        logging: false
      });
      const url = canvas.toDataURL('image/png');
      setImageUrl(url);
    } catch (error) {
      console.error('Failed to generate receipt', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `money_math_receipt_${new Date().getTime()}.png`;
    a.click();
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content slide-up" style={{ maxWidth: '450px', background: 'var(--bg-card)' }}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{t('receipt.title')}</h2>

        {!imageUrl ? (
          <>
            <div className="receipt-preview-container">
              <div 
                ref={receiptRef} 
                className="receipt-ticket"
              >
                <div className="receipt-header">
                  <div className="receipt-logo">{t('receipt.logo')}</div>
                  <div className="receipt-subtitle">{t('receipt.subtitle')}</div>
                </div>
                
                <div className="receipt-body">
                  <div className="receipt-row">
                    <span className="receipt-label">{t('receipt.period')}</span>
                    <span className="receipt-value">{data.years} {t('receipt.years')}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">{t('receipt.rate')}</span>
                    <span className="receipt-value">{data.rate}{t('receipt.rateSuffix')}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">{t('receipt.invested')}</span>
                    <span className="receipt-value">{data.invested.toLocaleString()} ₽</span>
                  </div>
                  
                  <div className="receipt-divider"></div>
                  
                  <div className="receipt-total-label">{t('receipt.totalCap')}</div>
                  <div className="receipt-total-value">{data.final.toLocaleString()} ₽</div>
                  
                  {data.real && (
                    <div className="receipt-real-value">
                      ({t('receipt.currentPrices')}: {data.real.toLocaleString()} ₽)
                    </div>
                  )}
                </div>
                
                <div className="receipt-footer">
                  <div className="receipt-barcode">
                    || ||| | ||| | || || | ||| |
                  </div>
                  <div className="receipt-date">{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{ width: '100%' }}
              >
                {isGenerating ? t('receipt.generatingBtn') : t('receipt.generateBtn')}
              </button>
            </div>
          </>
        ) : (
          <div className="receipt-result fade-in">
            <img src={imageUrl} alt="Receipt" style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={downloadImage} style={{ flex: 1 }}>
                <Download size={20} /> {t('receipt.downloadBtn')}
              </button>
              <button className="btn-secondary" onClick={() => setImageUrl(null)} style={{ flex: 1 }}>
                {t('receipt.backBtn')}
              </button>
            </div>
            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>
              {t('receipt.hint')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptModal;
