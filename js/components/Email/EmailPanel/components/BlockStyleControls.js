import React from 'react';

import StyleButton from './StyleButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

export default function BlockStyleControls(props) {
  const {editorState, blockTypes} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  const renderNode = (
    <DropDownMenu
    value={blockTypes.find(type => type.style === blockType).label}
    onChange={(e, index, value) => props.onToggle(blockTypes[index].style)}>
    {blockTypes.map((type, i) => <MenuItem key={i} value={type.label} primaryText={type.label} />)}
    </DropDownMenu>
    );

  return (
    <div className="RichEditor-controls">
      {renderNode}
      {/*blockTypes.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )*/}
    </div>
  );
}
