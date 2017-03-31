import React from 'react';
import ToggleableEditInput from './ToggleableEditInput.react';
import ToggleableEditInputHOC from './ToggleableEditInputHOC.react';

function ControlledInput(props) {
  return (
    <ToggleableEditInputHOC {...props}>
      {({onToggleTitleEdit, isTitleEditing, name, onUpdateName}) =>
      <ToggleableEditInput
        onToggleTitleEdit={onToggleTitleEdit}
        isTitleEditing={isTitleEditing}
        name={name}
        disabled={props.disabled}
        placeholder={props.placeholder}
        onUpdateName={onUpdateName}
        nameStyle={props.nameStyle}
        hideIcon={props.hideIcon}
        maxTextLength={props.maxTextLength}
        onKeyDown={props.onKeyDown}
        />}
    </ToggleableEditInputHOC>);
}

export {ToggleableEditInput, ToggleableEditInputHOC, ControlledInput};
