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
  // console.log(currentFontSizes);
  if (currentFontSizes.length > 1) {
    // more than one fontSize selected
    value = PLACEHOLDER;
  } else if (currentFontSizes.length === 1) {
    const currentType = find(inlineStyles, type => currentFontSizes[0] === type.style);
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
    ...inlineStyles.map(type =>
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
      const selectStyle = inlineStyles[index - 1].style;
      props.onToggle(selectStyle);
    }}
    >
    {menuItems}
    </DropDownMenu>
  );
}
