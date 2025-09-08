import React, { useState, useEffect } from 'react';

const ARViewer = ({ arConfig, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check WebGL support
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          document.body.classList.add('no-webgl');
        }
      } catch (e) {
        document.body.classList.add('no-webgl');
      }
    };

    checkWebGL();

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ar-viewer">
      <div className="ar-header">
        <h2>🥽 عارض الواقع المعزز</h2>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      {isLoading ? (
        <div className="ar-loading">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p>جاري تحميل الواقع المعزز...</p>
        </div>
      ) : (
        <>
          <div className="ar-scene-container">
            <a-scene 
              embedded 
              arjs="sourceType: webcam; debugUIEnabled: false;"
              vr-mode-ui="enabled: false"
              renderer="logarithmicDepthBuffer: true;"
            >
              <a-marker-camera preset="hiro">
                <a-plane 
                  src={arConfig.image}
                  rotation="-90 0 0"
                  width={arConfig.scale || 1}
                  height={(arConfig.scale || 1) * (arConfig.height || 1)}
                  position="0 0 0"
                  animation={arConfig.animation === 'rotation' ? 'property: rotation; to: 0 360 0; loop: true; dur: 2000' : 
                           arConfig.animation === 'pulse' ? 'property: scale; to: 1.2 1.2 1.2; loop: true; dur: 1000; dir: alternate' : ''}
                  material={`opacity: 1; transparent: true; ${arConfig.glow ? 'shader: flat; color: #6366f1;' : ''}`}
                ></a-plane>
              </a-marker-camera>
            </a-scene>
            
            <div className="ar-fallback">
              <div className="mock-camera-view">
                <div className="camera-overlay">
                  <div className="scanning-line"></div>
                  <div className="corner-markers">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                  </div>
                  
                  <div className="ar-object-preview">
                    <img 
                      src={arConfig.image} 
                      alt="AR Object"
                      className={`ar-preview-image ${arConfig.animation === 'rotation' ? 'rotation' : arConfig.animation === 'pulse' ? 'pulse' : ''}`}
                      style={{
                        transform: `scale(${arConfig.scale || 1}, ${(arConfig.scale || 1) * (arConfig.height || 1)}) rotate(${arConfig.rotation || 0}deg)`,
                        filter: arConfig.glow ? 'drop-shadow(0 0 20px #6366f1)' : 'none'
                      }}
                    />
                    {arConfig.animation !== 'none' && (
                      <div className="animation-indicator">
                        ✨ {arConfig.animation}
                      </div>
                    )}
                  </div>

                  <div className="detection-status">
                    <div className="status-indicator active">
                      <span className="status-dot"></span>
                      تم اكتشاف العلامة
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ar-instructions">
            <div className="instruction-item">
              <span className="instruction-icon">📱</span>
              <p>وجه الكاميرا نحو العلامة</p>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">👁️</span>
              <p>حافظ على ثبات الجهاز</p>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">💡</span>
              <p>تأكد من الإضاءة الجيدة</p>
            </div>
          </div>

          <div className="ar-controls">
            <button 
              onClick={() => window.location.reload()} 
              className="ar-control-btn"
            >
              🔄 إعادة تشغيل
            </button>
            <button onClick={onClose} className="ar-control-btn">
              🏠 العودة للرئيسية
            </button>
          </div>

          <div className="ar-info">
            <h3>معلومات التجربة</h3>
            <div className="info-details">
              <div><strong>العنوان:</strong> {arConfig.title || 'تجربة AR'}</div>
              <div><strong>الوصف:</strong> {arConfig.description || 'تجربة واقع معزز'}</div>
              <div><strong>الحجم:</strong> {arConfig.scale || 1}x</div>
              <div><strong>الحركة:</strong> {arConfig.animation || 'none'}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ARViewer;
