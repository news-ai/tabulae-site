import React, { Component } from 'react';

const defaultStyle = {
  zIndex: 160,
};

export default function Waiting({ isReceiving, style }) {
  const mergeStyles = style ? Object.assign({}, defaultStyle, style) : defaultStyle;
  return isReceiving ? (<i
  style={mergeStyles}
  className='fa fa-spinner fa-spin fa-3x'
  aria-hidden='true'></i>) : <span />;
}
