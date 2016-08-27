import React from 'react';

export default function ClickableStyleButton({onClick, label}){
  return (
    <span className='RichEditor-styleButton' onClick={onClick}>
      {label}
    </span>
    );
}
