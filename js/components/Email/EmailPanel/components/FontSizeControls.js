import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';
import findAllFontSizesInSelection from 'components/Email/EmailPanel/editorUtils/findAllFontSizesInSelection';

const PLACEHOLDER = '---';
const FONT_PREFIX = 'SIZE-';

export default function FontSizeControls(props) {
  const {inlineStyles} = props;
  const currentFontSizes = findAllFontSizesInSelection(props.editorState);
  let value = '10.5';
  let currentType = {label: '10.5', value: 'SIZE-10.5'};
  // filling in custom sizing to dropdown from pasted HTML if found
  const leftover = currentFontSizes
  .map(font => font.split(FONT_PREFIX)[1])
  .filter(size => inlineStyles.filter(style => style.label === size).length === 0);
  const inlineStylesWithExtraStyles = [
  ...inlineStyles,
  ...leftover.map(size => ({inlineType: 'size', label: size, style: `SIZE-${size}`}))
  ].sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
  
  if (currentFontSizes.length > 1) {
    // more than one fontSize selected
    value = PLACEHOLDER;
    currentType = undefined;
  } else if (currentFontSizes.length === 1) {
    currentType = find(inlineStylesWithExtraStyles, type => currentFontSizes[0] === type.style);
    value = currentType.label;
  }

  const menuItems = [
    <MenuItem
    key={`fontsize-select-default`}
    value={PLACEHOLDER}
    labelStyle={{paddingLeft: 0}}
    primaryText={PLACEHOLDER}
    label={PLACEHOLDER}
    />,
    ...inlineStylesWithExtraStyles.map(type =>
      <MenuItem
      key={`fontsize-select-${type.label}`}
      value={type.label}
      primaryText={type.label}
      label={type.label}
      />)
  ];
  /*
  getSelection and then blocks within those selections find areas not applied with selected style and applied them
   */

  return (
    <DropDownMenu
    style={{fontSize: '0.9em'}}
    underlineStyle={{display: 'none', margin: 0}}
    value={value}
    onChange={(e, index, newValue) => {
      const selectStyle = `SIZE-${newValue}`;
      if (!currentType || currentType.label !== selectStyle) props.onToggle(selectStyle);
    }}
    >
    {menuItems}
    </DropDownMenu>
  );
}
