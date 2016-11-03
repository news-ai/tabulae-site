import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import * as feedActions from './actions';
import * as AppActions from '../../actions/AppActions';
import * as headlineActions from './Headlines/actions';
import * as contactActions from '../../actions/contactActions';
import * as joyrideActions from '../Joyride/actions';
import {grey700, grey500, grey50} from 'material-ui/styles/colors';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import {Tabs, Tab} from 'material-ui/Tabs';
import Textarea from 'react-textarea-autosize';
import RaisedButton from 'material-ui/RaisedButton';

import TweetFeed from './Tweets/TweetFeed.react';
import MixedFeed from './MixedFeed/MixedFeedContainer.react';
import Headlines from './Headlines/Headlines.react';
import InstagramFeed from './Instagram/InstagramFeed.react';
import ContactEmails from './ContactEmails.react';
import ContactEmployerDescriptor from './ContactEmployerDescriptor.react';
import FeedsController from './FeedsController.react';
import ContactProfileDescriptions from './ContactProfileDescriptions.react';

const styles = {
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
};


class ContactProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEmployerPanelOpen: false,
      isPastEmployerPanelOpen: false,
      employerAutocompleteList: [],
      autoinput: '',
      tabContainerWidth: 800,
      firsttime: this.props.firstTimeUser
    };
    this.togglePanel = this._togglePanel.bind(this);
    this.updateAutoInput = this._updateAutoInput.bind(this);
    this.addPublicationToContact = this._addPublicationToContact.bind(this);
    window.onresize = _ => {
      const node = ReactDOM.findDOMNode(this.refs.tabs);
      if (node) {
        let containerWidth = node.offsetWidth;
        const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        if (screenWidth < containerWidth) containerWidth = screenWidth;
        this.setState({containerWidth});
      }
    };
  }

  componentWillMount() {
    this.props.fetchContact(this.props.contactId)
    .then(_ => {
      const {contact, employers, pastemployers} = this.props;
      if (contact.employers !== null) if (employers.length !== contact.employers) contact.employers
        .filter(pubId => !employers.some(obj => obj.id === pubId))
        .map(pubId => this.props.fetchPublication(pubId));
      if (contact.pastemployers !== null) if (pastemployers.length !== contact.pastemployers) contact.pastemployers
      .filter(pubId => !pastemployers.some(obj => obj.id === pubId))
      .map(pubId => this.props.fetchPublication(pubId));
      this.setState({notes: contact.notes});
    });
    this.props.fetchContactFeeds(this.props.contactId);
    this.props.fetchList(this.props.listId);
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.listDidInvalidate) window.location.href = window.location.origin + '/notfound';
    // if (nextProps.contactDidInvalidate) window.location.href = window.location.origin + '/notfound';
    const node = ReactDOM.findDOMNode(this.refs.tabs);
    if (node) {
      let containerWidth = node.offsetWidth;
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (screenWidth < containerWidth) containerWidth = screenWidth;
      this.setState({containerWidth});
    }
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _togglePanel(key) {
    switch (key) {
      case 'employers':
        this.setState({isEmployerPanelOpen: !this.state.isEmployerPanelOpen});
        break;
      case 'pastemployers':
        this.setState({isPastEmployerPanelOpen: !this.state.isPastEmployerPanelOpen});
        break;
      default:
      // do nothing
    }
  }

  _updateAutoInput(val) {
    this.setState({autoinput: val});
    setTimeout(_ => {
      this.props.searchPublications(this.state.autoinput)
      .then(response => this.setState({
        employerAutocompleteList: response,
      }));
    }, 500);
  }

  _addPublicationToContact() {
    this.props.createPublicationThenPatchContact(this.props.contact.id, this.state.autoinput);
  }

  render() {
    const state = this.state;
    const props = this.props;
    const addEmployerActions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={_ => {
          this.togglePanel('employers');
          this.setState({
            autoinput: '',
            employerAutocompleteList: []
          });
        }}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={_ => {
          props.createPublicationThenPatchContact(props.contact.id, state.autoinput, 'employers');
          this.togglePanel('employers');
        }}
      />,
    ];
    const addPastEmployerActions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={_ => {
          this.togglePanel('pastemployers');
          this.setState({
            autoinput: '',
            employerAutocompleteList: []
          });
        }}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={_ => {
          props.createPublicationThenPatchContact(props.contact.id, state.autoinput, 'pastemployers');
          this.togglePanel('pastemployers');
        }}
      />,
    ];
    return (
      <div className='row horizontal-center'>
        {
          props.firstTimeUser &&
          <Dialog open={state.firsttime} modal onRequestClose={_ => this.setState({firsttime: false})}>
            <p><span style={{fontWeight: 'bold'}}>Profile</span> is generated for every contact in <span style={{fontWeight: 'bold'}}>Table</span>.</p>
            <div className='horizontal-center' style={{margin: '10px 0'}}>
              <RaisedButton primary label='OK' onClick={_ => {
                this.setState({firsttime: false});
                if (props.showUploadGuide) {
                  hopscotch.startTour(Object.assign({}, tour, {
                    steps: [...tour.steps, {
                      title: 'Check out the Sample Table at Home',
                      content: 'Discover the full power of Tabulae when feeds are subscribed to on contacts. Check it out in the sample Table.',
                      target: 'breadcrumbs_hop',
                      placement: 'bottom'
                    }]
                  }));
                } else if (props.showGeneralGuide) {
                  hopscotch.startTour(Object.assign({}, tour, {
                    steps: [...tour.steps, {
                      title: 'That\'s it!',
                      content: 'Go back to Home and try it out by uploading one of your existing Excel sheets.',
                      target: 'breadcrumbs_hop',
                      placement: 'bottom'
                    }]
                  }));
                }
                props.removeFirstTimeUser();
              }}/>
            </div>
          </Dialog>
        }
        <div className='large-9 columns'>
          {props.contact && (
            <div className='row' style={{marginTop: 40}}>
              <ContactProfileDescriptions className='large-6 medium-12 small-12 columns' list={props.list} contact={props.contact} {...props} />
              <div className='large-6 medium-12 small-12 columns'>
                <div className='row'>
                  <div className='large-12 medium-12 small-12 columns'>
                    <h5>Notes</h5>
                  </div>
                  <div className='large-12 medium-12 small-12 columns'>
                    <Textarea
                    value={state.notes}
                    maxRows={7}
                    onChange={e => !props.contact.readonly && this.setState({notes: e.target.value})}
                    onBlur={_ => props.contact.notes !== state.notes ? !props.contact.readonly && props.patchContact(props.contactId, {notes: state.notes}) : null}
                    />
                    <span style={{color: grey500, margin: 5, fontSize: '0.7em', float: 'right'}}>{props.contact.notes !== state.notes ? 'Unsaved' : 'Saved'}</span>
                  </div>
                </div>
                <div className='large-12 medium-12 small-12 columns'>
                  <div className='row vertical-center' style={{marginTop: 20}}>
                    <h5>Current Publications/Employers</h5>
                    <IconButton
                    disabled={props.contact.readonly}
                    iconStyle={styles.smallIcon}
                    style={styles.small}
                    iconClassName='fa fa-plus'
                    tooltip='Add Publication'
                    tooltipPosition='top-right'
                    onClick={_ => this.togglePanel('employers')}
                    />
                  </div>
                  <div>
                    {props.employers && props.employers.map((employer, i) =>
                      <ContactEmployerDescriptor style={{margin: 4}} key={i} employer={employer} which='employers' contact={props.contact} />)}
                    {(props.employers.length === 0 || !props.employers) && <span>None added</span>}
                  </div>
                  <div style={{marginTop: 20}}>
                    <div className='row vertical-center'>
                    <div className='large-12 medium-12 small-12 columns'>
                    </div>
                      <h5>Past Publications/Employers</h5>
                      <IconButton
                      disabled={props.contact.readonly}
                      style={{marginLeft: 3}}
                      iconStyle={styles.smallIcon}
                      style={styles.small}
                      iconClassName='fa fa-plus'
                      tooltip='Add Publication'
                      tooltipPosition='top-right'
                      onClick={_ => this.togglePanel('pastemployers')}
                      />
                    </div>
                  </div>
                  <div>
                    {props.pastemployers && props.pastemployers.map((employer, i) =>
                      <ContactEmployerDescriptor style={{margin: 4}} key={i} employer={employer} which='pastemployers' contact={props.contact} />)}
                    {(props.pastemployers.length === 0 || !props.pastemployers) && <span>None added</span>}
                  </div>
                </div>
              </div>
            </div>
            )}
          <Dialog
          actions={state.isEmployerPanelOpen ? addEmployerActions : addPastEmployerActions}
          title={state.isEmployerPanelOpen ? 'Add Current Publication' : 'Add Past Publication'}
          modal
          open={state.isEmployerPanelOpen || state.isPastEmployerPanelOpen}
          onRequestClose={_ => state.isEmployerPanelOpen ? this.togglePanel('employers') : this.togglePanel('pastemployers')}>
            <AutoComplete
            floatingLabelText='Autocomplete Dropdown'
            filter={AutoComplete.noFilter}
            onUpdateInput={this.updateAutoInput}
            onNewRequest={autoinput => this.setState({autoinput})}
            openOnFocus
            dataSource={state.employerAutocompleteList}
            />
          </Dialog>
          <div className='large-12 columns' style={{marginLeft: 8, marginRight: 8, marginTop: 20}}>
            <FeedsController {...props} />
              <Tabs ref='tabs' tabItemContainerStyle={{backgroundColor: grey50}}>
                <Tab label='All' className='horizontal-center' style={{color: grey700}}>
                  <MixedFeed containerWidth={state.containerWidth} contactId={props.contactId} listId={props.listId} />
                </Tab>
                <Tab label='RSS only' style={{color: grey700, paddingLeft: 5, paddingRight: 5}}>
                  <Headlines refName='rss' containerWidth={state.containerWidth} contactId={props.contactId} listId={props.listId} />
                </Tab>
                <Tab label='Tweets only' style={{color: grey700, paddingLeft: 5, paddingRight: 5}}>
                  <TweetFeed refName='twitter' containerWidth={state.containerWidth} contactId={props.contactId} listId={props.listId} />
                </Tab>
                <Tab label='Instagram only' style={{color: grey700, paddingLeft: 5, paddingRight: 5}}>
                  <InstagramFeed refName='instagram' containerWidth={state.containerWidth} contactId={props.contactId} listId={props.listId} />
                </Tab>
                <Tab label='Sent Emails' style={{color: grey700, paddingLeft: 5, paddingRight: 5}}>
                  <ContactEmails refName='emails' containerWidth={state.containerWidth} contactId={props.contactId} listId={props.listId} />
                </Tab>
              </Tabs>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const listId = parseInt(props.params.listId, 10);
  const contactId = parseInt(props.params.contactId, 10);
  const contact = state.contactReducer[contactId];
  const employers = contact && contact.employers !== null && contact.employers
  .filter(pubId => state.publicationReducer[pubId])
  .map(pubId => state.publicationReducer[pubId]);
  const pastemployers = contact && contact.pastemployers !== null && contact.pastemployers
  .filter(pubId => state.publicationReducer[pubId])
  .map(pubId => state.publicationReducer[pubId]);
  return {
    listId,
    contactId,
    contact,
    employers,
    pastemployers,
    list: state.listReducer[listId],
    firstTimeUser: state.personReducer.firstTimeUser,
    showUploadGuide: state.joyrideReducer.showUploadGuide,
    showGeneralGuide: state.joyrideReducer.showGeneralGuide,
    listDidInvalidate: state.listReducer.didInvalidate,
    contactDidInvalidate: state.contactReducer.didInvalidate
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    fetchFeed: contactid => dispatch(headlineActions.fetchContactHeadlines(contactid)),
    fetchContact: contactid => dispatch(contactActions.fetchContact(contactid)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
    fetchContactFeeds: (contactId) => dispatch(feedActions.fetchContactFeeds(contactId)),
    fetchPublication: pubId => dispatch(AppActions.fetchPublication(pubId)),
    searchPublications: query => dispatch(AppActions.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, pubName, which) => dispatch(AppActions.createPublicationThenPatchContact(contactId, pubName, which)),
    fetchList: listId => dispatch(AppActions.fetchList(listId)),
    removeFirstTimeUser: _ => dispatch(AppActions.removeFirstTimeUser()),
    turnOnGeneralGuide: _ => dispatch(joyrideActions.turnOnGeneralGuide())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(ContactProfile));
