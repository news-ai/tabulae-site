import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';

export default function FontSizeControls(props) {
  let {inlineStyles} = props;
  var currentStyle = props.editorState.getCurrentInlineStyle();

  return (
    <div className='RichEditor-controls' style={{display: 'flex'}}>
      <SelectField
      value={find(inlineStyles, type => currentStyle.has(type.style)).label}
      onChange={(e, index, value) => props.onToggle(inlineStyles[index].style)}>
        {inlineStyles.map((type, i) =>
          <MenuItem
          key={`fontsize-select-${i}`}
          value={type.label}
          primaryText={type.label}
          />)}
      </SelectField>
    </div>
  );
}
