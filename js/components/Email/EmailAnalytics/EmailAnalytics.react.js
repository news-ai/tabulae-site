import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import StaticEmailContent from '../PreviewEmail/StaticEmailContent.react';
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
    return (
      <div className='container'>
        <div style={{marginTop: '20px', marginBottom: '20px'}}>
          <span style={{fontSize: '1.2em', marginRight: '10px'}}>Emails You Sent</span>
        </div>
        {
          state.sentEmails.map( (email, i) => <AnalyticsPanel key={i} {...email} />)
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
