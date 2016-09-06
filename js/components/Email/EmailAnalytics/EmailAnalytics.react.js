import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import * as actionCreators from '../../../actions/AppActions';
import StaticEmailContent from '../PreviewEmail/StaticEmailContent.react';
import AnalyticsItem from './AnalyticsItem.react';
import Dialog from 'material-ui/Dialog';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';

class EmailAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sentEmails: [],
      isPreviewOpen: false,
      filterValue: null
    };
    this.handlePreviewOpen = email => this.setState({isPreviewOpen: true, previewEmail: email});
    this.handlePreviewClose = _ => this.setState({isPreviewOpen: false, previewEmail: null});
    this.handleChange = (event, index, filterValue) => this.setState({filterValue});
  }

  componentWillMount() {
    const {listReducer, listId, fetchLists, fetchSentEmails} = this.props;
    if (listReducer.received.length === 0) fetchLists();
    fetchSentEmails();
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
        {props.isNextButton ? <RaisedButton
          label='Load More Emails'
          labelStyle={{textTransform: 'none'}}
          onClick={props.fetchSentEmails}
          /> : null}
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
    sentEmails,
    listId: props.params.listId,
    listReducer: state.listReducer,
    isNextButton: (state.stagingReducer.offset !== null) ? true: false
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: action => dispatch(action),
    fetchSentEmails: _ => dispatch(actions.fetchSentEmails()),
    fetchLists: listId => dispatch(actionCreators.fetchLists()),
    fetchListEmails: listId => dispatch(actions.fetchListEmails(listId))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmailAnalytics);
