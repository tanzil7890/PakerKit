import { useState } from 'react';
import { VariableManager } from './components/VariableManager';
import PDFGenerator from './PDFGenerator';

export default function Editor() {
  const [variables, setVariables] = useState<Array<{ name: string; type: 'custom' | 'csv' }>>([]);
  const [csvData, setCsvData] = useState<Array<Record<string, string>> | undefined>();

  const handleVariableAdd = (variable: { name: string; type: 'custom' | 'csv' }) => {
    setVariables(prev => [...prev, variable]);
  };

  const handleCsvUpload = (data: Array<Record<string, string>>) => {
    setCsvData(data);
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r">
        <VariableManager
          variables={variables}
          onVariableAdd={handleVariableAdd}
          onCsvUpload={handleCsvUpload}
        />
      </div>
      <div className="flex-1">
        {/* Your LexicalEditor component */}
        <div className="flex justify-end p-4">
          <PDFGenerator
            variables={variables}
            csvData={csvData}
          />
        </div>
      </div>
    </div>
  );
} 