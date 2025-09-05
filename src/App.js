import React, { useState, useEffect } from 'react';
import './App.css';
import ARConfiguration from './components/ARConfiguration';
import ImageEditor from './components/ImageEditor';
import ShareExperience from './components/ShareExperience';
import ARViewer from './components/ARViewer';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentImage, setCurrentImage] = useState(null);
  const [arConfig, setArConfig] = useState(null);
  const [message, setMessage] = useState('');
  const [showARViewer, setShowARViewer] = useState(false);
  const [savedExperiences, setSavedExperiences] = useState([]);

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
        setCurrentImage(e.target.result);
        setCurrentStep(2);
        showMessage('تم تحميل الصورة بنجاح');
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
        
        setCurrentImage(imageData);
        setCurrentStep(2);
        showMessage('تم التقاط الصورة بنجاح');
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
        
        setCurrentImage(imageData);
        setCurrentStep(2);
        showMessage('تم تحميل الصورة من الرابط بنجاح');
      };
      img.onerror = () => {
        showMessage('فشل في تحميل الصورة من الرابط');
      };
      img.src = url;
    }
  };

  const handleImageEdit = (editedImage) => {
    setCurrentImage(editedImage);
    setCurrentStep(3);
    showMessage('تم حفظ التعديلات بنجاح!');
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
        <>
          <header className="app-header">
            <h1>AR Creator Pro</h1>
            <p>إنشاء تجارب الواقع المعزز من الصور</p>
            {savedExperiences.length > 0 && (
              <div className="saved-count">
                📁 {savedExperiences.length} تجربة محفوظة
              </div>
            )}
          </header>

          <main className="app-main">
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
                <h2>رفع الصورة</h2>
                <div className="upload-options">
                  
                  {/* Gallery Upload */}
                  <div className="upload-option">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="imageInput"
                    />
                    <label htmlFor="imageInput" className="upload-button gallery">
                      <div className="upload-icon">🖼️</div>
                      <h3>من المعرض</h3>
                      <p>اختر صورة من معرض الصور</p>
                    </label>
                  </div>

                  {/* Camera Capture */}
                  <div className="upload-option">
                    <button onClick={handleCameraCapture} className="upload-button camera">
                      <div className="upload-icon">📷</div>
                      <h3>التقاط صورة</h3>
                      <p>استخدم الكاميرا لالتقاط صورة جديدة</p>
                    </button>
                  </div>

                  {/* URL Upload */}
                  <div className="upload-option">
                    <button onClick={handleUrlUpload} className="upload-button url">
                      <div className="upload-icon">🔗</div>
                      <h3>من رابط</h3>
                      <p>أدخل رابط صورة من الإنترنت</p>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Step 2: Edit */}
            {currentStep === 2 && currentImage && (
              <div className="animate-slide-in">
                <ImageEditor
                  image={currentImage}
                  onSave={handleImageEdit}
                  onBack={() => setCurrentStep(1)}
                  onSkip={() => setCurrentStep(3)}
                />
              </div>
            )}

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
        </>
      )}
    </div>
  );
}

export default App;
