import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';
// import Immutable from 'immutable';

export default function FontSizeControls(props) {
  let {inlineStyles} = props;
  var currentStyle = props.editorState.getCurrentInlineStyle();
  const currentType = find(inlineStyles, type => currentStyle.has(type.style));
  const selection = props.editorState.getSelection();
  let value = currentType && currentType.label || 14;
  if (!selection.isCollapsed() && !currentType && selection.getEndOffset() - selection.getStartOffset() > 0) {
    // more than one fontSize selected
    value = null;
  }

  return (
    <div className='RichEditor-controls'>
      <DropDownMenu
      value={value}
      onChange={(e, index, value) => {
        if (currentType) {
          // untoggle size first if it exist
          props.onToggle(currentType.style);
          setTimeout(_ => props.onToggle(inlineStyles[index].style), 100);
        } else {
          props.onToggle(inlineStyles[index].style);
        }
      }}
      >
        {inlineStyles.map(type =>
          <MenuItem
          key={`fontsize-select-${type.label}`}
          value={type.label}
          primaryText={type.label}
          label={type.label}
          />)}
      </DropDownMenu>
    </div>
  );
}
