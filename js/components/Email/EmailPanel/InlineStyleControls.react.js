import React, { PropTypes } from 'react';
import StyleButton from './StyleButton.react';
import ClickableStyleButton from './ClickableStyleButton.react';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

const INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];


function InlineStyleControls({ editorState, onToggle, customInlineTypes}) {
  const currentStyle = editorState.getCurrentInlineStyle();
  return (
    <div className='RichEditor-controls'>
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      )}
      {customInlineTypes.map( type => 
        <ClickableStyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onClick={type.onClick}
          style={type.style}
        />
        )}
    </div>
  );
}

InlineStyleControls.PropTypes = {
};

export default InlineStyleControls;
