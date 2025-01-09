"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import type { Delta } from 'quill';

// Register custom format for variables
const Inline = Quill.import('blots/inline') as any;

class VariableBlot extends Inline {
  static blotName = 'variable';
  static tagName = 'span';

  static create(value: string) {
    const node = super.create() as HTMLElement;
    node.setAttribute('data-variable', value);
    node.classList.add('variable-mention');
    return node;
  }

  static formats(node: HTMLElement) {
    return node.getAttribute('data-variable');
  }
}

Quill.register('formats/variable', VariableBlot);

interface QuillEditorProps {
  defaultValue?: Delta | null;
  onTextChange?: (delta: Delta) => void;
}

const QuillEditor = forwardRef<Quill | null, QuillEditorProps>(({ defaultValue, onTextChange }, ref) => {
  const editorRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useImperativeHandle(ref, () => editorRef.current);

  useEffect(() => {
    if (!containerRef.current || isInitialized.current || editorRef.current) return;

    isInitialized.current = true;
    const editor = new Quill(containerRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          [{ 'font': [] }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video'],
          ['clean']
        ]
      },
      placeholder: 'Start writing your template...'
    });

    editorRef.current = editor;

    if (defaultValue) {
      editor.setContents(defaultValue);
    }

    const handleTextChange = () => {
      onTextChange?.(editor.getContents());
    };

    editor.on('text-change', handleTextChange);

    return () => {
      if (editorRef.current) {
        editorRef.current.off('text-change');
        const toolbarElement = document.querySelector('.ql-toolbar');
        const editorElement = document.querySelector('.ql-editor');
        if (toolbarElement) toolbarElement.remove();
        if (editorElement) editorElement.remove();
        editorRef.current = null;
      }
      isInitialized.current = false;
    };
  }, [defaultValue, onTextChange]);

  return (
    <div className="bg-white rounded-lg border">
      <div ref={containerRef} className="h-[600px]" />
      <style jsx global>{`
        .variable-mention {
          background-color: rgba(37, 99, 235, 0.1);
          color: rgb(37, 99, 235);
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
        .variable-mention:hover {
          background-color: rgba(37, 99, 235, 0.2);
        }
      `}</style>
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';
export default QuillEditor;