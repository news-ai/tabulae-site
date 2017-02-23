import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {actions as listActions} from 'components/Lists';
import {blue50, blue200, grey800, grey500} from 'material-ui/styles/colors';
import Tag from './Tag.react';

const Tags = props => {
  return (
    <div className='vertical-center'>
  {props.list && props.list.tags !== null && props.list.tags
    .map((name, i) =>
      <Tag
      color={blue50}
      borderColor={blue200}
      hideDelete={props.hideDelete}
      key={`tag-${i}`}
      text={name}
      link={`/tags/${name}`}
      onDeleteTag={_ => props.onDeleteTag(name)}
      />)}
    </div>);
};

const mapStateToProps = (state, props) => {
  return {
    list: state.listReducer[props.listId],
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = props.listId;
  return {
    patchList: listBody => dispatch(listActions.patchList(listBody))
  };
};

const mergeProps = ({list}, {patchList}, ownProps) => {
  return {
    list,
    onDeleteTag: name => patchList({
      listId: list.id,
      name: list.name,
      tags: list.tags.filter(tagName => tagName !== name),
      client: list.client
    }),
    ...ownProps
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Tags);
