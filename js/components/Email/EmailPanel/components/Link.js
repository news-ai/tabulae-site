import React from 'react';

export default function Link(props) {
  let href;
  if (props.entityKey !== null) {
    href = props.contentState.getEntity(props.entityKey).getData().href;
  } else {
    href = props.decoratedText;
  }
  return (
    <a href={href} target='_blank'>
      {props.children}
    </a>
  );
}
