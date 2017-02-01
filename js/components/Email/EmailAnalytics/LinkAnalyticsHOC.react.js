import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import {grey400, grey600} from 'material-ui/styles/colors';

const LinkItem = ({link, count}) => (
  <div className='row vertical-center' style={{margin: '5px 0'}}>
    <div className='large-6 medium-8 small-8'>
      <span style={{margin: '0 5px', color: grey600, fontSize: '0.9em'}}>{link}</span>
    </div>
    <div className='large-2 medium-3 small-4 columns'>
      <span>{count}</span>
    </div>
  </div>
  );

class LinkAnalyticsHOC extends Component {
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
        <Dialog title='Links Click Count' open={state.open} onRequestClose={_ => this.setState({open: false})}>
        {props.isReceiving ?
          <FontIcon color={grey400} className='fa fa-spinner fa-spin'/> :
          <div>
          {props.logs && props.links &&
            <div>
            {Object.keys(props.links).map((link, i) =>
              <LinkItem key={link} link={link} count={props.links[link]}/>)}
            </div>}
          {!props.links &&
            <span>No links were clicked in this email.</span>}
        </div>
      }
        </Dialog>
        {props.children({onRequestOpen: _ => this.setState({open: true})})}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    logs: state.stagingReducer[props.emailId].logs,
    links: state.stagingReducer[props.emailId].links,
    isReceiving: state.stagingReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLogs: _ => dispatch(stagingActions.fetchLogs(props.emailId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LinkAnalyticsHOC);
