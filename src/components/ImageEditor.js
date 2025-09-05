import React, { useState, useRef, useEffect } from 'react';

const ImageEditor = ({ image, onSave, onBack, onSkip }) => {
  const canvasRef = useRef(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0
  });

  const [effects, setEffects] = useState({
    vintage: false,
    dramatic: false,
    cool: false,
    warm: false
  });

  const [originalImage, setOriginalImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('filters');

  useEffect(() => {
    loadImageToCanvas();
  }, [image]);

  useEffect(() => {
    if (originalImage) {
      applyFilters();
    }
  }, [filters, effects, originalImage]);

  const loadImageToCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      setOriginalImage(img);
    };
    
    img.src = image;
  };

  const applyFilters = () => {
    if (!originalImage) return;
    
    setIsLoading(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let filterString = '';
    filterString += `brightness(${filters.brightness}%) `;
    filterString += `contrast(${filters.contrast}%) `;
    filterString += `saturate(${filters.saturation}%) `;
    filterString += `blur(${filters.blur}px) `;
    filterString += `hue-rotate(${filters.hue}deg) `;
    filterString += `sepia(${filters.sepia}%) `;
    filterString += `grayscale(${filters.grayscale}%) `;
    filterString += `invert(${filters.invert}%) `;
    
    if (effects.vintage) {
      filterString += 'sepia(50%) contrast(120%) brightness(90%) ';
    }
    if (effects.dramatic) {
      filterString += 'contrast(150%) saturate(120%) brightness(90%) ';
    }
    if (effects.cool) {
      filterString += 'hue-rotate(180deg) saturate(110%) ';
    }
    if (effects.warm) {
      filterString += 'hue-rotate(-30deg) saturate(120%) brightness(110%) ';
    }
    
    ctx.filter = filterString;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleEffectToggle = (effectName) => {
    setEffects(prev => ({
      ...prev,
      [effectName]: !prev[effectName]
    }));
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hue: 0,
      sepia: 0,
      grayscale: 0,
      invert: 0
    });
    setEffects({
      vintage: false,
      dramatic: false,
      cool: false,
      warm: false
    });
  };

  const saveEditedImage = () => {
    const canvas = canvasRef.current;
    const editedImageData = canvas.toDataURL('image/png');
    onSave(editedImageData);
  };

  const filterControls = [
    { name: 'brightness', label: 'السطوع', icon: '☀️', min: 0, max: 200, step: 5, color: '#f59e0b' },
    { name: 'contrast', label: 'التباين', icon: '🌗', min: 0, max: 200, step: 5, color: '#8b5cf6' },
    { name: 'saturation', label: 'التشبع', icon: '🎨', min: 0, max: 200, step: 5, color: '#ec4899' },
    { name: 'blur', label: 'الضبابية', icon: '🌫️', min: 0, max: 10, step: 0.5, color: '#06b6d4' },
    { name: 'hue', label: 'درجة اللون', icon: '🌈', min: -180, max: 180, step: 5, color: '#10b981' },
    { name: 'sepia', label: 'السيبيا', icon: '📸', min: 0, max: 100, step: 5, color: '#d97706' },
    { name: 'grayscale', label: 'رمادي', icon: '⚫', min: 0, max: 100, step: 5, color: '#6b7280' },
    { name: 'invert', label: 'عكس الألوان', icon: '🔄', min: 0, max: 100, step: 5, color: '#ef4444' }
  ];

  const effectPresets = [
    { name: 'vintage', label: 'كلاسيكي', icon: '📷', color: '#d97706', desc: 'تأثير كلاسيكي دافئ' },
    { name: 'dramatic', label: 'درامي', icon: '🎭', color: '#dc2626', desc: 'تباين عالي ودرامي' },
    { name: 'cool', label: 'بارد', icon: '❄️', color: '#0ea5e9', desc: 'ألوان باردة وهادئة' },
    { name: 'warm', label: 'دافئ', icon: '🔥', color: '#f97316', desc: 'ألوان دافئة ومريحة' }
  ];

  return (
    <div className="image-editor-modern">
      {/* Header */}
      <div className="editor-header-modern">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">🎨</div>
            <div>
              <h1>محرر الصور المتقدم</h1>
              <p>اطلق إبداعك مع أدوات التحرير الاحترافية</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={resetFilters} className="reset-button">
              <span className="btn-icon">🔄</span>
              إعادة تعيين
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-main-content">
        
        {/* Canvas Section */}
        <div className="canvas-section-modern">
          <div className="canvas-wrapper">
            {isLoading && (
              <div className="canvas-overlay">
                <div className="loading-animation">
                  <div className="loading-circle"></div>
                  <div className="loading-circle"></div>
                  <div className="loading-circle"></div>
                </div>
                <p>جاري تطبيق التأثيرات...</p>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={`editor-canvas ${isLoading ? 'processing' : ''}`}
            />
          </div>
        </div>

        {/* Controls Panel */}
        <div className="controls-panel-modern">
          
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'filters' ? 'active' : ''}`}
              onClick={() => setActiveTab('filters')}
            >
              <span className="tab-icon">🎛️</span>
              الفلاتر
            </button>
            <button 
              className={`tab-btn ${activeTab === 'effects' ? 'active' : ''}`}
              onClick={() => setActiveTab('effects')}
            >
              <span className="tab-icon">✨</span>
              التأثيرات
            </button>
          </div>

          {/* Filters Tab */}
          {activeTab === 'filters' && (
            <div className="filters-grid">
              {filterControls.map(filter => (
                <div key={filter.name} className="filter-card">
                  <div className="filter-header">
                    <div className="filter-info">
                      <span className="filter-icon" style={{ color: filter.color }}>
                        {filter.icon}
                      </span>
                      <span className="filter-label">{filter.label}</span>
                    </div>
                    <span className="filter-value-display">
                      {filter.name === 'blur' ? `${filters[filter.name]}px` : 
                       filter.name === 'hue' ? `${filters[filter.name]}°` : 
                       `${filters[filter.name]}%`}
                    </span>
                  </div>
                  <div className="filter-slider-container">
                    <input
                      type="range"
                      min={filter.min}
                      max={filter.max}
                      step={filter.step}
                      value={filters[filter.name]}
                      onChange={(e) => handleFilterChange(filter.name, parseFloat(e.target.value))}
                      className="modern-slider"
                      style={{ '--slider-color': filter.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Effects Tab */}
          {activeTab === 'effects' && (
            <div className="effects-grid">
              {effectPresets.map(effect => (
                <div key={effect.name} className={`effect-card ${effects[effect.name] ? 'active' : ''}`}>
                  <div className="effect-preview" style={{ '--effect-color': effect.color }}>
                    <span className="effect-icon">{effect.icon}</span>
                  </div>
                  <div className="effect-info">
                    <h4>{effect.label}</h4>
                    <p>{effect.desc}</p>
                  </div>
                  <label className="effect-toggle">
                    <input
                      type="checkbox"
                      checked={effects[effect.name]}
                      onChange={() => handleEffectToggle(effect.name)}
                    />
                    <span className="toggle-switch"></span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="editor-footer-modern">
        <button onClick={onBack} className="footer-btn secondary">
          <span className="btn-icon">←</span>
          العودة
        </button>
        <button onClick={onSkip} className="footer-btn secondary">
          <span className="btn-icon">⏭️</span>
          تخطي
        </button>
        <button onClick={saveEditedImage} className="footer-btn primary">
          <span className="btn-icon">💾</span>
          حفظ التعديلات
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
