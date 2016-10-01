import React from 'react';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

export default function BlockStyleControls(props) {
  const {editorState, blockTypes} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <DropDownMenu
    style={{width: 200}}
    value={blockTypes.find(type => type.style === blockType).label}
    onChange={(e, index, value) => props.onToggle(blockTypes[index].style)}>
      {blockTypes.map((type, i) => <MenuItem key={i} value={type.label} primaryText={type.label} />)}
    </DropDownMenu>
  );
}
