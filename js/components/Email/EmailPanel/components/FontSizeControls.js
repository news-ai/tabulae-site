import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';

const PLACEHOLDER = '---';
const FONT_PREFIX = 'SIZE-';

export default function FontSizeControls(props) {
  const {inlineStyles} = props;
  const currentStyle = props.editorState.getCurrentInlineStyle();
  const currentType = find(inlineStyles, type => currentStyle.has(type.style));
  const selection = props.editorState.getSelection();
  const currentFontsize = currentStyle.toJS().filter(font => font.substring(0, FONT_PREFIX.length) === FONT_PREFIX)[0];
  let value = '10.5';
  if (currentType) {
    value = currentType.label;
  }
  if (!selection.isCollapsed() && selection.getHasFocus() && !currentType && selection.getEndOffset() - selection.getStartOffset() > 0) {
    // more than one fontSize selected
    value = PLACEHOLDER;
  }
  // console.log(currentFontsize);
  const menuItems = [
    <MenuItem
    key={`fontsize-select-default`}
    value={PLACEHOLDER}
    labelStyle={{paddingLeft: 0}}
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
    <DropDownMenu
    style={{fontSize: '0.9em'}}
    underlineStyle={{display: 'none', margin: 0}}
    value={value}
    onChange={(e, index, newValue) => {
      const selectStyle = inlineStyles[index - 1].style;
      if (selectStyle !== currentFontsize) props.onToggle(selectStyle);
    }}
    >
    {menuItems}
    </DropDownMenu>
  );
}
