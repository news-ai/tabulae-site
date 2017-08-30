import React from 'react';
import ReactTooltip from 'react-tooltip';

export default function Link(props) {
  let href;
  if (props.entityKey !== null) {
    href = props.contentState.getEntity(props.entityKey).getData().url;
  } else {
    href = props.decoratedText;
  }
  return (
    <div style={{display: 'inline-block'}} >
      <a href={href} data-tip data-for='tooltipTarget' target='_blank'>
        {props.children}
      </a>
      <ReactTooltip
      id='tooltipTarget'
      place='top'
      type='dark'
      effect='solid'
      getContent={() => href}
      />
    </div>
  );
}
