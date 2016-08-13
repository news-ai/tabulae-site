import Radium from 'radium';
import React, { Component } from 'react';

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

function ToggleableEditInput({ onTitleEdit, toggleTitleEdit, updateName, name}) {
  if (onTitleEdit) return (
    <input
    className='u-full-width'
    type='text'
    onBlur={toggleTitleEdit}
    value={name}
    onChange={updateName}
    autoFocus
    />);
  else return (
    <div onClick={toggleTitleEdit}>
      <span
      style={[styles.nameBlock.title]}
      >{name}</span>
      <i
      className='fa fa-pencil-square-o'
      style={[styles.icon]}
      aria-hidden='true'></i>
    </div>
    );
}

export default Radium(ToggleableEditInput);
