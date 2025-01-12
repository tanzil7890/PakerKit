import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, X } from 'lucide-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createTextNode, $getSelection, $isRangeSelection } from 'lexical';

interface VariableManagerProps {
  onVariableAdd: (variable: { name: string; type: 'custom' | 'csv' }) => void;
  onCsvUpload: (data: Array<Record<string, string>>) => void;
  variables: Array<{ name: string; type: 'custom' | 'csv' }>;
}

export function VariableManager({ onVariableAdd, onCsvUpload, variables }: VariableManagerProps) {
  const [editor] = useLexicalComposerContext();
  const [newVariable, setNewVariable] = useState('');

  const handleAddVariable = () => {
    if (newVariable.trim()) {
      onVariableAdd({ name: newVariable.trim(), type: 'custom' });
      setNewVariable('');
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        
        // Add CSV columns as variables
        headers.forEach(header => {
          onVariableAdd({ name: header, type: 'csv' });
        });

        // Process CSV data
        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as Record<string, string>);
        });

        onCsvUpload(data);
      };
      reader.readAsText(file);
    }
  };

  const insertVariable = (variableName: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createTextNode(`{{${variableName}}}`)])
      }
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-4">Variables</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            placeholder="Add custom variable"
          />
          <Button onClick={handleAddVariable} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
            id="csv-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('csv-upload')?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </div>

        <div className="space-y-2">
          {variables.map((variable) => (
            <div
              key={variable.name}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', `{{${variable.name}}}`);
              }}
              onClick={() => insertVariable(variable.name)}
            >
              <span className="text-sm">
                {variable.name}
                <span className="ml-2 text-xs text-gray-500">
                  ({variable.type})
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add remove functionality
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 