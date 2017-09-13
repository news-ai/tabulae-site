import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import find from 'lodash/find';
import DropDownMenu from 'material-ui/DropDownMenu';
import findAllFontSizesInSelection from 'components/Email/EmailPanel/editorUtils/findAllFontSizesInSelection';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const PLACEHOLDER = '---';
const FONT_PREFIX = 'SIZE-';

export default function FontSizeControls(props) {
  const {inlineStyles} = props;
  const options = [
    {label: '---', value: undefined},
    ...inlineStyles.map(val => ({label: val.label, value: val.style}))
  ];
  const currentFontSizes = findAllFontSizesInSelection(props.editorState);
  let currentType = {label: '10.5', value: 'SIZE-10.5'};
  console.log(currentFontSizes);
  if (currentFontSizes.length > 1) {
    // more than one fontSize selected
    currentType = {label: '---', value: undefined} ;
  } else if (currentFontSizes.length === 1) {
    currentType = find(options, option => currentFontSizes[0] === option.value);
    if (!currentType) {
      const notInListType = currentFontSizes[0].split(FONT_PREFIX)[1];
      // console.log(notInListType)
      currentType = {label: notInListType, value: currentFontSizes[0]};
    }
  } else {
    currentType = {label: '---', value: undefined} ;
  }
 
  // console.log(currentType);

  return (
    <div className='vertical-center'>
      <Select.Creatable
      options={options}
      labelKey='label'
      valueKey='value'
      value={currentType.value}
      onChange={option => {
        if (!currentType.value || currentType.value !== option.value) props.onToggle(option.value);
      }}
      />
    </div>
  );
}
