import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import alertify from 'utils/alertify';
import {EditorState} from 'draft-js';

const IconButton = styled.i.attrs({
  className: props => props.className
})`
  cursor: pointer;
  color: #fff;
  margin-left: 10px;
`;

export default function Link(props) {

          // updateEntityLink: (...args) => this.onChange(EditorState.push(this.state.editorState, updateEntityLink(...args), 'activate-entity-data'), 'force-emit-html')
  const onSubmit = () => {
    const {contentState, entityKey, updateEntityLink} = props;
    const entityData = contentState.getEntity(entityKey).getData();
    alertify.prompt('', 'Edit URL to embeded link', entityData.url,
      (e, newValue) => updateEntityLink(contentState.mergeEntityData(entityKey, {url: newValue})),
      err => console.log(err)
      );
  }

  let href, isDecoratedText, entityData;
  if (props.entityKey !== null) {
    entityData = props.contentState.getEntity(props.entityKey).getData();
    href = entityData.url;
  } else {
    isDecoratedText = true;
    href = props.decoratedText;
  }
  return (
    <span>
      <a href={href} data-tip data-for={props.entityKey} target='_blank'>
        {props.children}
      </a>
      <ReactTooltip
      id={props.entityKey}
      className='tooltipStay'
      place='top'
      type='dark'
      effect='solid'
      delayHide={700}
      wrapper='span'
      getContent={() => (
        <div>
          <span>{href}</span>
        {!isDecoratedText &&
          <IconButton
          className='fa fa-edit'
          onClick={onSubmit}
          />}
        </div>
        )}
      />
    </span>
  );
}
