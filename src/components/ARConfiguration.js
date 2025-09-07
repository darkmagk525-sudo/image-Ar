import React, { useState, useEffect } from 'react';

const ARConfiguration = ({ image, onSave, onBack }) => {
  const [config, setConfig] = useState({
    scale: 1,
    height: 1,
    rotation: 0,
    animation: 'none',
    glow: false,
    shadow: false,
    marker: 'hiro',
    title: '',
    description: ''
  });

  const [previewStyle, setPreviewStyle] = useState({});

  const animations = [
    { id: 'none', name: 'بدون حركة', icon: '🚫' },
    { id: 'rotation', name: 'دوران', icon: '🔄' },
    { id: 'pulse', name: 'نبض', icon: '💓' }
  ];

  const markers = [
    { id: 'hiro', name: 'هيرو', icon: '🎯' },
    { id: 'kanji', name: 'كانجي', icon: '🈳' },
    { id: 'pattern', name: 'نمط', icon: '🔳' },
    { id: 'barcode', name: 'باركود', icon: '📊' }
  ];

  useEffect(() => {
    const style = {
      transform: `scale(${config.scale}, ${config.scale * (config.height || 1)}) rotate(${config.rotation}deg)`,
      filter: `
        ${config.glow ? 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.8))' : ''}
        ${config.shadow ? 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))' : ''}
      `.trim(),
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

  const getAnimationIcon = (animationType) => {
    const animation = animations.find(a => a.id === animationType);
    return animation ? animation.icon : '🚫';
  };

  const getPreviewClasses = () => {
    let classes = 'preview-image';
    if (config.animation !== 'none') {
      classes += ` ${config.animation}`;
    }
    if (config.glow) {
      classes += ' glow';
    }
    if (config.shadow) {
      classes += ' shadow';
    }
    return classes;
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
              {config.animation !== 'none' && (
                <div className={`animation-indicator ${config.animation}`}>
                  {getAnimationIcon(config.animation)}
                </div>
              )}
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
          {/* Transform Controls */}
          <div className="control-section">
            <h3>
              <span className="control-icon">📐</span>
              التحويلات الأساسية
            </h3>
            
            <div className="control-group">
              <label>
                <span className="control-icon">🔍</span>
                <span className="control-name">الحجم</span>
              </label>
              <div className="control-input">
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={config.scale}
                  onChange={(e) => handleConfigChange('scale', parseFloat(e.target.value))}
                  className="config-slider"
                />
                <span className="control-value">{config.scale.toFixed(1)}x</span>
              </div>
            </div>

            <div className="control-group">
              <label>
                <span className="control-icon">📏</span>
                <span className="control-name">الارتفاع</span>
              </label>
              <div className="control-input">
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={config.height}
                  onChange={(e) => handleConfigChange('height', parseFloat(e.target.value))}
                  className="config-slider"
                />
                <span className="control-value">{(config.height || 1).toFixed(1)}x</span>
              </div>
            </div>

            <div className="control-group">
              <label>
                <span className="control-icon">🔄</span>
                <span className="control-name">الدوران</span>
              </label>
              <div className="control-input">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={config.rotation}
                  onChange={(e) => handleConfigChange('rotation', parseInt(e.target.value))}
                  className="config-slider"
                />
                <span className="control-value">{config.rotation}°</span>
              </div>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="control-section">
            <h3>
              <span className="control-icon">🎬</span>
              الحركة والتأثيرات
            </h3>
            
            <div className="animation-grid">
              {animations.map(animation => (
                <button
                  key={animation.id}
                  className={`animation-btn ${config.animation === animation.id ? 'active' : ''}`}
                  onClick={() => handleConfigChange('animation', animation.id)}
                >
                  <span className="animation-icon">{animation.icon}</span>
                  <span className="animation-label">{animation.name}</span>
                </button>
              ))}
            </div>

            <div className="effects-toggles">
              <label className="effect-toggle">
                <input
                  type="checkbox"
                  checked={config.glow}
                  onChange={(e) => handleConfigChange('glow', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  <span className="toggle-icon">✨</span>
                  توهج
                </span>
              </label>

              <label className="effect-toggle">
                <input
                  type="checkbox"
                  checked={config.shadow}
                  onChange={(e) => handleConfigChange('shadow', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  <span className="toggle-icon">🌑</span>
                  ظل
                </span>
              </label>
            </div>
          </div>

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

          {/* Experience Info */}
          <div className="control-section">
            <h3>
              <span className="control-icon">📝</span>
              معلومات التجربة
            </h3>
            
            <div className="info-inputs">
              <div className="input-group">
                <label>عنوان التجربة</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => handleConfigChange('title', e.target.value)}
                  placeholder="أدخل عنوان التجربة..."
                  className="text-input"
                />
              </div>

              <div className="input-group">
                <label>وصف التجربة</label>
                <textarea
                  value={config.description}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  placeholder="أدخل وصف التجربة..."
                  rows="3"
                  className="text-area"
                />
              </div>
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
