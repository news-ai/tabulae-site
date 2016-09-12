import Radium from 'radium';
import React, { PropTypes } from 'react';

const styles = {
  nameBlock: {
    title: {
      marginLeft: '5px',
      marginRight: '5px',
      width: '500px',
      fontSize: '1.2em'
    }
  },
  icon: {
    color: 'lightgray',
    marginLeft: '5px',
    ':hover': {
      color: 'gray',
      cursor: 'pointer'
    }
  }
};

function ToggleableEditInput({isTitleEditing, onToggleTitleEdit, onUpdateName, name}) {
  const renderNode = isTitleEditing ? (
    <input
    className='u-full-width'
    type='text'
    onBlur={onToggleTitleEdit}
    value={name}
    onChange={onUpdateName}
    autoFocus
    />) : (
    <div className='u-full-width' onClick={onToggleTitleEdit}>
      <span
      style={[styles.nameBlock.title]}
      >{name}</span>
      <i
      className='fa fa-pencil-square-o'
      style={[styles.icon]}
      aria-hidden='true'></i>
    </div>
    );
  return renderNode;
}

ToggleableEditInput.PropTypes = {
  isTitleEditing: PropTypes.bool.isRequired,
  onToggleTitleEdit: PropTypes.func.isRequired,
  onUpdateName: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

export default Radium(ToggleableEditInput);
