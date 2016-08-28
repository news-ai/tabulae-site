import React, { Component } from 'react';
import * as actionCreators from 'actions/AppActions';
import { connect } from 'react-redux';
import Lists from '../Lists';

class ArchiveContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actionCreators.fetchLists());
  }

  render() {
    return (<div className='container'>
      <Lists {...this.props} />
      </div>);
  }
}

const mapStateToProps = state => {
  const lists = state.listReducer.archivedList;
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ArchiveContainer);
