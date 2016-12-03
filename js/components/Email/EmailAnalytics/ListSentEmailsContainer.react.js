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
    this.props.fetchEmails();
  }

  render() {
    return <EmailsList {...this.props}/>;
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);

  const eemails = state.stagingReducer.received
  .filter(id => state.stagingReducer[id].delivered)
  .filter(id => !state.stagingReducer[id].archived)
  .map(id => state.stagingReducer[id]);
  console.log(eemails);
  console.log(listId);
  const emails = eemails
  .filter(email => email.listid === listId);
  console.log(emails);
  return {
    emails,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(actions.fetchListEmails(props.params.listId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AllSentEmailsContainer);
