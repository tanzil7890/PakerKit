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
import { $generateHtmlFromNodes } from '@lexical/html';
import html2pdf from 'html2pdf.js';
import SaveButton from './SaveButton';

interface ActiveFormats {
  blockType: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
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
  });

  const formatOptions = [
    { label: 'Normal', value: 'paragraph' },
    { label: 'Heading 1', value: 'h1' },
    { label: 'Heading 2', value: 'h2' },
    { label: 'Heading 3', value: 'h3' },
    { label: 'Bullet List', value: 'bullet' },
  ];

  const applyFormat = useCallback((format: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const currentBlockType = anchorNode.getFormat();

        // Compare as strings
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
            case 'bullet':
              $setBlocksType(selection, () => $createListNode('bullet'));
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
            : $isListNode(topLevelNode) 
              ? 'bullet' 
              : 'paragraph',
          isBold: selection.hasFormat('bold'),
          isItalic: selection.hasFormat('italic'),
          isUnderline: selection.hasFormat('underline'),
        });
      }
    });
  }, [editor]);

  const exportToPDF = useCallback(() => {
    editor.getEditorState().read(() => {
      const htmlString = $generateHtmlFromNodes(editor);
      
      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-export-container';
      tempDiv.innerHTML = `
        <style>
          .pdf-export-container {
            padding: 40px;
            font-family: Arial, sans-serif;
            color: #000;
            width: 8.5in;
            margin: 0 auto;
            box-sizing: border-box;
          }
          h1 { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 16px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          h2 { 
            font-size: 20px; 
            font-weight: bold; 
            margin-bottom: 14px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          h3 { 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 12px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          p { 
            font-size: 12px; 
            line-height: 1.5; 
            margin-bottom: 12px;
            page-break-inside: avoid;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          ul { 
            list-style-type: disc !important;
            padding-left: 24px !important;
            margin-bottom: 12px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          ul li {
            font-size: 12px;
            line-height: 1.5;
            margin-bottom: 6px;
            page-break-inside: avoid;
            display: list-item !important;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        </style>
        ${htmlString}
      `;
      document.body.appendChild(tempDiv);

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          width: 816, // 8.5 inches * 96 DPI
          windowWidth: 816
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait',
          hotfixes: ['px_scaling']
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break',
          avoid: ['li', 'p', 'h1', 'h2', 'h3']
        }
      };

      html2pdf().set(opt).from(tempDiv).save().then(() => {
        document.body.removeChild(tempDiv);
      });
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
      </div>
      <div className="flex items-center space-x-2">
        <SaveButton
          isSaving={isSaving}
          isNewTemplate={isNewTemplate}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={onSave}
        />
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default LexicalEditorToolbar;