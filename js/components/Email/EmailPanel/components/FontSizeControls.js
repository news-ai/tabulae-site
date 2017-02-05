import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';
import Immutable from 'immutable';

export default function FontSizeControls(props) {
  let {inlineStyles} = props;
  var currentStyle = props.editorState.getCurrentInlineStyle();
  const currentType = find(inlineStyles, type => currentStyle.has(type.style));
  // console.log(currentType);

  return (
    <div className='RichEditor-controls' style={{display: 'flex'}}>
      <DropDownMenu
      value={currentType && currentType.label || 14}
      onChange={(e, index, value) => {
        if (currentType) {
          // untoggle size first if it exist
          props.onToggle(currentType.style);
        }
        props.onToggle(inlineStyles[index].style);
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
