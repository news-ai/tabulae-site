import React from 'react';

export default function ClickableStyleButton({onClick, label}){
  return (
    <span className='RichEditor-styleButton' onClick={this.props.onClick}>
      {this.props.label}
    </span>
    );
}
