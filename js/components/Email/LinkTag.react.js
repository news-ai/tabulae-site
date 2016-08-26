import React from 'react';
import { Entity } from 'draft-js';

export default function LinkTag(props) {
  const {url} = Entity.get(props.entityKey).getData();
  return <a
  href={url}
  target='_self'
  >{props.children}</a>;
}
