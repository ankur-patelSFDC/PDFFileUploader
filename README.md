[README.md](https://github.com/user-attachments/files/21998005/README.md)
# Enhanced PDF File Uploader LWC Component

A Lightning Web Component that provides secure PDF file upload capabilities with both file extension and content validation to prevent users from uploading renamed non-PDF files.

## Features

### 🔒 Security Features
- **File Extension Validation**: Ensures only `.pdf` files are accepted
- **Content Validation**: Uses PDF magic numbers (`%PDF` or `%PDF-`) to validate actual file content
- **Prevents File Spoofing**: Blocks files that have been renamed from other formats to `.pdf`

### 🎯 User Experience
- **Drag & Drop Support**: Modern drag and drop interface
- **Click to Browse**: Traditional file selection method
- **Real-time Validation**: Immediate feedback on file validity
- **Visual Feedback**: Clear status indicators and error messages
- **Responsive Design**: Works on all device sizes

### ⚙️ Configuration Options
- **Configurable File Size Limit**: Default 10MB, customizable via `maxFileSize` property
- **Flexible File Type Acceptance**: Configurable via `acceptedFileTypes` property
- **Preview Control**: Toggle file preview display via `showFilePreview` property

## Installation

1. Deploy the component to your Salesforce org
2. Add the component to any Lightning page, record page, or app page
3. Configure the component properties as needed

## Usage

### Basic Implementation

```html
<c-file-uploader
    onfileupload={handleFileUpload}>
</c-file-uploader>
```

### With Custom Configuration

```html
<c-file-uploader
    max-file-size={maxFileSize}
    accepted-file-types={acceptedFileTypes}
    show-file-preview={showFilePreview}
    onfileupload={handleFileUpload}>
</c-file-uploader>
```

### JavaScript Controller

```javascript
import { LightningElement, track } from 'lwc';

export default class MyComponent extends LightningElement {
    @track maxFileSize = 5 * 1024 * 1024; // 5MB
    @track acceptedFileTypes = ['.pdf'];
    @track showFilePreview = true;
    
    handleFileUpload(event) {
        const fileData = event.detail;
        console.log('File uploaded:', fileData.fileName);
        console.log('File size:', fileData.fileSize);
        console.log('File type:', fileData.fileType);
        
        // Process the file as needed
        // Example: Upload to ContentDocument, send to API, etc.
    }
}
```

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxFileSize` | Integer | 10485760 (10MB) | Maximum file size in bytes |
| `acceptedFileTypes` | Array | ['.pdf'] | Array of accepted file extensions |
| `showFilePreview` | Boolean | true | Whether to show file preview after selection |

## Events

### `fileupload`
Fired when a valid file is uploaded. Event detail contains:

```javascript
{
    file: File,           // The actual File object
    fileName: String,      // Name of the file
    fileSize: Number,      // Size in bytes
    fileType: String       // MIME type
}
```

## Public Methods

### `reset()`
Resets the component to its initial state.

```javascript
// Get component reference
const fileUploader = this.template.querySelector('c-file-uploader');

// Reset component
fileUploader.reset();
```

### `getCurrentFile()`
Returns the currently selected file object.

```javascript
const currentFile = fileUploader.getCurrentFile();
```

### `isFileValid()`
Returns whether the current file is valid.

```javascript
const isValid = fileUploader.isFileValid();
```

## How PDF Validation Works

The component uses a two-layer validation approach:

1. **File Extension Check**: Verifies the file has a `.pdf` extension
2. **Content Validation**: Reads the first 1024 bytes of the file and checks for PDF magic numbers:
   - `%PDF` (0x25, 0x50, 0x44, 0x46)
   - `%PDF-` (0x25, 0x50, 0x44, 0x46, 0x2D)

This prevents users from simply renaming files (e.g., `document.txt` → `document.pdf`) to bypass the extension filter.

## Error Handling

The component provides comprehensive error handling for:

- **File Size Exceeded**: When file size exceeds the configured limit
- **Invalid File Type**: When file extension doesn't match accepted types
- **Invalid PDF Content**: When file content doesn't contain valid PDF data
- **File Read Errors**: When the component can't read file content

## Styling

The component uses Salesforce Lightning Design System (SLDS) classes and includes:

- Responsive design for mobile and desktop
- Hover effects and animations
- Drag and drop visual feedback
- Status-based color coding (success/error)
- Modern, clean interface

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations

- Only reads the first 1024 bytes for validation (minimal memory usage)
- Asynchronous file processing to prevent UI blocking
- Efficient file size calculations
- Minimal DOM manipulation

## Security Best Practices

1. **Client-side Validation**: Provides immediate user feedback
2. **Server-side Validation**: Always implement server-side validation as well
3. **File Size Limits**: Prevents large file uploads that could impact performance
4. **Content Verification**: Ensures file integrity beyond just extension checking

## Example Use Cases

- **Document Management Systems**: Secure PDF uploads for business documents
- **Form Submissions**: PDF form uploads with validation
- **Content Libraries**: Building document repositories
- **Compliance Systems**: Ensuring only valid PDFs are uploaded
- **Customer Portals**: Secure file uploads for customers

## Troubleshooting

### Common Issues

1. **File Not Uploading**: Check if file passes both extension and content validation
2. **Validation Errors**: Ensure file is actually a PDF, not just renamed
3. **Size Limit Errors**: Verify file size is within configured limits
4. **Drag & Drop Not Working**: Check browser compatibility and JavaScript errors

### Debug Mode

Enable console logging to debug validation issues:

```javascript
// In your component
console.log('File validation result:', validation);
```

## Contributing

To contribute to this component:

1. Follow Salesforce LWC development best practices
2. Maintain backward compatibility
3. Add comprehensive test coverage
4. Update documentation for any new features

## License

This component is provided as-is for Salesforce development use.
