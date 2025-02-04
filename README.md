# PaperKit - Document Template Generator

A powerful document template generator that supports rich text editing, variable management, CSV data integration, and PDF generation.

## Features

### Rich Text Editor
- Built with Lexical Editor
- Supports text formatting (bold, italic, underline)
- Font adjustments and alignment options
- Variable insertion at cursor position
- Google Docs-like styling

### Variable Management
- Custom variable creation and management
- CSV file integration
  - Upload CSV files
  - Automatic extraction of column names as variables
  - Drag-and-drop or click-to-insert functionality
- Variable placeholder format: {{variable_name}}

### PDF Generation
- Generate individual PDFs or batch processing
- CSV data integration for bulk generation
- Progress tracking for batch operations
- ZIP file download option for multiple PDFs
- Maintains formatting and styling
- Puppeteer integration for high-quality PDF output

### Email Integration
- Automatic email sending with generated PDFs
- Support for bulk email distribution
- Customizable email templates
- SMTP configuration support

### Environment Variables
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_SECURE`: Use SSL/TLS
- `EMAIL_USER`: SMTP username
- `EMAIL_PASSWORD`: SMTP password
- `EMAIL_FROM`: Default sender address

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
```
git clone <repository-url>
```
2. Navigate to the project directory
```
cd <project-directory>
```
3. Run `npm install` to install dependencies
```
```
npx puppeteer browsers install chrome
```
npm install
```
4. Run `npm run dev` to start the development server
```
npm run dev
```
5. Open your browser and navigate to `http://localhost:3000` to access the application


## Usage

### Creating Templates
1. Use the rich text editor to create your document template
2. Insert variables using the sidebar:
   - Add custom variables
   - Upload CSV files for bulk data
   - Click or drag variables to insert them into the document

### Generating PDFs
1. Click the "Generate PDF" button
2. Choose between:
   - Individual Files: Generate separate PDFs for each data row
   - Download as ZIP: Bundle multiple PDFs into a ZIP file
3. Monitor progress through the progress bar

### CSV Integration
- CSV files should have headers matching your variable names
- Example CSV structure:
```
Industry,Company,Location
Accounting/Finance,ACME Corp,New York
Advertising/Public Relations,Media Co,London
```


- 

