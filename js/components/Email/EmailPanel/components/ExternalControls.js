import React from 'react';
import StyleButton from './StyleButton';

export default function ExternalControls(props) {
  let {externalControls} = props;

  return (
    <div className='RichEditor-controls' style={{display: 'flex'}}>
      {externalControls.map(type =>
        <StyleButton
        key={type.label}
        label={type.label}
        active={props.active}
        onToggle={type.onToggle}
        style={type.style}
        icon={type.icon}
        />
      )}
    </div>
  );
}
