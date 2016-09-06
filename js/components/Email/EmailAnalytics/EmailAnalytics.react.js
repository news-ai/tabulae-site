import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import StaticEmailContent from '../PreviewEmail/StaticEmailContent.react';
import AnalyticsItem from './AnalyticsItem.react';
import Dialog from 'material-ui/Dialog';

class EmailAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sentEmails: [],
      isPreviewOpen: false
    };
    this.handlePreviewOpen = email => this.setState({isPreviewOpen: true, previewEmail: email});
    this.handlePreviewClose = _ => this.setState({isPreviewOpen: false, previewEmail: null});
  }

  componentWillMount() {
    this.props.fetchSentEmails();
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div className='container'>
        <div style={{marginTop: '20px', marginBottom: '20px'}}>
          <span style={{fontSize: '1.2em', marginRight: '10px'}}>Emails You Sent</span>
        </div>
        <Dialog
        open={state.isPreviewOpen}
        onRequestClose={this.handlePreviewClose}
        >
          <StaticEmailContent {...state.previewEmail} />
        </Dialog>
        {props.sentEmails.map((email, i) =>
          <AnalyticsItem
          key={i}
          onPreviewOpen={ _ => this.handlePreviewOpen(email)}
          {...email}
          />)}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const sentEmails = state.stagingReducer.received
  .filter(id => state.stagingReducer[id].issent)
  .map(id => {
    let email = state.stagingReducer[id];
    if (email.listid !== 0 && state.listReducer[email.listid]) {
      email.listname = state.listReducer[email.listid].name;
    }
    return email;
  });
  return {
    sentEmails
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: action => dispatch(action),
    fetchSentEmails: _ => dispatch(actions.getSentEmails())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmailAnalytics);
