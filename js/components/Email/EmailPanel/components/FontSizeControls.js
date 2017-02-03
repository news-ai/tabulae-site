import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';

export default function FontSizeControls(props) {
  let {inlineStyles} = props;
  var currentStyle = props.editorState.getCurrentInlineStyle();
  const currentType = find(inlineStyles, type => currentStyle.has(type.style));

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
      {/*<SelectField
      value={find(inlineStyles, type => currentStyle.has(type.style)).label || 'NONE'}
      onChange={(e, index, value) => {
        const currentSize = find(inlineStyles, type => currentStyle.has(type.style));
        if (currentSize) {
          // untoggle size first if it exist
          props.onToggle(currentStyle.style);
        }
        props.onToggle(inlineStyles[index].style);
      }}>
        {inlineStyles.map((type, i) =>
          <MenuItem
          key={`fontsize-select-${i}`}
          value={type.label}
          primaryText={type.label}
          />)}
      </SelectField>*/}
    </div>
  );
}
