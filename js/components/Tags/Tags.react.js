import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import Tag from './Tag.react';

const Tags = props => {
  return (
    <div className='vertical-center'>
      <div className='vertical-center'>
        {props.list && props.list.tags !== null &&
          props.list.tags
          .map((name, i) =>
            <Tag hideDelete={props.hideDelete} key={`tag-${i}`} text={name} onDeleteTag={_ => props.onDeleteTag(name)}/>
            )}
      </div>
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
    patchList: listBody => dispatch(actionCreators.patchList(listBody))
  };
};

const mergeProps = ({list}, {patchList}, ownProps) => {
  return {
    list,
    onDeleteTag: name => patchList({
      listId: list.id,
      name: list.name,
      tags: list.tags.filter(tagName => tagName !== name)
    }),
    ...ownProps
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Tags);
