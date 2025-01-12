import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import theme from './editor/theme';
import LexicalEditorToolbar from './editor/LexicalEditorToolbar';
import { useState } from 'react';
import VariableSidebar from './editor/VariableSidebar';
import VariableInsertionPlugin from './editor/VariableInsertionPlugin';
import EditorContent from './editor/EditorContent';
import PreviewPlugin from './editor/PreviewPlugin';
import PDFGenerator from './editor/PDFGenerator';

interface Variable {
  name: string;
  type: 'custom' | 'csv';
}

interface EditorProps {
  onEditorChange: (content: string) => void;
  content: string;
  isSaving: boolean;
  isNewTemplate: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onPreviewToggle: () => void;
  isPreviewMode: boolean;
}

const Editor = ({ 
  onEditorChange, 
  content, 
  isSaving,
  isNewTemplate,
  hasUnsavedChanges,
  onSave,
  onPreviewToggle,
  isPreviewMode
}: EditorProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [variableToInsert, setVariableToInsert] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [csvData, setCsvData] = useState<Array<Record<string, string>>>([]);
  const [variables, setVariables] = useState<Variable[]>([]);

  const initialConfig = {
    namespace: 'TemplateEditor',
    theme,
    nodes: [HeadingNode, ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error(error);
    },
    editable: true,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex">
        <div className="flex-1 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-2">
            <LexicalEditorToolbar 
              isSaving={isSaving}
              isNewTemplate={isNewTemplate}
              hasUnsavedChanges={hasUnsavedChanges}
              onSave={onSave}
            />
            <PDFGenerator 
              variables={variables}
              csvData={csvData}
            />
          </div>
          <EditorContent 
            isLoading={isLoading}
            content={content}
            onEditorChange={onEditorChange}
            onLoadComplete={() => setIsLoading(false)}
          />
          <VariableInsertionPlugin variableToInsert={variableToInsert} />
          <HistoryPlugin />
          <ListPlugin />
          <AutoFocusPlugin />
          <PreviewPlugin 
            isPreviewMode={isPreviewMode}
            previewData={previewData}
          />
        </div>
        <VariableSidebar 
          onInsertVariable={(variable) => {
            setVariableToInsert(variable);
            setTimeout(() => setVariableToInsert(null), 100);
          }}
          onPreviewToggle={onPreviewToggle}
          isPreviewMode={isPreviewMode}
          onPreviewDataChange={setPreviewData}
          onCsvDataChange={setCsvData}
          onVariablesChange={setVariables}
        />
      </div>
    </LexicalComposer>
  );
};

export default Editor; 