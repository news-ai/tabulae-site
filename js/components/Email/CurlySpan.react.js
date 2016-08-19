import React from 'react';

export default function CurlySpan(props) {
  return <span {...props} style={{ color: 'red' }}>{props.children}</span>;
}
