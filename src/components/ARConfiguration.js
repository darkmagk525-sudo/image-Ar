import React, { useState, useEffect } from 'react';

const ARConfiguration = ({ image, onSave, onBack }) => {
  const [config, setConfig] = useState({
    marker: 'hiro'
  });

  const [previewStyle, setPreviewStyle] = useState({});


  const markers = [
    { id: 'hiro', name: 'هيرو', icon: '🎯' },
    { id: 'kanji', name: 'كانجي', icon: '🈳' },
    { id: 'pattern', name: 'نمط', icon: '🔳' },
    { id: 'barcode', name: 'باركود', icon: '📊' }
  ];

  useEffect(() => {
    const style = {
      transform: 'scale(1)',
      transition: 'all 0.3s ease'
    };
    setPreviewStyle(style);
  }, [config]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const arData = {
      ...config,
      image,
      timestamp: Date.now()
    };
    onSave(arData);
  };

  const getPreviewClasses = () => {
    return 'preview-image';
  };

  return (
    <div className="ar-configuration">
      <div className="config-header">
        <h2>⚙️ إعدادات تجربة الواقع المعزز</h2>
        <p>قم بتخصيص كيفية ظهور صورتك في الواقع المعزز</p>
      </div>

      <div className="config-content">
        {/* Preview Section */}
        <div className="preview-section">
          <div className="ar-preview">
            <div className="preview-container">
              <img 
                src={image} 
                alt="AR Preview" 
                className={getPreviewClasses()}
                style={previewStyle}
              />
            </div>
            
            <div className="marker-preview">
              <div className="marker-frame">
                <div className="marker-icon">
                  {markers.find(m => m.id === config.marker)?.icon || '🎯'}
                </div>
                <p>علامة {markers.find(m => m.id === config.marker)?.name || 'هيرو'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="config-controls">


          {/* Marker Selection */}
          <div className="control-section">
            <h3>
              <span className="control-icon">🎯</span>
              نوع العلامة
            </h3>
            
            <div className="marker-grid">
              {markers.map(marker => (
                <button
                  key={marker.id}
                  className={`marker-btn ${config.marker === marker.id ? 'active' : ''}`}
                  onClick={() => handleConfigChange('marker', marker.id)}
                >
                  <span className="marker-icon">{marker.icon}</span>
                  <span className="marker-label">{marker.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="config-actions">
        <button onClick={onBack} className="btn btn-secondary">
          <span>←</span>
          العودة للتحرير
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          <span>💾</span>
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
};

export default ARConfiguration;
