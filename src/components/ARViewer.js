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
    }, 1500);

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
              arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
              vr-mode-ui="enabled: false"
              renderer="logarithmicDepthBuffer: true;"
              stats="false"
              loading-screen="enabled: false"
              background="color: #000000"
              camera="fov: 80; near: 0.1; far: 1000;"
            >
              <a-light type="ambient" color="#ffffff" intensity="0.8"></a-light>
              <a-light type="directional" color="#ffffff" intensity="0.5" position="0 1 0"></a-light>
              <a-light type="point" color="#ffffff" intensity="0.3" position="0 0 2"></a-light>
              <a-assets>
                <img id="ar-image" src={arConfig.image} crossOrigin="anonymous" />
              </a-assets>
              <a-marker preset={arConfig.marker || "hiro"}>
                <a-plane 
                  src="#ar-image"
                  position="0 0 0"
                  width="2"
                  height="2"
                  rotation="-90 0 0"
                  material="transparent: true; alphaTest: 0.1; side: double;"
                ></a-plane>
              </a-marker>
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
                      className="ar-preview-image"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        objectFit: 'contain'
                      }}
                    />
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
              <div><strong>العلامة:</strong> {arConfig.marker || 'hiro'}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ARViewer;
