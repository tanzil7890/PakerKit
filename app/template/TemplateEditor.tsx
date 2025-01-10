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

interface EditorProps {
  onEditorChange: (content: string) => void;
  content: string;
}

const Editor = ({ onEditorChange, content }: EditorProps) => {
  const initialConfig = {
    namespace: 'TemplateEditor',
    theme,
    nodes: [HeadingNode, ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error(error);
    },
  };

  const handleEditorChange = (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
    editorState.read(() => {
      const jsonString = JSON.stringify(editorState.toJSON());
      onEditorChange(jsonString);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="bg-white rounded-lg shadow">
        <LexicalEditorToolbar />
        <div className="border-t border-gray-200">
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
            placeholder={<div className="text-gray-400">Start typing...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={handleEditorChange} />
      </div>
    </LexicalComposer>
  );
};

export default Editor; 