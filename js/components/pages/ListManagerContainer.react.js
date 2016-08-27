import React, { Component } from 'react';
import * as actionCreators from 'actions/AppActions';
import { connect } from 'react-redux';
import Lists from '../Lists';

class ListManagerContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actionCreators.fetchLists());
  }

  render() {
    return (
      <div className='container'>
        <Lists {...this.props} />
        <button onClick={this.props.newListOnClick}>Add New List</button>
      </div>
      );
  }
}


const mapStateToProps = state => {
  const lists = state.listReducer.lists;
  return {
    lists: lists,
    isReceiving: lists === undefined ? true : false,
    statementIfEmpty: 'It looks like you haven\'t created any list. Go ahead and make one!',
    listItemIcon: 'fa fa-archive',
    backRoute: '/archive',
    backRouteTitle: 'Archive',
    title: 'Media Lists'
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    onArchiveToggle: listId => dispatch(actionCreators.archiveListToggle(listId))
    .then( _ => dispatch(actionCreators.fetchLists())),
    newListOnClick: _ => dispatch(actionCreators.createEmptyList())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ListManagerContainer);
