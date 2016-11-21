import React from 'react';

import StyleButton from './StyleButton';

import {Entity} from 'draft-js';

function isEntityActiveInSelection(editorState, entityType) {
  let hasEntityType = false;
  const selection = editorState.getSelection();
  if (selection.isCollapsed()) return hasEntityType;
  const startKey = selection.getStartKey();
  const startOffset = selection.getStartOffset();
  const endOffset = selection.getEndOffset();
  const blockAtLinkBeginning = editorState.getCurrentContent().getBlockForKey(startKey);
  let i;
  let linkKey;
  for (i = startOffset; i < endOffset; i++) {
    linkKey = blockAtLinkBeginning.getEntityAt(i);
    if (linkKey !== null) {
      const type = Entity.get(linkKey).getType();
      if (type === entityType) {
        hasEntityType = true;
        break;
      }
    }
  }
  return hasEntityType;
}

export default function EntityControls(props) {
  const {entityControls} = props;
  return (
    <div className='RichEditor-controls' style={{display: 'flex'}}>
      {entityControls.map(type =>
        <StyleButton
        key={type.label}
        active={isEntityActiveInSelection(props.editorState, type.entityType)}
        label={type.label}
        onToggle={type.action}
        icon={type.icon}
        />
      )}
    </div>
  );
}
