import React, {Component} from 'react';

import {connect} from 'react-redux';
import EmailStats from './EmailStats.react';
// import EmailsList from 'components/Email/EmailAnalytics/EmailsList';
import PlainEmailsList from './PlainEmailsList.react';
import {actions as stagingActions} from 'components/Email';
import {grey200, grey700} from 'material-ui/styles/colors';

class EmailStatsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDay: undefined,
      emails: [],
      isEmailLoading: false,
      noEmailSentDay: false,
      hasNext: false
    };
    this.onDateSelected = this._onDateSelected.bind(this);
  }

  _onDateSelected(day) {
    // simple receiver
    const receiveEmails = emails => this.setState({emails, isEmailLoading: false, noEmailSentDay: emails.length === 0});

    this.setState({selectedDay: day, isEmailLoading: true});
    const dayStats = this.props.emailStatsReducer[day];
    if (dayStats && dayStats.received && !dayStats.hitThreshold) {
      // hits cache if already fetched
      const emails = dayStats.received.map(id => this.props.stagingReducer[id]);
      receiveEmails(emails);
    } else {
      this.props.fetchSpecificDayEmails(day)
      .then(receiveEmails);
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const emailStats = props.emailStatsReducer[state.selectedDay];
    const hasNext = emailStats && emailStats.hitThreshold;
    return (
    <div>
      <div className='row'>
        <span style={{fontSize: '1.5em'}}>Opens/Clicks History</span>
      </div>
      <div style={{marginTop: 20}}>
      {props.didInvalidate &&
        <div>An error occurred. Email stats cannot be fetched at this time.</div>}
      {props.isReceiving &&
        <div className='row horizontal-center'>
          <div style={{width: 700, height: 300, backgroundColor: grey200}}></div>
        </div>}
        <EmailStats onDateSelected={this.onDateSelected}/>
      </div>
    <div style={{height: 20}}>
    {state.isEmailLoading &&
      <div>Loading emails... <i className='fa fa-spinner fa-spin'/></div>}
    {!state.isEmailLoading && state.emails.length === 0 &&
        <span>{state.noEmailSentDay ? `No email sent on day selected.` : `Click on a point in the chart to show emails sent on that day.`}</span>}
    </div>
    <div style={{height: 20, margin: 10}}>
      <span style={{fontSize: '1.2em', color: grey700}}>{state.selectedDay}</span>
    </div>
    {state.emails.length > 0 &&
      <PlainEmailsList
      emails={state.emails}
      fetchEmails={_ => this.onDateSelected(state.selectedDay)}
      hasNext={hasNext}
      />}
    </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    didInvalidate: state.emailStatsReducer.didInvalidate,
    emailDidInvalidate: state.stagingReducer.didInvalidate,
    isReceiving: state.emailStatsReducer.isReceiving,
    emailStatsReducer: state.emailStatsReducer,
    stagingReducer: state.stagingReducer,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSpecificDayEmails: day => dispatch(stagingActions.fetchSpecificDayEmails(day)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailStatsContainer);
