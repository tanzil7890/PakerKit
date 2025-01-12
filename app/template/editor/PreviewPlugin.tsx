import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getRoot, $createTextNode } from 'lexical';

interface PreviewPluginProps {
  isPreviewMode: boolean;
  previewData?: Record<string, string>;
}

export default function PreviewPlugin({ isPreviewMode, previewData = {} }: PreviewPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      const content = root.getTextContent();
      
      if (isPreviewMode && previewData) {
        let previewContent = content;
        Object.entries(previewData).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          previewContent = previewContent.replace(regex, value || '');
        });
        
        // Clear existing content and set new content
        root.clear();
        root.append($createTextNode(previewContent));
      }
    });
  }, [isPreviewMode, previewData, editor]);

  return null;
} 