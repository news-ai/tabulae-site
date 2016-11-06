import React, {Component, PropTypes} from 'react';
import * as actionCreators from 'actions/AppActions';
import * as actions from './actions';
import withRouter from 'react-router/lib/withRouter';
import Waiting from '../Waiting';
import {connect} from 'react-redux';

class ClientDirectories extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchClientNames();
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    const props = this.props;
    return (
      <div style={{marginTop: 60}}>
        CLIENT DIRECTORIES
        {props.isReceiving && <Waiting isReceiving={props.isReceiving} style={{float: 'right'}}/>}
        {props.clientnames && props.clientnames.map(name => name === props.clientname ? (
          <div onClick={_ => props.router.push(`/clients`)}>
            {name}
            {props.children}
          </div>
          ) :
        <div onClick={_ => props.router.push(`/clients/${name}`)}>{name}</div>)}
      </div>
      );
  }
}


const mapStateToProps = (state, props) => {
  const clientname = props.params.clientname;
  return {
    clientname,
    clientnames: state.clientReducer.clientnames,
    isReceiving: state.clientReducer.isReceiving,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchClientNames: _ => dispatch(actions.fetchClientNames())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ClientDirectories));
