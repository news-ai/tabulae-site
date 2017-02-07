import React from 'react';

export default function Link(props) {
  const {href} = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={href} className='drafjs-bhe_link'>
      {props.children}
    </a>
  );
}
