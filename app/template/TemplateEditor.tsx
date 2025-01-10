import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { EditorState, LexicalEditor } from 'lexical';
import theme from './editor/theme';
import LexicalEditorToolbar from './editor/LexicalEditorToolbar';
import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface EditorProps {
  onEditorChange: (content: string) => void;
  content: string;
  isSaving: boolean;
  isNewTemplate: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}

const Editor = ({ 
  onEditorChange, 
  content, 
  isSaving,
  isNewTemplate,
  hasUnsavedChanges,
  onSave 
}: EditorProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const initialConfig = {
    namespace: 'TemplateEditor',
    theme,
    nodes: [HeadingNode, ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error(error);
    },
    editable: true,
  };

  const handleEditorChange = (editorState: EditorState) => {
    editorState.read(() => {
      const jsonString = JSON.stringify(editorState.toJSON());
      if (jsonString !== content) {
        onEditorChange(jsonString);
      }
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="bg-white rounded-lg shadow">
        <LexicalEditorToolbar 
          isSaving={isSaving}
          isNewTemplate={isNewTemplate}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={onSave}
        />
        <div className="border-t border-gray-200 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[600px] max-h-[800px] overflow-y-auto px-6 py-4 focus:outline-none editor-content" 
                style={{
                  width: '8.5in',
                  margin: '0 auto',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word'
                }}
              />
            }
            placeholder={isLoading ? null : <div className="text-gray-400">Start typing...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={handleEditorChange} />
        <InitialContentPlugin 
          content={content} 
          onLoadComplete={() => setIsLoading(false)} 
        />
      </div>
    </LexicalComposer>
  );
};

function InitialContentPlugin({ 
  content, 
  onLoadComplete 
}: { 
  content: string; 
  onLoadComplete: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    editor.update(() => {
      try {
        const parsedContent = JSON.parse(content);
        const editorState = editor.parseEditorState(parsedContent);
        editor.setEditorState(editorState);
      } catch (error) {
        console.error('Error setting initial content:', error);
      } finally {
        onLoadComplete();
      }
    });
  }, [editor, content, onLoadComplete]);

  return null;
}

export default Editor; 