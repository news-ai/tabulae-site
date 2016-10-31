import Radium from 'radium';
import React, { PropTypes } from 'react';
import TextField from 'material-ui/TextField';

const styles = {
  nameBlock: {
    title: {
      marginLeft: 5,
      marginRight: 5,
      width: 500,
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

function ToggleableEditInput({
  isTitleEditing,
  onToggleTitleEdit,
  onUpdateName,
  name,
  nameStyle,
  placeholder,
  hideIcon,
  disabled
}) {
  const spanStyle = nameStyle ? Object.assign({}, styles.nameBlock.title, nameStyle) : styles.nameBlock.title;
  const content = placeholder && (!name || name.length === 0) ? placeholder : name;
  const renderNode = isTitleEditing && !disabled ? (
    <TextField
    className='u-full-width noprint'
    style={{left: 0, float: 'left'}}
    id='toggle-text-field'
    type='text'
    name={name}
    onBlur={onToggleTitleEdit}
    value={name}
    onChange={onUpdateName}
    autoFocus
    />) : (
    <div className='u-full-width' onClick={onToggleTitleEdit}>
      <span
      className='print'
      style={[spanStyle]}
      >{content}</span>
      {!hideIcon && !disabled && <i
      className='fa fa-pencil-square-o noprint'
      style={[styles.icon]}
      aria-hidden='true'></i>}
    </div>
    );
  return <div>{renderNode}</div>;
}

ToggleableEditInput.PropTypes = {
  isTitleEditing: PropTypes.bool.isRequired,
  onToggleTitleEdit: PropTypes.func.isRequired,
  onUpdateName: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

export default Radium(ToggleableEditInput);
