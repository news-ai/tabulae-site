import React from 'react';
import Image from 'components/Email/EmailPanel/Image/Image.react';
import Immutable from 'immutable';
import {
  convertToRaw,
  convertFromRaw,
  EditorState
} from 'draft-js';

// draft-convert has a bug that uses 'a' as anchor textNode for atomic block
export function stripATextNodeFromContent(content) {
  const {entityMap, blocks} = convertToRaw(content);
  const newRaw = {entityMap, blocks: blocks.map(block => {
    if (block.type === 'atomic') {
      return Object.assign({}, block, {text: ' '});
    }
    return block;
  })};
  return convertFromRaw(newRaw);
}

const Media = props => {
  const {block, contentState, } = props;
  // console.log(convertToRaw(contentState));
  // console.log(block.getEntityAt(0));
  const entity = contentState.getEntity(block.getEntityAt(0));
  // console.log(entity.getData());
  const type = entity.getType();

  let media;
  if (type === 'IMAGE') {
    // const realEntity = props.blockProps.getEditorState().getCurrentContent().getEntity(block.getEntityAt(0));
    const {src, align, imageLink, size} = entity.getData();
    media = (
      <Image
      align={align}
      imageLink={imageLink}
      size={size}
      src={src}
      onDragStart={e => {
        e.dataTransfer.dropEffect = 'move';
        e.dataTransfer.setData('text', props.block.getKey());
      }}
      onDragDrop={props.blockProps.onImageDragDrop}
      onSizeChange={newSize => {
        const editorState = props.blockProps.getEditorState();
        const newContent = editorState.getCurrentContent()
        .mergeEntityData(block.getEntityAt(0), {size: `${newSize}%`});

        const newEditorState = EditorState.push(editorState, newContent, 'activate-entity-data');
        const selection = newEditorState.getSelection();
        props.blockProps.onChange(EditorState.forceSelection(newEditorState, selection), 'force-emit-html');
      }}
      onImageLinkChange={imageLink => {
        const editorState = props.blockProps.getEditorState();
        const newContent = editorState.getCurrentContent()
        .mergeEntityData(block.getEntityAt(0), {imageLink});

        const newEditorState = EditorState.push(editorState, newContent, 'activate-entity-data');
        const selection = newEditorState.getSelection();
        props.blockProps.onChange(EditorState.forceSelection(newEditorState, selection), 'force-emit-html');
      }}
      onImageAlignChange={align => {
        const editorState = props.blockProps.getEditorState();
        const newContent = editorState.getCurrentContent()
        .mergeEntityData(block.getEntityAt(0), {align});

        const newEditorState = EditorState.push(editorState, newContent, 'activate-entity-data');
        const selection = newEditorState.getSelection();
        props.blockProps.onChange(EditorState.forceSelection(newEditorState, selection), 'force-emit-html');
      }}
      />);
  }
  return media;
};

export const mediaBlockRenderer = ({getEditorState, onChange, onImageDragDrop}) => (block) => {
  // const editorState = getEditorState();
  // console.log(editorState);
  if (block.getType() === 'atomic') {
    return {
      component: Media,
      editable: false,
      props: {
        getEditorState,
        onChange,
        onImageDragDrop
      }
    };
  }
  return null;
};

export function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    case 'right-align':
      return 'RichEditor-right-align';
    case 'left-align':
      return 'RichEditor-left-align';
    case 'center-align':
      return 'RichEditor-center-align';
    case 'justify-align':
      return 'RichEditor-justify-align';
    default:
      return null;
  }
}

export const blockRenderMap = Immutable.Map({
  'right-align': {
    element: 'div',
  },
  'center-align': {
    element: 'div'
  },
  'justify-align': {
    element: 'div'
  }
});

// Custom overrides for "code" style.
export const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  },
  'SIZE-5': {fontSize: 5.5},
  'SIZE-6': {fontSize: 6},
  'SIZE-7.5': {fontSize: 7.5},
  'SIZE-8': {fontSize: 8},
  'SIZE-9': {fontSize: 9},
  'SIZE-10': {fontSize: 10},
  'SIZE-10.5': {fontSize: 10.5},
  'SIZE-11': {fontSize: 11},
  'SIZE-12': {fontSize: 12},
  'SIZE-14': {fontSize: 14},
  'SIZE-16': {fontSize: 16},
  'SIZE-18': {fontSize: 18},
  'SIZE-20': {fontSize: 20},
  'SIZE-22': {fontSize: 22},
  'SIZE-24': {fontSize: 24},
  'SIZE-26': {fontSize: 26},
  'SIZE-28': {fontSize: 28},
  'SIZE-36': {fontSize: 36},
  'SIZE-48': {fontSize: 48},
  'SIZE-72': {fontSize: 72},
};
