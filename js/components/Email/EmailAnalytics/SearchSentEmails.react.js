import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailsList from './EmailsList.react';
import {actions as stagingActions} from 'components/Email';

class SearchSentEmails extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchSearchSentEmails(this.props.searchQuery);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.searchQuery !== nextProps.searchQuery) this.props.fetchSearchSentEmails(nextProps.searchQuery);
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <EmailsList
      isReceiving={props.isReceiving}
      emails={props.emails}
      fetchEmails={_ => {}}
      placeholder='Search results will be shown here.'
      />
      );
  }
}

const mapStateToProps = (state, props) => {
  const ids = state.stagingReducer.searchReceivedEmails || [];
  let email;
  const emails = ids ? ids.reduce((acc, id) => {
    email = state.stagingReducer[id];
    if (email && email.issent) acc.push(email);
    return acc;
  }, []) : [];
  return {
    emails,
    isReceiving: state.stagingReducer.isReceiving,
    searchQuery: props.params.searchQuery
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSearchSentEmails: query => dispatch(stagingActions.fetchSearchSentEmails(query)),
  };
};

const mergeProps = (sProps, dProps) => {
  return {
    ...sProps,
    ...dProps,
    fetchEmails: _ => dProps.fetchSearchSentEmails(sProps.searchQuery).then(t => t),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(SearchSentEmails);
