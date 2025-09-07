import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const ShareExperience = ({ arConfig, onNewExperience, onViewAR }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    generateShareUrl();
  }, [arConfig]);

  const generateShareUrl = () => {
    const experienceId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const url = `https://ar-creator.app/view/${experienceId}`;
    setShareUrl(url);
  };

  useEffect(() => {
    const makeQR = async () => {
      if (!shareUrl) return;
      const canvas = qrCanvasRef.current;
      if (!canvas) return;
      try {
        await QRCode.toCanvas(canvas, shareUrl, {
          width: 220,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        setQrDataUrl(canvas.toDataURL());
      } catch (err) {
        console.error('QR generation failed', err);
      }
    };
    makeQR();
  }, [shareUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'ar-experience-qr.png';
    link.href = qrDataUrl;
    link.click();
  };

  const applyCustomLink = () => {
    try {
      const normalized = new URL(customLink).toString();
      setShareUrl(normalized);
      setCopied(false);
    } catch (e) {
      alert('الرجاء إدخال رابط صحيح');
    }
  };

  const clearCustomLink = () => {
    setCustomLink('');
    generateShareUrl();
  };

  const isYouTubeUrl = (url) => {
    try {
      const u = new URL(url);
      return (
        u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')
      );
    } catch (_) {
      return false;
    }
  };

  const toYouTubeEmbed = (url) => {
    try {
      const u = new URL(url);
      // youtu.be/<id>
      if (u.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${u.pathname.replace('/', '')}`;
      }
      // youtube.com/watch?v=<id>
      if (u.pathname === '/watch' && u.searchParams.get('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
      }
      // youtube.com/shorts/<id>
      if (u.pathname.startsWith('/shorts/')) {
        const parts = u.pathname.split('/');
        const id = parts[2] || '';
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch (_) {
      return url;
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: arConfig.title || 'تجربة AR مذهلة',
          text: arConfig.description || 'شاهد هذه التجربة المذهلة للواقع المعزز',
          url: shareUrl
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${arConfig.title || 'تجربة AR مذهلة'}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`${arConfig.title || 'تجربة AR مذهلة'}\n${shareUrl}`);
    window.open(`https://t.me/share/url?url=${shareUrl}&text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`${arConfig.title || 'تجربة AR مذهلة'} ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="share-experience">
      {/* Success Header */}
      <div className="share-success-header">
        <div className="success-icon">
          <div className="checkmark">✓</div>
        </div>
        <h1>تم إنشاء تجربتك بنجاح!</h1>
        <p>تجربة الواقع المعزز جاهزة للمشاركة مع العالم</p>
      </div>

      {/* Main Content Grid */}
      <div className="share-main-grid">
        
        {/* QR Code Card */}
        <div className="share-card qr-card">
          <div className="card-header">
            <div className="card-icon">📱</div>
            <h3>رمز الاستجابة السريعة</h3>
          </div>
          <div className="qr-display">
            <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
            {qrDataUrl && (
              <div className="qr-wrapper">
                <img src={qrDataUrl} alt="QR Code" className="qr-image" />
                <div className="qr-glow"></div>
              </div>
            )}
          </div>
          <p className="qr-instruction">امسح الرمز لفتح التجربة مباشرة</p>
          <button onClick={downloadQR} className="download-btn">
            <span className="btn-icon">⬇️</span>
            تحميل الرمز
          </button>
        </div>

        {/* Share Link Card */}
        <div className="share-card link-card">
          <div className="card-header">
            <div className="card-icon">🔗</div>
            <h3>رابط المشاركة</h3>
          </div>
          <div className="link-input-wrapper">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="share-link-input"
            />
            <button 
              onClick={copyToClipboard} 
              className={`copy-button ${copied ? 'copied' : ''}`}
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
          <div className="link-input-wrapper">
            <input
              type="text"
              placeholder="أدخل رابط مخصص (مثل رابط يوتيوب)"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              className="share-link-input"
            />
            <button onClick={applyCustomLink} className="share-action-btn">
              <span className="btn-icon">✅</span>
              تعيين الرابط
            </button>
            <button onClick={clearCustomLink} className="share-action-btn">
              <span className="btn-icon">🧹</span>
              إزالة
            </button>
          </div>
          <div className="link-actions">
            <button onClick={onViewAR} className="share-action-btn primary">
              <span className="btn-icon">👁️</span>
              عرض المشروع
            </button>
            <button onClick={shareNative} className="share-action-btn">
              <span className="btn-icon">📤</span>
              مشاركة
            </button>
            <button onClick={downloadQR} className="share-action-btn">
              <span className="btn-icon">⬇️</span>
              تحميل QR
            </button>
          </div>
          {isYouTubeUrl(shareUrl) && (
            <div style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
              <iframe
                title="معاينة الفيديو"
                width="100%"
                height="300"
                src={toYouTubeEmbed(shareUrl)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Experience Preview Card */}
        <div className="share-card preview-card">
          <div className="card-header">
            <div className="card-icon">🎨</div>
            <h3>معاينة التجربة</h3>
          </div>
          <div className="experience-preview">
            <div className="preview-image">
              <img src={arConfig.image} alt="AR Experience" />
              <div className="preview-overlay">
                <div className="ar-badge">AR</div>
              </div>
            </div>
            <div className="experience-details">
              <h4>{arConfig.title || 'تجربة AR'}</h4>
              <p>{arConfig.description || 'تجربة واقع معزز مذهلة'}</p>
              <div className="experience-stats">
                <span className="stat">
                  <span className="stat-icon">📏</span>
                  {arConfig.scale}x
                </span>
                <span className="stat">
                  <span className="stat-icon">🔄</span>
                  {arConfig.rotation}°
                </span>
                <span className="stat">
                  <span className="stat-icon">✨</span>
                  {arConfig.animation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Share Section */}
      <div className="social-share-section">
        <h3>شارك على وسائل التواصل الاجتماعي</h3>
        <div className="social-buttons">
          <button onClick={shareWhatsApp} className="social-btn whatsapp">
            <span className="social-icon">💬</span>
            <span>واتساب</span>
          </button>
          <button onClick={shareTelegram} className="social-btn telegram">
            <span className="social-icon">✈️</span>
            <span>تليجرام</span>
          </button>
          <button onClick={shareTwitter} className="social-btn twitter">
            <span className="social-icon">🐦</span>
            <span>تويتر</span>
          </button>
          <button onClick={shareFacebook} className="social-btn facebook">
            <span className="social-icon">📘</span>
            <span>فيسبوك</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="share-final-actions">
        <button onClick={onViewAR} className="action-btn primary">
          <span className="btn-icon">🥽</span>
          <span>عرض في الواقع المعزز</span>
        </button>
        <button onClick={onNewExperience} className="action-btn secondary">
          <span className="btn-icon">➕</span>
          <span>إنشاء تجربة جديدة</span>
        </button>
      </div>
    </div>
  );
};

export default ShareExperience;
