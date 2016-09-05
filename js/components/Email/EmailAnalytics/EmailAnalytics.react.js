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
    this.props.fetchSentEmails()
    .then( emails => this.setState({ sentEmails: emails }));
  }

  render() {
    const state = this.state;
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
        {state.sentEmails.map((email, i) =>
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
  return {
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
