import React, { Component } from 'react';
import * as actionCreators from 'actions/AppActions';
import { connect } from 'react-redux';
import Lists from '../Lists';
import InfiniteScroll from '../InfiniteScroll';

class ArchiveContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchLists();
  }

  render() {
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchLists}>
        <div className='row'>
          <div className='large-offset-1 large-10 columns'>
          <Lists {...this.props} />
          </div>
        </div>
      </InfiniteScroll>
      );
  }
}

const mapStateToProps = state => {
  const lists = state.listReducer.archivedLists.map(id => state.listReducer[id]);
  return {
    lists: lists,
    isReceiving: lists === undefined ? true : false,
    statementIfEmpty: 'It looks like you haven\'t archived any list. This is where lists go when you archive them.',
    listItemIcon: 'fa fa-arrow-left',
    backRoute: '/',
    backRouteTitle: 'Media Lists',
    title: 'Archive'
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    onToggle: listId => dispatch(actionCreators.archiveListToggle(listId))
    .then( _ => dispatch(actionCreators.fetchLists())),
    fetchLists: _ => dispatch(actionCreators.fetchLists())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ArchiveContainer);
