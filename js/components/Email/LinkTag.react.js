import React from 'react';
import { Entity } from 'draft-js';

const style = {
  color: '#3b5998',
  textDecoration: 'underline',
  zIndex: 200
};

export default function LinkTag(props) {
  const {url} = Entity.get(props.entityKey).getData();
  return <a
  href={url}
  target='_blank'
  style={style}
  >{props.children}</a>;
}
