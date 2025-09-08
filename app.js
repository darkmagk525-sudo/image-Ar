/**
 * AR Creator Pro - Professional AR Image Viewer
 * Modern ES6+ implementation with advanced features
 */

class ARCreatorPro {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 4;
        this.currentImage = null;
        this.editedImage = null;
        this.arData = {};
        this.fabricCanvas = null;
        this.cameraStream = null;
        this.facingMode = 'environment';
        this.arExperiences = new Map();
        
        // Configuration
        this.config = {
            maxImageSize: 5 * 1024 * 1024, // 5MB
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            qrSize: 256,
            arDefaults: {
                scale: 1.0,
                height: 0.0,
                rotation: 0,
                animation: false,
                glow: false,
                shadow: false,
                marker: 'hiro'
            }
        };
        
        this.init();
    }

    async init() {
        try {
            // Check if running on file:// protocol and show immediate warning
            if (window.location.protocol === 'file:') {
                console.error('❌ التطبيق يعمل على بروتوكول file:// - هذا سيسبب مشاكل!');
                
                // Show immediate warning overlay
                this.showFileProtocolWarning();
                
                // Also show toast
                setTimeout(() => {
                    this.showToast('⚠️ يجب تشغيل التطبيق على خادم محلي للعمل بشكل صحيح', 'error', 20000);
                }, 1000);
                
                return; // Stop initialization to prevent further errors
            }

            await this.showLoadingScreen();
            this.bindEvents();
            this.setupImageEditor();
            this.setupDragDrop();
            this.loadStoredExperiences();
            await this.hideLoadingScreen();
            this.showToast('مرحباً بك في AR Creator Pro!', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('حدث خطأ في التهيئة', 'error');
        }
    }

    async showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressFill = document.getElementById('progress-fill');
        const loadingText = document.getElementById('loading-text');
        
        const steps = [
            'تحميل المكتبات...',
            'إعداد محرر الصور...',
            'تهيئة الواقع المعزز...',
            'جاهز للاستخدام!'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            loadingText.textContent = steps[i];
            progressFill.style.width = `${((i + 1) / steps.length) * 100}%`;
            await this.delay(800);
        }
    }

    async hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        await this.delay(500);
        loadingScreen.style.display = 'none';
    }

    bindEvents() {
        // Navigation events
        document.getElementById('help-btn')?.addEventListener('click', () => this.showModal('help-modal'));
        document.getElementById('start-creating')?.addEventListener('click', () => this.scrollToStep(1));
        document.getElementById('view-demo')?.addEventListener('click', () => this.showDemo());

        // Upload events
        document.getElementById('camera-btn')?.addEventListener('click', () => this.startCamera());
        document.getElementById('upload-btn')?.addEventListener('click', () => this.triggerFileUpload());
        document.getElementById('file-input')?.addEventListener('change', (e) => this.handleFileUpload(e));

        // Camera events
        document.getElementById('capture-btn')?.addEventListener('click', () => this.captureImage());
        document.getElementById('switch-camera')?.addEventListener('click', () => this.switchCamera());
        document.getElementById('close-camera')?.addEventListener('click', () => this.stopCamera());

        // Editor events
        this.bindEditorEvents();

        // AR configuration events
        this.bindARConfigEvents();

        // Share events
        this.bindShareEvents();

        // AR viewer events
        document.getElementById('test-ar')?.addEventListener('click', () => this.startARViewer());
        document.getElementById('close-ar')?.addEventListener('click', () => this.exitARViewer());

        // Modal events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal;
                this.hideModal(modalId);
            });
        });

        // Step navigation
        document.getElementById('back-to-upload')?.addEventListener('click', () => this.goToStep(1));
        document.getElementById('continue-to-ar')?.addEventListener('click', () => this.goToStep(3));
        document.getElementById('back-to-editor')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('generate-ar')?.addEventListener('click', () => this.generateARExperience());
        document.getElementById('create-new')?.addEventListener('click', () => this.resetApp());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    bindEditorEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchEditorTab(e.target.dataset.tab));
        });

        // Tool buttons
        document.getElementById('crop-tool')?.addEventListener('click', () => this.activateTool('crop'));
        document.getElementById('rotate-tool')?.addEventListener('click', () => this.rotateCurrent());
        document.getElementById('flip-tool')?.addEventListener('click', () => this.flipCurrent());
        document.getElementById('reset-tool')?.addEventListener('click', () => this.resetEditor());

        // Adjustment controls
        this.bindSliderEvents();

        // Filter selection
        document.querySelectorAll('.filter-item').forEach(item => {
            item.addEventListener('click', (e) => this.applyFilter(e.currentTarget.dataset.filter));
        });
    }

    bindSliderEvents() {
        const sliders = ['brightness', 'contrast', 'saturation', 'sharpness', 'blur', 'glow', 'shadow'];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueSpan = document.getElementById(`${sliderId}-value`);
            
            if (slider && valueSpan) {
                slider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    const unit = sliderId === 'blur' ? '' : '%';
                    valueSpan.textContent = value + unit;
                    this.applyImageAdjustments();
                });
            }
        });
    }

    bindARConfigEvents() {
        // Marker selection
        document.querySelectorAll('input[name="marker-type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateARPreview());
        });
    }

    bindShareEvents() {
        document.getElementById('copy-link')?.addEventListener('click', () => this.copyARLink());
        document.getElementById('download-qr')?.addEventListener('click', () => this.downloadQR());
        document.getElementById('print-qr')?.addEventListener('click', () => this.printQR());
        
        // Social sharing
        document.getElementById('share-whatsapp')?.addEventListener('click', () => this.shareToWhatsApp());
        document.getElementById('share-telegram')?.addEventListener('click', () => this.shareToTelegram());
        document.getElementById('share-email')?.addEventListener('click', () => this.shareToEmail());
        document.getElementById('share-more')?.addEventListener('click', () => this.shareNative());

        // AR viewer controls
        document.getElementById('ar-screenshot')?.addEventListener('click', () => this.takeARScreenshot());
        document.getElementById('ar-record')?.addEventListener('click', () => this.recordAR());
        document.getElementById('ar-share-live')?.addEventListener('click', () => this.shareLiveAR());
    }

    setupDragDrop() {
        const dragArea = document.getElementById('drag-drop-area');
        if (!dragArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dragArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dragArea.addEventListener(eventName, () => dragArea.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dragArea.addEventListener(eventName, () => dragArea.classList.remove('drag-over'), false);
        });

        dragArea.addEventListener('drop', (e) => this.handleDrop(e), false);
        dragArea.addEventListener('click', () => this.triggerFileUpload());
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    async handleDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => this.config.supportedFormats.includes(file.type));
        
        if (imageFiles.length === 0) {
            this.showToast('يرجى إسقاط ملفات صور صحيحة', 'error');
            return;
        }

        if (imageFiles.length > 1) {
            this.showToast('يمكن معالجة صورة واحدة فقط في المرة', 'warning');
        }

        await this.processImage(imageFiles[0]);
    }

    triggerFileUpload() {
        document.getElementById('file-input')?.click();
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!this.config.supportedFormats.includes(file.type)) {
            this.showToast('نوع الملف غير مدعوم', 'error');
            return;
        }

        if (file.size > this.config.maxImageSize) {
            this.showToast('حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)', 'error');
            return;
        }

        await this.processImage(file);
    }

    async startCamera() {
        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: this.facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            const video = document.getElementById('camera-video');
            const cameraInterface = document.getElementById('camera-interface');
            
            video.srcObject = this.cameraStream;
            cameraInterface.style.display = 'block';
            
            // Hide upload options
            document.getElementById('upload-zone').style.display = 'none';
            
            this.showToast('الكاميرا جاهزة للتصوير', 'success');
        } catch (error) {
            console.error('Camera error:', error);
            this.showToast('لا يمكن الوصول للكاميرا', 'error');
        }
    }

    async switchCamera() {
        this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
        await this.stopCamera();
        await this.startCamera();
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }

        document.getElementById('camera-interface').style.display = 'none';
        document.getElementById('upload-zone').style.display = 'block';
    }

    async captureImage() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            await this.processImage(blob);
            this.stopCamera();
        } catch (error) {
            console.error('Capture error:', error);
            this.showToast('فشل في التقاط الصورة', 'error');
        }
    }

    async processImage(imageFile) {
        try {
            this.showToast('جاري معالجة الصورة...', 'info');
            
            const imageUrl = await this.fileToDataURL(imageFile);
            this.currentImage = imageUrl;
            
            // Update image size info
            const sizeKB = Math.round((imageFile.size || 0) / 1024);
            document.getElementById('image-size').textContent = `${sizeKB} KB`;
            
            await this.setupImageEditor(imageUrl);
            this.goToStep(2);
            
            this.showToast('تم تحميل الصورة بنجاح', 'success');
        } catch (error) {
            console.error('Image processing error:', error);
            this.showToast('فشل في معالجة الصورة', 'error');
        }
    }

    fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async setupImageEditor(imageUrl) {
        try {
            console.log('Setting up image editor with URL:', imageUrl ? 'URL provided' : 'No URL');
            
            const canvasContainer = document.querySelector('.editor-canvas-container');
            const canvasElement = document.getElementById('editor-canvas');
            
            if (!canvasElement) {
                throw new Error('Canvas element not found');
            }

            if (this.fabricCanvas) {
                this.fabricCanvas.dispose();
                this.fabricCanvas = null;
            }

            // Check if Fabric.js is loaded
            if (typeof fabric === 'undefined') {
                throw new Error('Fabric.js library not loaded');
            }

            // Initialize Fabric.js canvas
            this.fabricCanvas = new fabric.Canvas('editor-canvas', {
                width: 800,
                height: 600,
                backgroundColor: '#f8f9fa'
            });

            console.log('Fabric canvas initialized');

            if (imageUrl) {
                // Load image
                fabric.Image.fromURL(imageUrl, (img) => {
                    if (!img) {
                        console.error('Failed to load image');
                        this.showToast('فشل في تحميل الصورة', 'error');
                        return;
                    }

                    // Scale image to fit canvas
                    const scale = Math.min(
                        this.fabricCanvas.width / img.width,
                        this.fabricCanvas.height / img.height
                    );
                    
                    img.scale(scale);
                    img.center();
                    
                    this.fabricCanvas.add(img);
                    this.fabricCanvas.setActiveObject(img);
                    this.fabricCanvas.renderAll();
                    
                    console.log('Image loaded and added to canvas');
                }, { crossOrigin: 'anonymous' });

                // Update filter previews
                this.updateFilterPreviews(imageUrl);
            }
        } catch (error) {
            console.error('Setup image editor error:', error);
            this.showToast(`خطأ في إعداد محرر الصور: ${error.message}`, 'error');
        }
    }

    switchEditorTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.control-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${tabName}-panel`).classList.add('active');
    }

    activateTool(toolName) {
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`#${toolName}-tool`).classList.add('active');
        
        // Implement tool functionality
        switch (toolName) {
            case 'crop':
                this.enableCropMode();
                break;
        }
    }

    enableCropMode() {
        if (!this.fabricCanvas) return;
        
        const activeObject = this.fabricCanvas.getActiveObject();
        if (activeObject && activeObject.type === 'image') {
            // Add crop functionality
            this.showToast('اسحب لتحديد منطقة القص', 'info');
        }
    }

    rotateCurrent() {
        if (!this.fabricCanvas) return;
        
        const activeObject = this.fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.rotate(activeObject.angle + 90);
            this.fabricCanvas.renderAll();
        }
    }

    flipCurrent() {
        if (!this.fabricCanvas) return;
        
        const activeObject = this.fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.set('flipX', !activeObject.flipX);
            this.fabricCanvas.renderAll();
        }
    }

    resetEditor() {
        if (this.currentImage) {
            this.setupImageEditor(this.currentImage);
            this.resetSliders();
            this.showToast('تم إعادة تعيين التحرير', 'success');
        }
    }

    resetSliders() {
        const sliders = {
            'brightness': 100,
            'contrast': 100,
            'saturation': 100,
            'sharpness': 100,
            'blur': 0,
            'glow': 0,
            'shadow': 0
        };

        Object.entries(sliders).forEach(([id, value]) => {
            const slider = document.getElementById(id);
            const valueSpan = document.getElementById(`${id}-value`);
            
            if (slider) slider.value = value;
            if (valueSpan) {
                const unit = id === 'blur' ? '' : '%';
                valueSpan.textContent = value + unit;
            }
        });
    }

    applyImageAdjustments() {
        if (!this.fabricCanvas) return;

        const activeObject = this.fabricCanvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') return;

        const brightness = document.getElementById('brightness').value / 100;
        const contrast = document.getElementById('contrast').value / 100;
        const saturation = document.getElementById('saturation').value / 100;
        const blur = document.getElementById('blur').value;

        const filters = [];
        
        if (brightness !== 1) {
            filters.push(new fabric.Image.filters.Brightness({ brightness: brightness - 1 }));
        }
        
        if (contrast !== 1) {
            filters.push(new fabric.Image.filters.Contrast({ contrast: contrast - 1 }));
        }
        
        if (saturation !== 1) {
            filters.push(new fabric.Image.filters.Saturation({ saturation: saturation - 1 }));
        }
        
        if (blur > 0) {
            filters.push(new fabric.Image.filters.Blur({ blur: blur / 10 }));
        }

        activeObject.filters = filters;
        activeObject.applyFilters();
        this.fabricCanvas.renderAll();
    }

    applyFilter(filterType) {
        if (!this.fabricCanvas) return;

        // Update UI
        document.querySelectorAll('.filter-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');

        const activeObject = this.fabricCanvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') return;

        let filters = [];

        switch (filterType) {
            case 'vintage':
                filters = [
                    new fabric.Image.filters.Sepia(),
                    new fabric.Image.filters.Brightness({ brightness: 0.1 }),
                    new fabric.Image.filters.Contrast({ contrast: 0.2 })
                ];
                break;
            case 'bw':
                filters = [
                    new fabric.Image.filters.Grayscale(),
                    new fabric.Image.filters.Contrast({ contrast: 0.1 })
                ];
                break;
            case 'warm':
                filters = [
                    new fabric.Image.filters.ColorMatrix({
                        matrix: [
                            1.2, 0, 0, 0, 0,
                            0, 1.1, 0, 0, 0,
                            0, 0, 0.8, 0, 0,
                            0, 0, 0, 1, 0
                        ]
                    })
                ];
                break;
            case 'cool':
                filters = [
                    new fabric.Image.filters.ColorMatrix({
                        matrix: [
                            0.8, 0, 0, 0, 0,
                            0, 1.1, 0, 0, 0,
                            0, 0, 1.2, 0, 0,
                            0, 0, 0, 1, 0
                        ]
                    })
                ];
                break;
            case 'dramatic':
                filters = [
                    new fabric.Image.filters.Contrast({ contrast: 0.3 }),
                    new fabric.Image.filters.Brightness({ brightness: -0.1 })
                ];
                break;
            case 'none':
            default:
                filters = [];
                break;
        }

        activeObject.filters = filters;
        activeObject.applyFilters();
        this.fabricCanvas.renderAll();
    }

    async generateEditedImage() {
        if (!this.fabricCanvas) return null;

        return new Promise(resolve => {
            this.fabricCanvas.toBlob(resolve, 'image/jpeg', 0.9);
        });
    }

    updateARPreview() {
        const preview = document.getElementById('ar-image-preview');
        if (preview && this.currentImage) {
            preview.style.backgroundImage = `url(${this.currentImage})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.style.transform = `translate(-50%, -50%) scale(1)`;
            preview.style.bottom = '50%';
        }
    }

    async generateARExperience() {
        try {
            console.log('Starting AR experience generation...');
            this.showToast('جاري إنشاء تجربة AR...', 'info');

            // Validate current image
            if (!this.currentImage) {
                throw new Error('لا توجد صورة محددة');
            }

            // Generate edited image
            console.log('Generating edited image...');
            const editedBlob = await this.generateEditedImage();
            const editedImageUrl = editedBlob ? await this.blobToDataURL(editedBlob) : this.currentImage;
            console.log('Edited image generated successfully');

            // Create AR data with proper defaults
            const arId = this.generateUniqueId();
            console.log('Generated AR ID:', arId);
            
            const arData = {
                id: arId,
                image: editedImageUrl,
                marker: document.querySelector('input[name="marker-type"]:checked')?.value || 'hiro',
                scale: 1.0,
                height: 0.0,
                rotation: 0,
                timestamp: Date.now(),
                title: `AR Experience ${new Date().toLocaleDateString('ar-SA')}`
            };

            console.log('AR data created:', arData);

            // Store AR experience
            this.arExperiences.set(arId, arData);
            this.saveToLocalStorage(arId, arData);
            console.log('AR experience stored');

            // Generate QR code and link
            const arUrl = `${window.location.origin}${window.location.pathname}?ar=${arId}`;
            console.log('AR URL:', arUrl);
            
            await this.generateQRCode(arUrl);
            console.log('QR code generated successfully');

            // Update UI elements with error checking
            const arLinkElement = document.getElementById('ar-link');
            const creationDateElement = document.getElementById('creation-date');
            const markerTypeElement = document.getElementById('marker-type');

            if (arLinkElement) {
                arLinkElement.value = arUrl;
            } else {
                console.warn('ar-link element not found');
            }

            if (creationDateElement) {
                creationDateElement.textContent = new Date().toLocaleDateString('ar-SA');
            } else {
                console.warn('creation-date element not found');
            }

            if (markerTypeElement) {
                markerTypeElement.textContent = this.getMarkerDisplayName(arData.marker);
            } else {
                console.warn('marker-type element not found');
            }

            this.arData = arData;
            this.goToStep(4);
            
            console.log('AR experience creation completed successfully');
            this.showToast('تم إنشاء تجربة AR بنجاح!', 'success');
        } catch (error) {
            console.error('AR generation error:', error);
            this.showToast(`فشل في إنشاء تجربة AR: ${error.message}`, 'error');
        }
    }

    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    getMarkerDisplayName(markerType) {
        const names = {
            'hiro': 'Hiro (افتراضي)',
            'kanji': 'Kanji',
            'custom': 'مخصص'
        };
        return names[markerType] || markerType;
    }

    async generateQRCode(url) {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) {
            throw new Error('عنصر QR canvas غير موجود');
        }

        // التحقق من وجود مكتبة QRCode
        if (typeof QRCode === 'undefined') {
            console.error('QRCode library not loaded');
            throw new Error('مكتبة QRCode غير محملة');
        }

        return new Promise((resolve, reject) => {
            try {
                QRCode.toCanvas(canvas, url, {
                    width: this.config.qrSize,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    },
                    errorCorrectionLevel: 'M'
                }, (error) => {
                    if (error) {
                        console.error('QR generation error:', error);
                        reject(new Error(`فشل في إنشاء QR: ${error.message}`));
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                console.error('QRCode error:', error);
                reject(new Error(`خطأ في QRCode: ${error.message}`));
            }
        });
    }

    saveToLocalStorage(id, data) {
        try {
            localStorage.setItem(`ar_${id}`, JSON.stringify(data));
            
            // Update experiences list
            const experiences = JSON.parse(localStorage.getItem('ar_experiences') || '[]');
            experiences.unshift({ id, title: data.title, timestamp: data.timestamp });
            
            // Keep only last 10 experiences
            const recentExperiences = experiences.slice(0, 10);
            localStorage.setItem('ar_experiences', JSON.stringify(recentExperiences));
        } catch (error) {
            console.error('Storage error:', error);
        }
    }

    loadStoredExperiences() {
        try {
            const experiences = JSON.parse(localStorage.getItem('ar_experiences') || '[]');
            experiences.forEach(exp => {
                const data = JSON.parse(localStorage.getItem(`ar_${exp.id}`) || '{}');
                if (data.id) {
                    this.arExperiences.set(exp.id, data);
                }
            });
        } catch (error) {
            console.error('Load experiences error:', error);
        }
    }

    async copyARLink() {
        const linkInput = document.getElementById('ar-link');
        if (!linkInput) return;

        try {
            await navigator.clipboard.writeText(linkInput.value);
            this.showToast('تم نسخ الرابط!', 'success');
        } catch (error) {
            // Fallback for older browsers
            linkInput.select();
            document.execCommand('copy');
            this.showToast('تم نسخ الرابط!', 'success');
        }
    }

    downloadQR() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `ar-qr-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        this.showToast('تم تحميل رمز QR!', 'success');
    }

    printQR() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>طباعة رمز QR</title>
                    <style>
                        body { text-align: center; font-family: Arial, sans-serif; }
                        img { max-width: 100%; height: auto; }
                        h2 { color: #333; }
                    </style>
                </head>
                <body>
                    <h2>رمز QR لتجربة الواقع المعزز</h2>
                    <img src="${canvas.toDataURL()}" alt="QR Code">
                    <p>امسح الرمز بكاميرا الهاتف لعرض التجربة</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    shareToWhatsApp() {
        const link = document.getElementById('ar-link')?.value;
        if (!link) return;

        const text = encodeURIComponent(`شاهد تجربة الواقع المعزز الرائعة هذه: ${link}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }

    shareToTelegram() {
        const link = document.getElementById('ar-link')?.value;
        if (!link) return;

        const text = encodeURIComponent(`شاهد تجربة الواقع المعزز: ${link}`);
        window.open(`https://t.me/share/url?url=${link}&text=${text}`, '_blank');
    }

    shareToEmail() {
        const link = document.getElementById('ar-link')?.value;
        if (!link) return;

        const subject = encodeURIComponent('تجربة واقع معزز مذهلة');
        const body = encodeURIComponent(`مرحباً،\n\nأردت مشاركة هذه التجربة الرائعة للواقع المعزز معك:\n\n${link}\n\nما عليك سوى فتح الرابط بكاميرا هاتفك والاستمتاع بالتجربة!\n\nتحياتي`);
        
        window.open(`mailto:?subject=${subject}&body=${body}`);
    }

    async shareNative() {
        const link = document.getElementById('ar-link')?.value;
        if (!link) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'تجربة واقع معزز',
                    text: 'شاهد هذه التجربة الرائعة للواقع المعزز',
                    url: link
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            this.copyARLink();
        }
    }

    startARViewer() {
        const urlParams = new URLSearchParams(window.location.search);
        const arId = urlParams.get('ar') || this.arData.id;
        
        if (!arId) {
            this.showToast('لا توجد تجربة AR للعرض', 'error');
            return;
        }

        this.loadARExperience(arId);
    }

    loadARExperience(arId) {
        let arData = this.arExperiences.get(arId);
        
        if (!arData) {
            // Try to load from localStorage
            try {
                const storedData = localStorage.getItem(`ar_${arId}`);
                if (storedData) {
                    arData = JSON.parse(storedData);
                    this.arExperiences.set(arId, arData);
                }
            } catch (error) {
                console.error('Failed to load AR data:', error);
            }
        }

        if (!arData) {
            this.showToast('لم يتم العثور على تجربة AR', 'error');
            return;
        }

        this.setupARScene(arData);
        document.getElementById('ar-viewer').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    setupARScene(arData) {
        const arImage = document.getElementById('ar-target-image');
        const arDisplayImage = document.getElementById('ar-display-image');
        const arMarker = document.getElementById('ar-marker');

        // Set image source and wait for it to load
        arImage.onload = () => {
            console.log('AR image loaded successfully');
            // Update the a-image src attribute after the asset is loaded
            arDisplayImage.setAttribute('src', '#ar-target-image');
        };
        
        arImage.onerror = (error) => {
            console.error('Failed to load AR image:', error);
            this.showToast('فشل في تحميل صورة AR', 'error');
        };
        
        arImage.src = arData.image;
        
        // Configure display properties with proper scaling
        const scale = arData.scale || 1.0;
        const height = arData.height || 0.0;
        const rotation = arData.rotation || 0;
        
        arDisplayImage.setAttribute('scale', `${scale} ${scale} ${scale}`);
        arDisplayImage.setAttribute('position', `0 ${height} 0`);
        arDisplayImage.setAttribute('rotation', `-90 ${rotation} 0`);
        arDisplayImage.setAttribute('width', '2');
        arDisplayImage.setAttribute('height', '2');

        // Configure marker
        const markerType = arData.marker || 'hiro';
        arMarker.setAttribute('preset', markerType);

        // Update status
        this.updateARStatus('ابحث عن العلامة...');
        
        // Listen for marker events
        arMarker.addEventListener('markerFound', () => {
            this.updateARStatus('تم العثور على العلامة!');
            console.log('Marker found - AR should be visible now');
        });

        arMarker.addEventListener('markerLost', () => {
            this.updateARStatus('ابحث عن العلامة...');
            console.log('Marker lost');
        });
    }

    updateARStatus(message) {
        const statusElement = document.getElementById('ar-status');
        if (statusElement) {
            const statusText = statusElement.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = message;
            }
        }
    }

    exitARViewer() {
        document.getElementById('ar-viewer').style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Stop AR scene
        const scene = document.getElementById('ar-scene');
        if (scene && scene.exitVR) {
            scene.exitVR();
        }
    }

    async takeARScreenshot() {
        try {
            const scene = document.getElementById('ar-scene');
            if (!scene) return;

            // Get canvas from A-Frame scene
            const canvas = scene.canvas;
            if (!canvas) return;

            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `ar-screenshot-${Date.now()}.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
                
                this.showToast('تم حفظ لقطة الشاشة!', 'success');
            });
        } catch (error) {
            console.error('Screenshot error:', error);
            this.showToast('فشل في أخذ لقطة الشاشة', 'error');
        }
    }

    recordAR() {
        // Implement AR recording functionality
        this.showToast('ميزة التسجيل قيد التطوير', 'info');
    }

    shareLiveAR() {
        // Implement live AR sharing
        this.shareNative();
    }

    goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > this.maxSteps) return;

        // Hide all steps
        document.querySelectorAll('.step-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target step
        const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
            this.currentStep = stepNumber;
            
            // Scroll to step
            targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Update progress
        this.updateStepProgress(stepNumber);
    }

    updateStepProgress(currentStep) {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index + 1 < currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === currentStep) {
                step.classList.add('active');
            }
        });
    }

    scrollToStep(stepNumber) {
        // Hide hero section and show main content
        document.getElementById('hero-section').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        this.goToStep(stepNumber);
    }

    resetApp() {
        // Reset all data
        this.currentImage = null;
        this.editedImage = null;
        this.arData = {};
        
        if (this.fabricCanvas) {
            this.fabricCanvas.dispose();
            this.fabricCanvas = null;
        }

        // Reset UI
        document.getElementById('hero-section').style.display = 'block';
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('file-input').value = '';
        
        // Reset sliders and filters
        this.resetSliders();
        document.querySelectorAll('.filter-item').forEach(item => item.classList.remove('active'));
        document.querySelector('[data-filter="none"]')?.classList.add('active');

        this.currentStep = 1;
        this.showToast('تم إعادة تعيين التطبيق', 'success');
    }

    showDemo() {
        // Load demo image and show workflow
        const demoImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5صورة تجريبية</dGV4dD48L3N2Zz4=';
        
        this.currentImage = demoImageUrl;
        this.scrollToStep(1);
        
        setTimeout(() => {
            this.processImage(this.dataURLToBlob(demoImageUrl));
        }, 500);
    }

    dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    }

    showModal(modalId) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        
        if (overlay && modal) {
            overlay.style.display = 'flex';
            modal.style.display = 'block';
        }
    }

    hideModal(modalId) {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    handleKeyboard(e) {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.resetApp();
                    break;
                case 's':
                    e.preventDefault();
                    if (this.currentStep === 4) {
                        this.downloadQR();
                    }
                    break;
                case 'c':
                    e.preventDefault();
                    if (this.currentStep === 4) {
                        this.copyARLink();
                    }
                    break;
            }
        }

        // Escape key
        if (e.key === 'Escape') {
            if (document.getElementById('ar-viewer').style.display === 'block') {
                this.exitARViewer();
            } else if (document.getElementById('modal-overlay').style.display === 'flex') {
                this.hideModal();
            }
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">×</button>
            </div>
        `;

        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, duration);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showFileProtocolWarning() {
        const warningOverlay = document.getElementById('file-protocol-warning');
        if (warningOverlay) {
            warningOverlay.style.display = 'flex';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for AR experience in URL
    const urlParams = new URLSearchParams(window.location.search);
    const arId = urlParams.get('ar');
    
    if (arId) {
        // Direct AR viewing mode
        const app = new ARCreatorPro();
        setTimeout(() => {
            app.startARViewer();
        }, 1000);
    } else {
        // Normal app mode
        const app = new ARCreatorPro();
        
        // Make app globally accessible for debugging
        window.arApp = app;
    }
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        // Skip service worker registration on file:// protocol
        if (window.location.protocol === 'file:') {
            console.log('Service Worker skipped: file:// protocol not supported');
            return;
        }
        
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('SW registered:', registration);
        } catch (error) {
            console.log('SW registration failed:', error);
        }
    });
}

// Handle online/offline status
window.addEventListener('online', () => {
    document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
    document.body.classList.add('offline');
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}
