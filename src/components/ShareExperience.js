import React, { useState, useEffect, useRef } from 'react';

const ShareExperience = ({ arConfig, onNewExperience, onViewAR }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    generateShareUrl();
    generateQRCode();
  }, [arConfig]);

  const generateShareUrl = () => {
    const experienceId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const url = `https://ar-creator.app/view/${experienceId}`;
    setShareUrl(url);
  };

  const generateQRCode = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Create a simple pattern for QR code (placeholder)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    const blockSize = size / 25;
    
    // Generate a simple pattern
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
          ctx.fillRect(i * blockSize, j * blockSize, blockSize, blockSize);
        }
      }
    }

    // Add corner markers
    const markerSize = blockSize * 7;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, markerSize, markerSize);
    ctx.fillRect(size - markerSize, 0, markerSize, markerSize);
    ctx.fillRect(0, size - markerSize, markerSize, markerSize);
    
    ctx.fillStyle = '#ffffff';
    const innerSize = blockSize * 5;
    const offset = blockSize;
    ctx.fillRect(offset, offset, innerSize, innerSize);
    ctx.fillRect(size - markerSize + offset, offset, innerSize, innerSize);
    ctx.fillRect(offset, size - markerSize + offset, innerSize, innerSize);

    setQrDataUrl(canvas.toDataURL());
  };

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
          <div className="link-actions">
            <button onClick={shareNative} className="share-action-btn primary">
              <span className="btn-icon">📤</span>
              مشاركة
            </button>
          </div>
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
