import { createElement } from 'lwc';
import FileUploader from 'c/fileUploader';

// Mock FileReader
global.FileReader = class {
    constructor() {
        this.result = null;
        this.onload = null;
        this.onerror = null;
    }
    
    readAsArrayBuffer(blob) {
        // Simulate successful read
        setTimeout(() => {
            if (this.onload) {
                this.onload({ target: { result: new ArrayBuffer(blob.size) } });
            }
        }, 0);
    }
};

// Mock File object
const createMockFile = (name, size, type, content = '') => {
    const file = new File([content], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
};

describe('c-fileUploader', () => {
    let element;
    
    beforeEach(() => {
        element = createElement('c-file-uploader', {
            is: FileUploader
        });
        document.body.appendChild(element);
    });
    
    afterEach(() => {
        document.body.removeChild(element);
    });
    
    it('should initialize with default values', () => {
        expect(element.maxFileSize).toBe(10 * 1024 * 1024); // 10MB
        expect(element.acceptedFileTypes).toEqual(['.pdf']);
        expect(element.showFilePreview).toBe(true);
        expect(element.selectedFile).toBeNull();
        expect(element.isValidPdf).toBe(false);
    });
    
    it('should format file size correctly', () => {
        const size1 = element.formatFileSize(1024);
        expect(size1).toBe('1 KB');
        
        const size2 = element.formatFileSize(1048576);
        expect(size2).toBe('1 MB');
        
        const size3 = element.formatFileSize(0);
        expect(size3).toBe('0 Bytes');
    });
    
    it('should get file extension correctly', () => {
        const ext1 = element.getFileExtension('document.pdf');
        expect(ext1).toBe('pdf');
        
        const ext2 = element.getFileExtension('file.name.pdf');
        expect(ext2).toBe('pdf');
        
        const ext3 = element.getFileExtension('noextension');
        expect(ext3).toBe('');
    });
    
    it('should validate PDF file successfully', async () => {
        const mockPdfFile = createMockFile('test.pdf', 1024, 'application/pdf', '%PDF-1.4');
        
        await element.processFile(mockPdfFile);
        
        expect(element.selectedFile).toBe(mockPdfFile);
        expect(element.isValidPdf).toBe(true);
        expect(element.validationStatus).toBe('Valid PDF file');
    });
    
    it('should reject non-PDF file with PDF extension', async () => {
        const mockRenamedFile = createMockFile('fake.pdf', 1024, 'text/plain', 'This is not a PDF');
        
        await element.processFile(mockRenamedFile);
        
        expect(element.selectedFile).toBe(mockRenamedFile);
        expect(element.isValidPdf).toBe(false);
        expect(element.validationStatus).toBe('Invalid PDF content');
    });
    
    it('should reject file with wrong extension', async () => {
        const mockTxtFile = createMockFile('document.txt', 1024, 'text/plain', 'Some text content');
        
        await element.processFile(mockTxtFile);
        
        expect(element.selectedFile).toBe(mockTxtFile);
        expect(element.isValidPdf).toBe(false);
        expect(element.validationStatus).toBe('Invalid file type');
    });
    
    it('should reject oversized file', async () => {
        const mockLargeFile = createMockFile('large.pdf', 20 * 1024 * 1024, 'application/pdf', '%PDF-1.4');
        
        await element.processFile(mockLargeFile);
        
        expect(element.selectedFile).toBe(mockLargeFile);
        expect(element.isValidPdf).toBe(false);
        expect(element.validationStatus).toBe('File too large');
    });
    
    it('should clear messages correctly', () => {
        element.errorMessage = 'Test error';
        element.successMessage = 'Test success';
        
        element.clearMessages();
        
        expect(element.errorMessage).toBe('');
        expect(element.successMessage).toBe('');
    });
    
    it('should remove file correctly', async () => {
        const mockFile = createMockFile('test.pdf', 1024, 'application/pdf', '%PDF-1.4');
        await element.processFile(mockFile);
        
        element.removeFile();
        
        expect(element.selectedFile).toBeNull();
        expect(element.isValidPdf).toBe(false);
        expect(element.validationStatus).toBe('');
        expect(element.validationDetails).toBe('');
    });
    
    it('should emit fileupload event for valid file', async () => {
        const mockPdfFile = createMockFile('test.pdf', 1024, 'application/pdf', '%PDF-1.4');
        await element.processFile(mockPdfFile);
        
        const eventSpy = jest.fn();
        element.addEventListener('fileupload', eventSpy);
        
        element.uploadFile();
        
        expect(eventSpy).toHaveBeenCalled();
        const event = eventSpy.mock.calls[0][0];
        expect(event.detail.fileName).toBe('test.pdf');
        expect(event.detail.fileSize).toBe(1024);
    });
    
    it('should not emit fileupload event for invalid file', async () => {
        const mockInvalidFile = createMockFile('fake.pdf', 1024, 'text/plain', 'Not a PDF');
        await element.processFile(mockInvalidFile);
        
        const eventSpy = jest.fn();
        element.addEventListener('fileupload', eventSpy);
        
        element.uploadFile();
        
        expect(eventSpy).not.toHaveBeenCalled();
        expect(element.errorMessage).toBe('Please select a valid PDF file before uploading.');
    });
    
    it('should handle drag and drop events', () => {
        const dragOverEvent = new Event('dragover');
        const dragLeaveEvent = new Event('dragleave');
        const dropEvent = new Event('drop');
        
        // Mock preventDefault
        dragOverEvent.preventDefault = jest.fn();
        dragLeaveEvent.preventDefault = jest.fn();
        dropEvent.preventDefault = jest.fn();
        
        element.handleDragOver(dragOverEvent);
        expect(element.isDragOver).toBe(true);
        
        element.handleDragLeave(dragLeaveEvent);
        expect(element.isDragOver).toBe(false);
        
        element.handleDrop(dropEvent);
        expect(element.isDragOver).toBe(false);
    });
    
    it('should provide public API methods', async () => {
        const mockFile = createMockFile('test.pdf', 1024, 'application/pdf', '%PDF-1.4');
        await element.processFile(mockFile);
        
        expect(element.getCurrentFile()).toBe(mockFile);
        expect(element.isFileValid()).toBe(true);
        
        element.reset();
        expect(element.getCurrentFile()).toBeNull();
        expect(element.isFileValid()).toBe(false);
    });
});
