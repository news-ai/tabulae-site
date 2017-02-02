import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import {grey400, grey600} from 'material-ui/styles/colors';
import moment from 'moment-timezone';

const FORMAT = 'dddd, MMMM Do hh:mm A';

const OpenItem = ({Type, Created}) => {
  let createdDate = moment(Created);
  return (
  <div className='row vertical-center' style={{margin: '5px 0'}}>
    <span style={{margin: '0 5px', color: grey600, fontSize: '0.9em'}}>{createdDate.tz(moment.tz.guess()).format(FORMAT)}</span>
  </div>
  );
}

class OpenAnalyticsHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.logs && !prevState.open && this.state.open && this.props.count > 0) {
      this.props.fetchLogs();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        <Dialog title='Open Timeline' open={state.open} onRequestClose={_ => this.setState({open: false})}>
        {props.isReceiving ?
          <FontIcon color={grey400} className='fa fa-spinner fa-spin'/> :
          <div>
          {props.opens &&
            props.opens
            .map((item, i) => <OpenItem key={`${props.emailId}-open-${i}`} {...item}/>)
          }
          {!props.opens &&
            <span>Email was never opened.</span>}
        </div>
      }
        </Dialog>
        {props.children({onRequestOpen: _ => this.setState({open: true})})}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const logs = state.stagingReducer[props.emailId].logs;
  return {
    logs,
    links: state.stagingReducer[props.emailId].links,
    isReceiving: state.stagingReducer.isReceiving,
    opens: logs && logs.length > 0 && logs.filter(item => item.Type === 'open')
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLogs: _ => dispatch(stagingActions.fetchLogs(props.emailId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OpenAnalyticsHOC);