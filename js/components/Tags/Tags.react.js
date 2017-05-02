import React from 'react';
import {blue50, blue200} from 'material-ui/styles/colors';
import Tag from './Tag.react';

const Tags = ({className, createLink, hideDelete, tags, onDeleteTag, color, borderColor}) => {
  return (
    <div className={className || 'vertical-center'}>
  {tags && tags !== null && tags
    .map((name, i) =>
      <Tag
      color={color || blue50}
      borderColor={borderColor || blue200}
      hideDelete={hideDelete}
      key={`tag-${i}`}
      text={name}
      link={createLink && createLink(name)}
      onDeleteTag={_ => onDeleteTag(name)}
      />)}
    </div>);
};

export default Tags;
