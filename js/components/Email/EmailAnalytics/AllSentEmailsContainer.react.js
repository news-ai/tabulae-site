import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailsList from './EmailsList.react';
import * as actions from '../actions';
import * as actionCreators from 'actions/AppActions';

class AllSentEmailsContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchSentEmails();
  }

  render() {
    return <EmailsList {...this.props}/>;
  }
}

const mapStateToProps = (state, props) => {
  const emails = state.stagingReducer.received
  .filter(id => state.stagingReducer[id].delivered)
  .filter(id => !state.stagingReducer[id].archived)
  .map(id => state.stagingReducer[id]);
  return {
    emails,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSentEmails: _ => dispatch(actions.fetchSentEmails()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AllSentEmailsContainer);
