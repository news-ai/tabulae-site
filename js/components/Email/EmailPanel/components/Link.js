import React from 'react';

export default function Link(props) {
  let href;
  if (props.entityKey !== null) {
    href = props.contentState.getEntity(props.entityKey).getData().href;
  } else {
    href = props.decoratedText;
  }
  return (
    <a href={href} className='drafjs-bhe_link'>
      {props.children}
    </a>
  );
}
