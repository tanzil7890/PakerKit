import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorState } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

interface EditorContentProps {
  isLoading: boolean;
  content: string;
  onEditorChange: (content: string) => void;
  onLoadComplete: () => void;
}

export default function EditorContent({
  isLoading,
  content,
  onEditorChange,
  onLoadComplete
}: EditorContentProps) {
  const [editor] = useLexicalComposerContext();

  const handleEditorChange = (editorState: EditorState) => {
    editorState.read(() => {
      const jsonString = JSON.stringify(editorState.toJSON());
      if (jsonString !== content) {
        onEditorChange(jsonString);
      }
    });
  };

  // Initialize editor with content
  useEffect(() => {
    if (content && isLoading) {
      try {
        const initialState = JSON.parse(content);
        editor.setEditorState(editor.parseEditorState(initialState));
        onLoadComplete();
      } catch (error) {
        console.error('Error setting initial editor state:', error);
        onLoadComplete();
      }
    } else if (isLoading) {
      onLoadComplete();
    }
  }, [content, editor, isLoading, onLoadComplete]);

  return (
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
      <OnChangePlugin onChange={handleEditorChange} />
    </div>
  );
} 