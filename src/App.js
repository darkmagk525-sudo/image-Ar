import React, { useState, useEffect } from 'react';
import './App.css';
import ARConfiguration from './components/ARConfiguration';
import ShareExperience from './components/ShareExperience';
import ARViewer from './components/ARViewer';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentImage, setCurrentImage] = useState(null);
  const [arConfig, setArConfig] = useState(null);
  const [message, setMessage] = useState('');
  const [showARViewer, setShowARViewer] = useState(false);
  const [savedExperiences, setSavedExperiences] = useState([]);
  const [activeNavItem, setActiveNavItem] = useState('new-project');
  const [showPreviousProjects, setShowPreviousProjects] = useState(false);

  // Load saved experiences on component mount
  useEffect(() => {
    loadSavedExperiences();
  }, []);

  const loadSavedExperiences = () => {
    try {
      const saved = localStorage.getItem('ar-experiences');
      if (saved) {
        setSavedExperiences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved experiences:', error);
    }
  };

  // Navigation functions
  const handleNewProject = () => {
    setActiveNavItem('new-project');
    setCurrentStep(1);
    setCurrentImage(null);
    setArConfig(null);
    setMessage('');
    setShowARViewer(false);
  };

  const handlePreviousProjects = () => {
    setActiveNavItem('previous-projects');
    setShowPreviousProjects(true);
    setMessage('');
  };

  const handleAR = () => {
    setActiveNavItem('ar');
    if (currentImage && arConfig) {
      setShowARViewer(true);
    } else {
      setMessage('يرجى رفع صورة وتكوين إعدادات AR أولاً');
    }
  };

  const handleAI = () => {
    setActiveNavItem('ai');
    setMessage('مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك؟');
  };

  const loadPreviousProject = (experience) => {
    setCurrentImage(experience.image);
    setArConfig(experience.config);
    setCurrentStep(3); // Go to AR configuration step
    setShowPreviousProjects(false);
    setActiveNavItem('new-project');
    setMessage('تم تحميل المشروع بنجاح!');
  };

  const saveExperience = (experience) => {
    try {
      const updatedExperiences = [...savedExperiences, experience];
      setSavedExperiences(updatedExperiences);
      localStorage.setItem('ar-experiences', JSON.stringify(updatedExperiences));
      showMessage('تم حفظ التجربة بنجاح!');
    } catch (error) {
      console.error('Error saving experience:', error);
      showMessage('فشل في حفظ التجربة');
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        autoEnhanceAndProceed(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element for camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      // Create modal for camera interface
      const modal = document.createElement('div');
      modal.className = 'camera-modal';
      modal.innerHTML = `
        <div class="camera-container">
          <div class="camera-header">
            <h3>📷 التقاط صورة</h3>
            <button class="close-camera">✕</button>
          </div>
          <div class="camera-preview">
            <video autoplay playsinline></video>
            <canvas style="display: none;"></canvas>
          </div>
          <div class="camera-controls">
            <button class="capture-btn">📸 التقاط</button>
            <button class="cancel-btn">إلغاء</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const videoElement = modal.querySelector('video');
      const canvas = modal.querySelector('canvas');
      const captureBtn = modal.querySelector('.capture-btn');
      const cancelBtn = modal.querySelector('.cancel-btn');
      const closeBtn = modal.querySelector('.close-camera');
      
      videoElement.srcObject = stream;
      
      const closeCamera = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
      captureBtn.onclick = () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        autoEnhanceAndProceed(imageData);
        closeCamera();
      };
      
      cancelBtn.onclick = closeCamera;
      closeBtn.onclick = closeCamera;
      
    } catch (error) {
      console.error('Camera error:', error);
      showMessage('فشل في الوصول للكاميرا');
    }
  };

  const handleUrlUpload = () => {
    const url = prompt('أدخل رابط الصورة:');
    if (url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        autoEnhanceAndProceed(imageData);
      };
      img.onerror = () => {
        showMessage('فشل في تحميل الصورة من الرابط');
      };
      img.src = url;
    }
  };

  // Basic auto-enhance using canvas filters as a lightweight AI-like improvement
  const autoEnhanceAndProceed = (dataUrl) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 1000;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        // Apply gentle enhancements: brightness, contrast, saturation, slight sharpness approximation
        ctx.filter = 'brightness(105%) contrast(110%) saturate(110%)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const enhanced = canvas.toDataURL('image/png');
        setCurrentImage(enhanced);
        setCurrentStep(3);
        showMessage('تم تحسين الصورة تلقائياً وجاهزة لإعداد AR');
      };
      img.src = dataUrl;
    } catch (err) {
      // Fallback to original
      setCurrentImage(dataUrl);
      setCurrentStep(3);
      showMessage('تم تحميل الصورة');
    }
  };


  const handleARSave = (config) => {
    const arData = {
      ...config,
      image: currentImage,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setArConfig(arData);
    saveExperience(arData);
    setCurrentStep(4);
    showMessage('تم حفظ إعدادات AR بنجاح!');
  };

  const handleViewAR = () => {
    if (arConfig) {
      setShowARViewer(true);
    } else {
      showMessage('لا توجد تجربة AR لعرضها');
    }
  };

  const handleCloseARViewer = () => {
    setShowARViewer(false);
  };

  const resetApp = () => {
    setCurrentStep(1);
    setCurrentImage(null);
    setArConfig(null);
    setShowARViewer(false);
    showMessage('تم إعادة تعيين التطبيق');
  };

  return (
    <div className="App" dir="rtl">
      {showARViewer && arConfig ? (
        <ARViewer 
          arConfig={arConfig} 
          onClose={handleCloseARViewer}
        />
      ) : (
        <div className="app-layout">
          {/* Sidebar Navigation */}
          <aside className="app-sidebar">
            <div className="logo-section">
              <div className="logo">
                <span className="logo-icon">🎨</span>
                <span className="logo-text">E-asy comme</span>
              </div>
            </div>
            
              <nav className="sidebar-nav">
                <div 
                  className={`nav-item ${activeNavItem === 'new-project' ? 'active' : ''}`}
                  onClick={handleNewProject}
                >
                  <span className="nav-icon">✨</span>
                  <span className="nav-text">New project</span>
                </div>
                <div 
                  className={`nav-item ${activeNavItem === 'previous-projects' ? 'active' : ''}`}
                  onClick={handlePreviousProjects}
                >
                  <span className="nav-icon">📁</span>
                  <span className="nav-text">Projets antérieurs</span>
                </div>
                <div 
                  className={`nav-item ${activeNavItem === 'ar' ? 'active' : ''}`}
                  onClick={handleAR}
                >
                  <span className="nav-icon">🥽</span>
                  <span className="nav-text">AR</span>
                </div>
              </nav>

            <div className="ai-section">
              <div 
                className={`ai-bubble ${activeNavItem === 'ai' ? 'active' : ''}`}
                onClick={handleAI}
              >
                <span className="ai-text">AI</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="app-main">
            {/* Message Display */}
            {message && (
              <div className="message-display">
                <p>{message}</p>
              </div>
            )}

            {/* Previous Projects Display */}
            {showPreviousProjects && (
              <div className="previous-projects">
                <h2>المشاريع السابقة ({savedExperiences.length})</h2>
                {savedExperiences.length === 0 ? (
                  <p className="no-projects">لا توجد مشاريع محفوظة</p>
                ) : (
                  <div className="projects-grid">
                    {savedExperiences.map((experience, index) => (
                      <div key={index} className="project-card" onClick={() => loadPreviousProject(experience)}>
                        <div className="project-preview">
                          <img src={experience.image} alt={`Project ${index + 1}`} />
                        </div>
                        <div className="project-info">
                          <h3>مشروع {index + 1}</h3>
                          <p>تم الحفظ: {new Date(experience.timestamp).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  className="close-projects-btn"
                  onClick={() => setShowPreviousProjects(false)}
                >
                  إغلاق
                </button>
              </div>
            )}

            {/* Step Indicator */}
            <div className="step-indicator">
              <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep === 1 ? 'current' : ''}`}>
                <span>1</span>
                <label>رفع الصورة</label>
              </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep === 2 ? 'current' : ''}`}>
                <span>2</span>
                <label>تحرير</label>
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep === 3 ? 'current' : ''}`}>
                <span>3</span>
                <label>إعداد AR</label>
              </div>
              <div className={`step ${currentStep >= 4 ? 'active' : ''} ${currentStep === 4 ? 'current' : ''}`}>
                <span>4</span>
                <label>مشاركة</label>
              </div>
            </div>

            {/* Step 1: Upload */}
            {currentStep === 1 && (
              <div className="upload-section animate-fade-in">
                <div className="upload-container">
                  <div className="upload-card">
                    <h2>Upload image</h2>
                    <div className="upload-cloud">
                      <span className="cloud-icon">☁️</span>
                    </div>
                    <div className="upload-options-layout">
                      {/* Gallery on top */}
                      <div className="upload-option-top">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="imageInput"
                    />
                        <label htmlFor="imageInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                          <span className="option-icon">🖼️</span>
                          <span className="option-text">Upload image</span>
                    </label>
                  </div>

                      {/* Link and Camera side by side */}
                      <div className="upload-options-bottom">
                        <div className="upload-option-new" onClick={handleUrlUpload}>
                          <span className="option-icon">🔗</span>
                          <span className="option-text">Paste the image link</span>
                        </div>
                        <div className="upload-option-new" onClick={handleCameraCapture}>
                          <span className="option-icon">📷</span>
                          <span className="option-text">pick up image</span>
                        </div>
                      </div>
                  </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Edit */}
            {/* التحرير اليدوي غير مطلوب حسب طلب العميل، سيتم التخطي تلقائياً */}

            {/* Step 3: AR Configuration */}
            {currentStep === 3 && currentImage && (
              <div className="animate-slide-in">
                <ARConfiguration
                  image={currentImage}
                  onSave={handleARSave}
                  onBack={() => setCurrentStep(2)}
                />
              </div>
            )}

            {/* Step 4: Share Experience */}
            {currentStep === 4 && arConfig && (
              <div className="animate-slide-in">
                <ShareExperience
                  arConfig={arConfig}
                  onViewAR={handleViewAR}
                  onNewExperience={resetApp}
                />
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className="message-toast animate-bounce-in">
                {message}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
