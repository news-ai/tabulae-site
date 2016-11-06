import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as actions from './actions';
import Waiting from '../Waiting';

const ClientDirectory = props => {
  return (<div>
  {props.lists.map(list => <span>{list.name}</span>)}
  </div>);
};

class ClientDirectoryContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    if (!this.props.listIds) this.props.fetchLists();
  }

  render() {
    const props = this.props;
    return !props.lists ?
      <Waiting style={{float: 'right'}} isReceiving={props.isReceiving} /> :
    <ClientDirectory {...props}/>;
  }
}

const mapStateToProps = (state, props) => {
  const clientname = props.params.clientname;
  const listIds = state.clientReducer[clientname];
  return {
    clientname,
    listIds,
    lists: listIds && listIds.map(id => state.listReducer[id]),
    isReceiving: state.listReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const clientname = props.params.clientname;
  return {
    fetchLists: _ => dispatch(actions.fetchClientLists(clientname))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientDirectoryContainer);
