import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailStats from './EmailStats.react';
import IconButton from 'material-ui/IconButton';
import EmailsList from '../EmailsList.react';
import {actions as stagingActions} from 'components/Email';
import {grey200} from 'material-ui/styles/colors';

class EmailStatsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDay: undefined,
      emails: []
    };
    this.onDateSelected = this._onDateSelected.bind(this);
  }

  _onDateSelected(day) {
    this.setState({selectedDay: day, isEmailLoading: true});
    this.props.fetchSpecificDayEmails(day)
    .then(emails => this.setState({emails, isEmailLoading: false}));
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
    <div>
      <div className='row'>
        <span style={{fontSize: '1.5em'}}>Opens/Clicks History</span>
      </div>
      <div style={{marginTop: 20}}>
      {props.didInvalidate &&
        <div>An error occurred. Email stats cannot be fetched at this time.</div>}
      {props.isReceiving &&
        <div style={{width: 700, height: 300, backgroundColor: grey200}}></div>}
        <EmailStats onDateSelected={this.onDateSelected}/>
      </div>
    {state.emails.length === 0 &&
      <div style={{margin: '10px 0'}}>
        <span>Click on a point in the chart to show emails sent on that day.</span>
      </div>}
    {state.isEmailLoading &&
      <div>Loading emails... <i className='fa fa-spinner fa-spin'/></div>}
    {state.emails.length > 0 &&
      <EmailsList
      emails={state.emails}
      hasNext={false}
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSpecificDayEmails: day => dispatch(stagingActions.fetchSpecificDayEmails(day)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailStatsContainer);
