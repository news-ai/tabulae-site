import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import PreviewEmailContent from '../PreviewEmailContent.react';
import AnalyticsPanel from './AnalyticsPanel.react';

class EmailAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sentEmails: []
    };
  }

  componentWillMount() {
    this.props.fetchSentEmails()
    .then( emails => this.setState({ sentEmails: emails }));
  }

  render() {
    const state = this.state;
    console.log(state.sentEmails);
    return (
      <div>
        <span>EMAIL ANALYTICS</span>
        {
          state.sentEmails.map( email => {
            return (
              <div>
              <AnalyticsPanel {...email} />
              <PreviewEmailContent {...email} />
              </div>

              )
          })
        }
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
