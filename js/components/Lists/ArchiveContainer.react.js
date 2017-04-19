import React, {Component} from 'react';
import {actions as listActions} from 'components/Lists';
import {connect} from 'react-redux';

import Lists from './Lists';
import InfiniteScroll from 'components/InfiniteScroll';

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
        <div className='row' style={{marginTop: 10}}>
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
    title: 'Archive',
    tooltip: 'put back',
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onToggle: listId => {
      dispatch({type: 'IS_FETCHING', resource: 'lists', id: listId, fetchType: 'isArchiving'});
      return dispatch(listActions.archiveListToggle(listId))
      .then(_ => dispatch(listActions.fetchLists()))
      .then(_ =>dispatch({type: 'IS_FETCHING_DONE', resource: 'lists', id: listId, fetchType: 'isArchiving'}));
    },
    fetchLists: _ => dispatch(listActions.fetchArchivedLists())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ArchiveContainer);
