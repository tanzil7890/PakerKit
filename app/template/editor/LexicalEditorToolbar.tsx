import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $createParagraphNode,
  TextFormatType,
} from 'lexical';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $createListNode, $isListNode } from '@lexical/list';
import SaveButton from './SaveButton';
import ExportPDF from './ExportPDF';
import { 
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND
} from '@lexical/list';
import { List, ListOrdered } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";


interface ActiveFormats {
  blockType: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isBulletList: boolean;
  isNumberedList: boolean;
  [key: string]: boolean | string;
}

interface LexicalEditorToolbarProps {
  isSaving: boolean;
  isNewTemplate: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}



const LexicalEditorToolbar = ({
  isSaving,
  isNewTemplate,
  hasUnsavedChanges,
  onSave
}: LexicalEditorToolbarProps) => {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    blockType: 'paragraph',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isBulletList: false,
    isNumberedList: false,
  });

  const formatOptions = [
    { label: 'Normal', value: 'paragraph' },
    { label: 'Heading 1', value: 'h1' },
    { label: 'Heading 2', value: 'h2' },
    { label: 'Heading 3', value: 'h3' }
  ];
  const FONT_SIZES = [
    {  value: '12' },
    {value: '16' },
    { value: '20' },
    {  value: '24' },
    { value: '32' }
  ];

  const handleFontSizeChange = (value: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach(node => {
          node.setStyle(`font-size: ${value}px`);
        });
      }
    });
  };
  

  const applyFormat = useCallback((format: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const currentBlockType = anchorNode.getFormat();

        if (currentBlockType.toString() === format) {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          switch (format) {
            case 'paragraph':
              $setBlocksType(selection, () => $createParagraphNode());
              break;
            case 'h1':
            case 'h2':
            case 'h3':
              $setBlocksType(selection, () => $createHeadingNode(format));
              break;
          }
        }
      }
    });
  }, [editor]);

  const toggleFormat = useCallback((formatType: TextFormatType) => {
    editor.update(() => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType);
    });
  }, [editor]);

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const topLevelNode = anchorNode.getTopLevelElementOrThrow();

        setActiveFormats({
          blockType: $isHeadingNode(topLevelNode) 
            ? topLevelNode.getTag() 
            : 'paragraph',
          isBold: selection.hasFormat('bold'),
          isItalic: selection.hasFormat('italic'),
          isUnderline: selection.hasFormat('underline'),
          isBulletList: $isListNode(topLevelNode) && topLevelNode.getListType() === 'bullet',
          isNumberedList: $isListNode(topLevelNode) && topLevelNode.getListType() === 'number'
        });
      }
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  const handleListCommand = (type: 'bullet' | 'numbered') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        const parent = nodes[0].getParent();
        
        if ($isListNode(parent)) {
          // If already in a list, remove it
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        } else {
          // Apply new list with consistent formatting
          if (type === 'bullet') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          } else {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          }
        }
      }
    });
  };

  return (
    <div className="border-b border-gray-200 p-3 flex items-center justify-between bg-gray-50">
      <div className="flex items-center space-x-2">
        <select 
          onChange={(e) => applyFormat(e.target.value)}
          value={activeFormats.blockType}
          className="px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
        >
          {formatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Select onValueChange={handleFontSizeChange} defaultValue="16">
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Font size" />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map(size => (
            <SelectItem key={size.value} value={size.value}>
              ({size.value}px)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

        {['bold', 'italic', 'underline'].map((format) => (
          <button
            key={format}
            onClick={() => toggleFormat(format as TextFormatType)}
            className={`px-3 py-1.5 rounded-md font-semibold ${
              activeFormats[`is${format.charAt(0).toUpperCase()}${format.slice(1)}`]
                ? 'bg-gray-200 text-gray-900' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {format.charAt(0).toUpperCase()}
          </button>
        ))}

    <div className="flex items-center gap-1 border-l pl-2">
      <Button
        variant={activeFormats.isBulletList ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleListCommand('bullet')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant={activeFormats.isNumberedList ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleListCommand('numbered')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
      </div>
      
    </div>
  );
};

export default LexicalEditorToolbar;