import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailStats from './EmailStats.react';
import IconButton from 'material-ui/IconButton';
import EmailsList from '../EmailsList.react';
import {actions as stagingActions} from 'components/Email';

class EmailStatsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDay: '2017-04-04',
      emails: []
    };
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
        <EmailStats/>
      </div>
      <IconButton
      iconClassName='fa fa-envelope'
      onClick={_ => props.fetchSpecificDayEmails(state.selectedDay).then(emails => this.setState({emails}))}
      />
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSpecificDayEmails: day => dispatch(stagingActions.fetchSpecificDayEmails(day)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailStatsContainer);
