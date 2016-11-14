import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import ListTable from './ListTable.react';

class ListFetchingContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchListIfNeeded();
  }

  render() {
    return this.props.list ?
    <ListTable {...this.props}/> : (
      <div style={{margin: 20}}>
        <span style={{margin: '0 10px'}}>LIST LOADING...</span>
        <i className='fa fa-cog fa-spin'/>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    listId,
    list: state.listReducer[listId]
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchList: listId => dispatch(actionCreators.fetchList(listId)),
  };
};

const mergeProps = (stateProps, dispatchProps, props) => {
  return {
    fetchListIfNeeded: _ => stateProps.list ? null : dispatchProps.fetchList(stateProps.listId),
    ...stateProps,
    ...props,
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ListFetchingContainer);
