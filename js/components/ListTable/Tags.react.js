import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import {blue50, grey700, grey400, grey500} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import AddTagDialogHOC from './AddTagDialogHOC.react';

const Tag = ({text, onDeleteTag}) => (
  <div className='vertical-center' style={{backgroundColor: blue50}}>
    <span style={{color: grey700, fontSize: '0.8em', padding: '3px 8px'}}>{props.text}</span>
    <FontIcon
    onClick={onDeleteTag}
    style={{fontSize: '0.8em', margin: '0 4px'}}
    className='fa fa-times'
    color={grey400}
    hoverColor={grey500}/>
  </div>);

const Tags = props => {
  return (
    <div className={props.className}>
      {
        props.list && props.list.tags !== null &&
        props.list.tags
        .map((name, i) => <Tag key={`tag-${i}`} text={name} onDeleteTag={_ => props.onDeleteTag(name)}/>)
      }
      <AddTagDialogHOC>
        {({onRequestOpen}) => <IconButton iconClassName='fa fa-plus' onClick={onRequestOpen} tooltip='Add Tag'/>}
      </AddTagDialogHOC>
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
    onAddTag: name => patchList({
      listId: list.id,
      name: list.name,
      tags: list.tags === null ? [name] : [...list.tags, name]
    }),
    onDeleteTag: name => patchList({
      listId: list.id,
      name: list.name,
      tags: list.tags.filter(tagName => tagName !== name)
    }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Tags);
