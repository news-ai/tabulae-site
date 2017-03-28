import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';
// import Immutable from 'immutable';

const PLACEHOLDER = '---';

export default function FontSizeControls(props) {
  let {inlineStyles} = props;
  var currentStyle = props.editorState.getCurrentInlineStyle();
  const currentType = find(inlineStyles, type => currentStyle.has(type.style));
  const selection = props.editorState.getSelection();
  let value = '14';
  if (currentType) {
    value = currentType.label;
  }
  if (!selection.isCollapsed() && selection.getHasFocus() && !currentType && selection.getEndOffset() - selection.getStartOffset() > 0) {
    // more than one fontSize selected
    value = PLACEHOLDER;
  }
  const menuItems = [
    <MenuItem
    key={`fontsize-select-default`}
    value={PLACEHOLDER}
    primaryText={PLACEHOLDER}
    label={PLACEHOLDER}
    />,
    ...inlineStyles.map(type =>
      <MenuItem
      key={`fontsize-select-${type.label}`}
      value={type.label}
      primaryText={type.label}
      label={type.label}
      />)
  ];

  return (
    <div className='RichEditor-controls'>
      <DropDownMenu
      value={value}
      onChange={(e, index, newValue) => {
        if (currentType) {
          // untoggle size first if it exist
          props.onToggle(currentType.style);
          setTimeout(_ => {
            props.onToggle(inlineStyles[index - 1].style);
          }, 100);
        } else {
          props.onToggle(inlineStyles[index - 1].style);
        }
      }}
      >
      {menuItems}
      </DropDownMenu>
    </div>
  );
}
