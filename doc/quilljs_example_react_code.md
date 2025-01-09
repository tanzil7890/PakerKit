### App.js

import React, { useRef, useState } from 'react';
import Editor from './Editor';

const Delta = Quill.import('delta');

const App = () => {
  const [range, setRange] = useState();
  const [lastChange, setLastChange] = useState();
  const [readOnly, setReadOnly] = useState(false);

  // Use a ref to access the quill instance directly
  const quillRef = useRef();

  return (
    <div>
      <Editor
        ref={quillRef}
        readOnly={readOnly}
        defaultValue={new Delta()
          .insert('Hello')
          .insert('\n', { header: 1 })
          .insert('Some ')
          .insert('initial', { bold: true })
          .insert(' ')
          .insert('content', { underline: true })
          .insert('\n')}
        onSelectionChange={setRange}
        onTextChange={setLastChange}
      />
      <div class="controls">
        <label>
          Read Only:{' '}
          <input
            type="checkbox"
            value={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
        </label>
        <button
          className="controls-right"
          type="button"
          onClick={() => {
            alert(quillRef.current?.getLength());
          }}
        >
          Get Content Length
        </button>
      </div>
      <div className="state">
        <div className="state-title">Current Range:</div>
        {range ? JSON.stringify(range) : 'Empty'}
      </div>
      <div className="state">
        <div className="state-title">Last Change:</div>
        {lastChange ? JSON.stringify(lastChange.ops) : 'Empty'}
      </div>
    </div>
  );
};

export default App;


### Editor.js

import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';

// Editor is an uncontrolled React component
const Editor = forwardRef(
  ({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      ref.current?.enable(!readOnly);
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement('div'),
      );
      const quill = new Quill(editorContainer, {
        theme: 'snow',
      });

      ref.current = quill;

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        ref.current = null;
        container.innerHTML = '';
      };
    }, [ref]);

    return <div ref={containerRef}></div>;
  },
);

Editor.displayName = 'Editor';

export default Editor;

### styles.css

.controls {
  display: flex;
  border: 1px solid #ccc;
  border-top: 0;
  padding: 10px;
}

.controls-right {
  margin-left: auto;
}

.state {
  margin: 10px 0;
  font-family: monospace;
}

.state-title {
  color: #999;
  text-transform: uppercase;
}