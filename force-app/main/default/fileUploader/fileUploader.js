import { LightningElement, track, api } from 'lwc';

export default class FileUploader extends LightningElement {
    @api maxFileSize = 10 * 1024 * 1024; // 10MB default
    @api acceptedFileTypes = ['.pdf', 'pdf'];
    @api showFilePreview = false;
    
    @track selectedFile = null;
    @track isValidPdf = false;
    @track validationStatus = '';
    @track validationDetails = '';
    @track errorMessage = '';
    @track successMessage = '';
    @track isDragOver = false;
    
    // PDF magic numbers for validation
    pdfMagicNumbers = [
        new Uint8Array([0x25, 0x50, 0x44, 0x46]), // %PDF
        new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]) // %PDF-
    ];
    
    get uploadAreaClass() {
        return `upload-area ${this.isDragOver ? 'drag-over' : ''}`;
    }
    
    get fileIconName() {
        return this.isValidPdf ? 'doctype:pdf' : 'doctype:unknown';
    }
    
    get formattedFileSize() {
        if (!this.selectedFile) return '';
        return this.formatFileSize(this.selectedFile.size);
    }
    
    get isValidPdfInvalid() {
        return !this.isValidPdf;
    }
    
    // Handle file selection from input
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }
    
    // Handle drag and drop
    handleDragOver(event) {
        event.preventDefault();
        this.isDragOver = true;
    }
    
    handleDragLeave(event) {
        event.preventDefault();
        this.isDragOver = false;
    }
    
    handleDrop(event) {
        event.preventDefault();
        this.isDragOver = false;
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    // Trigger file input click
    triggerFileInput() {
        this.template.querySelector('.file-input').click();
    }
    
    // Process selected file
    async processFile(file) {
        this.clearMessages();
        this.selectedFile = file;
        
        // Validate file
        const validation = await this.validateFile(file);
        this.isValidPdf = validation.isValid;
        this.validationStatus = validation.status;
        this.validationDetails = validation.details;
        
        if (!validation.isValid) {
            this.errorMessage = validation.errorMessage;
        }
    }
    
    // Validate file (extension + content)
    async validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                isValid: false,
                status: 'File too large',
                details: `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.maxFileSize)})`,
                errorMessage: 'File size exceeds the maximum allowed limit.'
            };
        }
        
        // Check file extension
        const fileExtension = this.getFileExtension(file.name);
        const fileExtensionWithDot = '.' + fileExtension.toLowerCase();
        
        // Check if either format matches (with or without dot)
        if (!this.acceptedFileTypes.includes(fileExtension.toLowerCase()) && 
            !this.acceptedFileTypes.includes(fileExtensionWithDot)) {
            return {
                isValid: false,
                status: 'Invalid file type',
                details: `File extension "${fileExtension}" is not allowed. Only PDF files are accepted.`,
                errorMessage: 'Please select a valid PDF file.'
            };
        }
        
        // Validate PDF content using magic numbers
        const contentValidation = await this.validatePdfContent(file);
        if (!contentValidation.isValid) {
            return {
                isValid: false,
                status: 'Invalid PDF content',
                details: contentValidation.details,
                errorMessage: 'The selected file is not a valid PDF file.'
            };
        }
        
        return {
            isValid: true,
            status: 'Valid PDF file',
            details: 'File extension and content validation passed.',
            errorMessage: ''
        };
    }
    
    // Validate PDF content using magic numbers
    async validatePdfContent(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    const uint8Array = new Uint8Array(arrayBuffer);
                    
                    // Check if file starts with PDF magic numbers
                    const isValidPdf = this.pdfMagicNumbers.some(magicNumber => {
                        if (uint8Array.length < magicNumber.length) return false;
                        
                        for (let i = 0; i < magicNumber.length; i++) {
                            if (uint8Array[i] !== magicNumber[i]) return false;
                        }
                        return true;
                    });
                    
                    if (isValidPdf) {
                        resolve({
                            isValid: true,
                            details: 'PDF content validation passed.'
                        });
                    } else {
                        resolve({
                            isValid: false,
                            details: 'File does not contain valid PDF content. The file may have been renamed from another format.'
                        });
                    }
                } catch (error) {
                    resolve({
                        isValid: false,
                        details: 'Unable to read file content for validation.'
                    });
                }
            };
            
            reader.onerror = () => {
                resolve({
                    isValid: false,
                    details: 'Error reading file content.'
                });
            };
            
            // Read only the first few bytes for magic number validation
            reader.readAsArrayBuffer(file.slice(0, 1024));
        });
    }
    
    // Get file extension
    getFileExtension(filename) {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
            return '';
        }
        return filename.slice(lastDotIndex + 1);
    }
    
    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Remove selected file
    removeFile() {
        this.selectedFile = null;
        this.isValidPdf = false;
        this.validationStatus = '';
        this.validationDetails = '';
        this.clearMessages();
        
        // Reset file input
        const fileInput = this.template.querySelector('.file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    }
    
    // Clear all messages
    clearMessages() {
        this.errorMessage = '';
        this.successMessage = '';
    }
    
    // Upload file (to be implemented based on requirements)
    uploadFile() {
        if (!this.selectedFile || !this.isValidPdf) {
            this.errorMessage = 'Please select a valid PDF file before uploading.';
            return;
        }
        
        // Emit event with file data
        const uploadEvent = new CustomEvent('fileupload', {
            detail: {
                file: this.selectedFile,
                fileName: this.selectedFile.name,
                fileSize: this.selectedFile.size,
                fileType: this.selectedFile.type
            }
        });
        
        this.dispatchEvent(uploadEvent);
        this.successMessage = 'File uploaded successfully!';
        
        // Clear file after successful upload
        setTimeout(() => {
            this.removeFile();
        }, 2000);
    }
    
    // Public method to reset component
    @api
    reset() {
        this.removeFile();
    }
    
    // Public method to get current file
    @api
    getCurrentFile() {
        return this.selectedFile;
    }
    
    // Public method to check if file is valid
    @api
    isFileValid() {
        return this.isValidPdf;
    }
}
