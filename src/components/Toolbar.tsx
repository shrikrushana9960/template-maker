import React from 'react';

interface ToolbarProps {
  onNewTemplate: () => void;
  onSaveTemplate: () => void;
  onImportJson: (file: File) => void;
  onExportPdf: () => void;
  onAddElement: (type: string, chartType?: string) => void;
  onAddPage: () => void;
  onDeletePage: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAutofill: () => void;
  currentPage: number;
  totalPages: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onNewTemplate,
  onSaveTemplate,
  onImportJson,
  onExportPdf,
  onAddElement,
  onAddPage,
  onDeletePage,
  onPrevPage,
  onNextPage,
  onAutofill,
  currentPage,
  totalPages,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
  };

  const elementButtons = [
    { type: 'header', label: 'Header', icon: 'M4 12h16M12 4v16' },
    { type: 'text', label: 'Text', icon: 'M4 12h16M16 8h-8M16 16h-8' },
    { type: 'image', label: 'Image', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
    { type: 'table', label: 'Table', icon: 'M12 2v20M2 7h20M2 17h20M7 2v20M17 2v20' },
    { type: 'chart', chartType: 'bar', label: 'Bar Chart', icon: 'M18 20V10M12 20V4M6 20v-6' },
    { type: 'chart', chartType: 'line', label: 'Line Chart', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  ];

  return (
    <div className="bg-white shadow-md z-20">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* File Section */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-500">File</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onNewTemplate}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <span className="text-xs text-gray-700 mt-1">New</span>
              </button>
              
              <button
                onClick={handleImportClick}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v10M12 22v-10M12 2a4 4 0 0 0-4 4v4H4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10h-4V6a4 4 0 0 0-4-4z"/>
                </svg>
                <span className="text-xs text-gray-700 mt-1">Load</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <button
                onClick={onSaveTemplate}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
                <span className="text-xs text-gray-700 mt-1">Save</span>
              </button>
              
              <button
                onClick={onExportPdf}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <line x1="10" y1="9" x2="10" y2="13"/>
                </svg>
                <span className="text-xs text-gray-700 mt-1">Export PDF</span>
              </button>
            </div>
          </div>
          
          {/* Pages Section */}
          <div className="flex flex-col items-center border-l border-gray-200 pl-4">
            <span className="text-xs font-semibold text-gray-500">Pages</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onPrevPage}
                disabled={currentPage === 0}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                <span className="text-xs text-gray-700 mt-1">Prev</span>
              </button>
              
              <span className="text-xs font-medium text-gray-700 mt-1">
                Page {currentPage + 1} / {totalPages}
              </span>
              
              <button
                onClick={onNextPage}
                disabled={currentPage === totalPages - 1}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span className="text-xs text-gray-700 mt-1">Next</span>
              </button>
              
              <button
                onClick={onAddPage}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="12" x2="12" y2="18"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <span className="text-xs text-gray-700 mt-1">Add Page</span>
              </button>
              
              <button
                onClick={onDeletePage}
                disabled={totalPages === 1}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span className="text-xs text-gray-700 mt-1">Delete Page</span>
              </button>
            </div>
          </div>
          
          {/* Elements Section */}
          <div className="flex flex-col items-center border-l border-gray-200 pl-4">
            <span className="text-xs font-semibold text-gray-500">Elements</span>
            <div className="flex items-center space-x-2">
              {elementButtons.map((btn) => (
                <button
                  key={`${btn.type}-${btn.chartType || ''}`}
                  onClick={() => onAddElement(btn.type, btn.chartType)}
                  className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={btn.icon}/>
                  </svg>
                  <span className="text-xs text-gray-700 mt-1">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-gray-800">PDF Template Editor</h1>

        <div className="flex items-center space-x-2">
          <button
            onClick={onAutofill}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
          >
            Autofill
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;