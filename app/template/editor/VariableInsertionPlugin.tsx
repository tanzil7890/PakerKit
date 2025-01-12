import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getSelection, $isRangeSelection } from 'lexical';

export default function VariableInsertionPlugin({ 
  variableToInsert 
}: { 
  variableToInsert: string | null 
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!variableToInsert) return;

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(variableToInsert);
      }
    });
  }, [variableToInsert, editor]);

  return null;
} 