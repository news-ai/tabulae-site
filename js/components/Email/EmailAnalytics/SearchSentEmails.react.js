import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailsList from './EmailsList.react';
import {actions as stagingActions} from 'components/Email';

class SearchSentEmails extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    // this.props.fetchSearchSentEmails()).then(t => console.log(t));
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <EmailsList
      isReceiving={props.isReceiving}
      emails={props.emails}
      fetchEmails={e => props.fetchSearchSentEmails(props.searchQuery)}
      />
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    emails: state.stagingReducer.searchReceivedEmails || [],
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
