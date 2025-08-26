import { LightningElement, track } from 'lwc';

export default class FileUploaderDemo extends LightningElement {
    @track uploadedFiles = [];
    @track maxFileSize = 10 * 1024 * 1024; // 10MB
    @track acceptedFileTypes = ['.pdf', 'pdf'];
    @track showFilePreview = false;
    
    // Handle file upload event from the fileUploader component
    handleFileUpload(event) {
        const fileData = event.detail;
        
        // Create upload history entry
        const uploadInfo = {
            id: Date.now().toString(),
            fileName: fileData.fileName,
            fileSize: this.formatFileSize(fileData.fileSize),
            uploadTime: new Date().toLocaleString(),
            file: fileData.file
        };
        
        // Add to upload history
        this.uploadedFiles = [uploadInfo, ...this.uploadedFiles];
        
        // In a real application, you would handle the file upload here
        console.log('File uploaded:', fileData);
        
        // Example: You could send the file to a server or process it further
        this.processUploadedFile(fileData);
    }
    
    // Process the uploaded file (example implementation)
    processUploadedFile(fileData) {
        // This is where you would implement your file processing logic
        // For example:
        // - Upload to Salesforce ContentDocument
        // - Send to external API
        // - Process file content
        // - Store metadata
        
        console.log('Processing file:', fileData.fileName);
        console.log('File size:', this.formatFileSize(fileData.fileSize));
        console.log('File type:', fileData.fileType);
        
        // You could also dispatch a custom event to notify parent components
        this.dispatchEvent(new CustomEvent('filedemoupload', {
            detail: fileData
        }));
    }
    
    // Format file size for display
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Clear upload history
    clearHistory() {
        this.uploadedFiles = [];
    }
    
    // Get component reference for testing
    get fileUploaderComponent() {
        return this.template.querySelector('c-file-uploader');
    }
    
    // Public method to reset the file uploader
    resetUploader() {
        if (this.fileUploaderComponent) {
            this.fileUploaderComponent.reset();
        }
    }
    
    // Public method to get current file from uploader
    getCurrentFile() {
        if (this.fileUploaderComponent) {
            return this.fileUploaderComponent.getCurrentFile();
        }
        return null;
    }
    
    // Public method to check if current file is valid
    isCurrentFileValid() {
        if (this.fileUploaderComponent) {
            return this.fileUploaderComponent.isFileValid();
        }
        return false;
    }
}
