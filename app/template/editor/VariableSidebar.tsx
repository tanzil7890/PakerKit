import { useState } from 'react';
import { Plus, Upload, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Variable {
  name: string;
  type: 'custom' | 'csv';
  value?: string;
}

interface VariableSidebarProps {
  onInsertVariable: (variable: string) => void;
  onPreviewToggle: () => void;
  isPreviewMode: boolean;
  onPreviewDataChange: (data: Record<string, string>) => void;
  onCsvDataChange: (data: Array<Record<string, string>>) => void;
  onVariablesChange: (variables: Variable[]) => void;
}

export default function VariableSidebar({ 
  onInsertVariable, 
  onPreviewToggle, 
  isPreviewMode,
  onPreviewDataChange,
  onCsvDataChange,
  onVariablesChange 
}: VariableSidebarProps) {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newVariable, setNewVariable] = useState('');
  const { toast } = useToast();
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const [csvData, setCsvData] = useState<Array<Record<string, string>>>([]);

  const handleAddVariable = () => {
    if (!newVariable) return;
    
    const formattedName = newVariable.replace(/\s+/g, '_').toLowerCase();
    if (variables.some(v => v.name === formattedName)) {
      toast({
        title: "Error",
        description: "Variable name already exists",
        variant: "destructive",
      });
      return;
    }

    setVariables([...variables, { name: formattedName, type: 'custom' }]);
    setNewVariable('');
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const newVariables = headers.map(header => ({
          name: header.replace(/\s+/g, '_').toLowerCase(),
          type: 'csv' as const
        }));
        
        // Filter out duplicate variables
        const existingNames = new Set(variables.map(v => v.name));
        const uniqueNewVariables = newVariables.filter(v => !existingNames.has(v.name));
        
        setVariables([...variables, ...uniqueNewVariables]);
        setCsvData(results.data as Array<Record<string, string>>);
        onCsvDataChange(results.data as Array<Record<string, string>>);
      },
      error: () => {
        toast({
          title: "Error",
          description: "Failed to parse CSV file",
          variant: "destructive",
        });
      }
    });
  };

  const handlePreviewValueChange = (variableName: string, value: string) => {
    const newValues = { ...previewValues, [variableName]: value };
    setPreviewValues(newValues);
    onPreviewDataChange(newValues);
  };

  return (
    <div className="w-64 border-l border-gray-200 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Variables</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviewToggle}
        >
          <Eye className="h-4 w-4 mr-2" />
          {isPreviewMode ? 'Raw' : 'Preview'}
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Add Variable</Label>
        <div className="flex space-x-2">
          <Input
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            placeholder="Variable name"
          />
          <Button size="sm" onClick={handleAddVariable}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Import CSV</Label>
        <div className="flex justify-center">
          <label className="cursor-pointer">
            <Input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
            />
            <div className="flex items-center space-x-2 text-sm text-gray-600 border rounded p-2">
              <Upload className="h-4 w-4" />
              <span>Upload CSV</span>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Available Variables</Label>
        <div className="space-y-1">
          {variables.map((variable) => (
            <div
              key={variable.name}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => onInsertVariable(`{{${variable.name}}}`)}
              draggable
            >
              <span className="text-sm">{`{{${variable.name}}}`}</span>
              <span className="text-xs text-gray-500">{variable.type}</span>
            </div>
          ))}
        </div>
      </div>

      {isPreviewMode && (
        <div className="space-y-2">
          <Label>Preview Values</Label>
          <div className="space-y-2">
            {variables.map((variable) => (
              <div key={variable.name} className="space-y-1">
                <Label className="text-xs">{variable.name}</Label>
                <Input
                  value={previewValues[variable.name] || ''}
                  onChange={(e) => handlePreviewValueChange(variable.name, e.target.value)}
                  placeholder="Enter preview value"
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {csvData.length > 0 && (
        <div className="space-y-2">
          <Label>CSV Preview</Label>
          <ScrollArea className="h-48 rounded-md border">
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {Object.keys(csvData[0]).map((header) => (
                      <th key={header} className="text-left p-2">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="p-2">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 5 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  {csvData.length - 5} more rows...
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
