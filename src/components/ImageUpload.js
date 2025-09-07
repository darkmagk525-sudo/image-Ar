import React, { useRef, useState } from 'react';

const ImageUpload = ({ onImageUpload, showToast }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);

  React.useEffect(() => {
    // Check if camera is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setCameraSupported(true);
    }
  }, []);

  const handleFiles = (files) => {
    if (files && files[0]) {
      const file = files[0];
      
      if (!file.type.startsWith('image/')) {
        showToast('يرجى اختيار ملف صورة صالح', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
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
      
      // Create modal for camera capture
      const modal = document.createElement('div');
      modal.className = 'camera-modal';
      modal.innerHTML = `
        <div class="camera-content">
          <div class="camera-header">
            <h3>التقاط صورة</h3>
            <button class="close-camera">×</button>
          </div>
          <div class="camera-preview"></div>
          <div class="camera-controls">
            <button class="capture-btn">التقاط</button>
            <button class="cancel-btn">إلغاء</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      modal.querySelector('.camera-preview').appendChild(video);
      
      // Handle capture
      modal.querySelector('.capture-btn').onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.9);
        onImageUpload(dataURL);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
        showToast('تم التقاط الصورة بنجاح', 'success');
      };
      
      // Handle cancel/close
      const closeCamera = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
      modal.querySelector('.cancel-btn').onclick = closeCamera;
      modal.querySelector('.close-camera').onclick = closeCamera;
      
    } catch (error) {
      console.error('Camera access error:', error);
      showToast('فشل في الوصول للكاميرا', 'error');
    }
  };

  return (
    <div className="image-upload">
      <div className="upload-header">
        <h2>رفع الصورة</h2>
        <p>اختر صورة لإنشاء تجربة الواقع المعزز</p>
      </div>

      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <h3>اسحب وأفلت الصورة هنا</h3>
        <p>أو انقر لاختيار ملف</p>
        <div className="supported-formats">
          <small>يدعم: JPG, PNG, GIF, WebP</small>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div className="upload-options">
        <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          اختيار من الجهاز
        </button>

        {cameraSupported && (
          <button className="camera-btn" onClick={handleCameraCapture}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            التقاط بالكاميرا
          </button>
        )}
      </div>

      <div className="upload-tips">
        <h4>نصائح للحصول على أفضل النتائج:</h4>
        <ul>
          <li>استخدم صور عالية الجودة (1080p أو أعلى)</li>
          <li>تأكد من وضوح الصورة وعدم ضبابيتها</li>
          <li>اختر صور بخلفية واضحة ومتباينة</li>
          <li>تجنب الصور المظلمة جداً أو الساطعة جداً</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;
