import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import * as feedActions from './actions';
import * as AppActions from '../../actions/AppActions';
import * as headlineActions from './Headlines/actions';
import * as mixedFeedActions from './MixedFeed/actions';
import * as tweetActions from './Tweets/actions';
import * as contactActions from '../../actions/contactActions';
import {grey700, grey500, grey400, grey50} from 'material-ui/styles/colors';

import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import {Tabs, Tab} from 'material-ui/Tabs';

import HeadlineItem from './Headlines/HeadlineItem.react';
import ContactEmployerDescriptor from './ContactEmployerDescriptor.react';
import InfiniteScroll from '../InfiniteScroll';
import FeedsController from './FeedsController.react';
import ContactDescriptor from './ContactDescriptor.react';

import isEmail from 'validator/lib/isEmail';
import isURL from 'validator/lib/isURL';

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

const ContactProfileDescriptions = ({contact, patchContact, className, list}) => {
  return (
    <div className={className} style={{marginTop: 5}}>
      <h4 style={{marginLeft: 10}}>{contact.firstname} {contact.lastname}</h4>
      <ContactDescriptor iconClassName='fa fa-envelope' className='large-12 medium-8 small-12 columns' content={contact.email} contentTitle='Email' onClick={(e, value) => isEmail(value) && patchContact(contact.id, {email: value})}/>
      <ContactDescriptor iconClassName='fa fa-rss' className='large-12 medium-8 small-12 columns' content={contact.blog} contentTitle='Blog' onClick={(e, value) => isURL(value) && patchContact(contact.id, {blog: value})}/>
      <ContactDescriptor iconClassName='fa fa-twitter' className='large-12 medium-8 small-12 columns' content={contact.twitter} contentTitle='Twitter' onClick={(e, value) => patchContact(contact.id, {twitter: value})}/>
      <ContactDescriptor iconClassName='fa fa-instagram' className='large-12 medium-8 small-12 columns' content={contact.instagram} contentTitle='Instagram' onClick={(e, value) => patchContact(contact.id, {instagram: value})}/>
      <ContactDescriptor iconClassName='fa fa-linkedin' className='large-12 medium-8 small-12 columns' content={contact.linkedin} contentTitle='LinkedIn' onClick={(e, value) => isURL(value) && patchContact(contact.id, {linkedin: value})}/>
      <ContactDescriptor iconClassName='fa fa-external-link' className='large-12 medium-8 small-12 columns' content={contact.website} contentTitle='Website' onClick={(e, value) => isURL(value) && patchContact(contact.id, {website: value})}/>
      <div style={{marginTop: 10}}>
        <h5>Custom Fields</h5>
        <div>
        {list && contact && list.fieldsmap
          .filter(fieldObj => fieldObj.customfield)
          .map((fieldObj, i) => {
            const customValue = contact.customfields.find(customObj => customObj.name === fieldObj.value);
            return (
              <ContactDescriptor
              key={i}
              showTitle
              content={customValue && customValue.value}
              contentTitle={fieldObj.name}
              onClick={(e, value) => {
                let customfields;
                if (contact.customfields === null) {
                  customfields = [{name: fieldObj.value, value}];
                } else if (!contact.customfields.some(customObj => customObj.name === fieldObj.value)) {
                  customfields = [...contact.customfields, {name: fieldObj.value, value}];
                } else {
                  customfields = contact.customfields.map(customObj => {
                    if (customObj.name === fieldObj.value) return {name: fieldObj.value, value};
                    return customObj;
                  });
                }
                patchContact(contact.id, {customfields});
              }}
              />);
          })}
        </div>
      </div>
    </div>);
};

const tweetStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  marginTop: 10,
  marginBottom: 10,
  border: `dotted 1px ${grey400}`,
  borderRadius: '0.4em'
};

const Tweet = ({text, username}) => {
  return <div className='row' style={tweetStyle}>
    <div className='large-10 medium-9 small-8 columns'><span>{text}</span></div>
    <div className='large-2 medium-3 small-4 columns'><span style={{float: 'right'}}>{username}</span></div>
  </div>;
};


class ContactProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEmployerPanelOpen: false,
      isPastEmployerPanelOpen: false,
      employerAutocompleteList: [],
      autoinput: ''
    };
    this.togglePanel = this._togglePanel.bind(this);
    this.updateAutoInput = this._updateAutoInput.bind(this);
    this.addPublicationToContact = this._addPublicationToContact.bind(this);
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
    });
    this.props.fetchFeed(this.props.contactId);
    this.props.fetchContactFeeds(this.props.contactId);
    this.props.fetchContactTweets(this.props.contactId);
    this.props.fetchList(this.props.listId);
    this.props.fetchMixedFeed(this.props.contactId);
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
      <div>
        <IconButton
        style={{marginTop: 15, marginLeft: 20}}
        iconStyle={{color: grey500}}
        tooltip='back to List'
        onClick={_ => props.router.push(`/lists/${props.listId}`)}
        iconClassName='fa fa-arrow-left'/>
        <div className='row horizontal-center'>
          <div className='large-9 columns'>
            {props.contact && (
              <div className='row' style={{marginTop: 20}}>
                <ContactProfileDescriptions className='large-7 medium-12 small-12 columns' list={props.list} contact={props.contact} {...props} />
                <div className='large-5 medium-12 small-12 columns'>
                  <div style={{marginTop: 20}}>
                    <div className='row vertical-center'>
                      <h5>Current Publications/Employers</h5>
                      <IconButton
                        style={{marginLeft: 3}}
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
                  </div>
                  <div style={{marginTop: 20}}>
                    <div className='row vertical-center'>
                      <h5>Past Publications/Employers</h5>
                      <IconButton
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
              )}
            <Dialog
            actions={state.isEmployerPanelOpen ? addEmployerActions : addPastEmployerActions}
            title={state.isEmployerPanelOpen ? 'Add Current Publication' : 'Add Past Publication'}
            modal
            open={state.isEmployerPanelOpen || state.isPastEmployerPanelOpen}
            onRequestClose={_ => state.isEmployerPanelOpen ? this.togglePanel('employers') : this.togglePanel('pastemployers')}>
              <AutoComplete
              floatingLabelText='Autocomplete dropdown'
              filter={AutoComplete.noFilter}
              onUpdateInput={this.updateAutoInput}
              onNewRequest={autoinput => this.setState({autoinput})}
              openOnFocus
              dataSource={state.employerAutocompleteList}
              />
            </Dialog>
            <div style={{
              margin: 8,
              marginTop: 20
            }}>
              <FeedsController {...props} />
                <Tabs tabItemContainerStyle={{backgroundColor: grey50}}>
                  <Tab label='Tweets & RSS' style={{color: grey700}}>
                    <InfiniteScroll onScrollBottom={_ => props.fetchMixedFeed(props.contactId)}>
                      {props.mixedfeed && props.mixedfeed.map((obj, i) => obj.type === 'headlines' ?
                        <HeadlineItem key={i} {...obj} /> :
                        <Tweet key={i} {...obj} />)}
                    </InfiniteScroll>
                  </Tab>
                  <Tab label='RSS only' style={{color: grey700}}>
                    <InfiniteScroll onScrollBottom={_ => props.fetchFeed(props.contactId)}>
                      {props.headlines && props.headlines.map((headline, i) => <HeadlineItem key={i} {...headline} />)}
                      {props.headlines
                        && !props.headlineDidInvalidate
                        && props.headlines.length === 0
                        && <div className='row'><p>No RSS attached. Try clicking on "Settings" to start seeing some headlines.</p></div>}
                      {props.headlineDidInvalidate
                        && <div className='row'><p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right Interm button to reach out and we'll try to resolve this for you.</p></div>}
                    </InfiniteScroll>
                  </Tab>
                  <Tab label='Tweets only' style={{color: grey700}}>
                    <InfiniteScroll onScrollBottom={_ => props.fetchContactTweets(props.contactId)}>
                      {props.tweets && props.tweets.map((tweet, i) => <Tweet key={i} {...tweet} />)}
                    </InfiniteScroll>
                  </Tab>
                </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  const contactId = parseInt(props.params.contactId, 10);
  const headlines = state.headlineReducer[contactId]
  && state.headlineReducer[contactId].received
  && state.headlineReducer[contactId].received.map(id => state.headlineReducer[id]);
  const contact = state.contactReducer[contactId];
  const employers = contact && contact.employers !== null && contact.employers
  .filter(pubId => state.publicationReducer[pubId])
  .map(pubId => state.publicationReducer[pubId]);
  const pastemployers = contact && contact.pastemployers !== null && contact.pastemployers
  .filter(pubId => state.publicationReducer[pubId])
  .map(pubId => state.publicationReducer[pubId]);
  const tweets = state.tweetReducer[contactId]
  && state.tweetReducer[contactId].received
  && state.tweetReducer[contactId].received.map(id => state.tweetReducer[id]);

  return {
    listId,
    contactId,
    headlines,
    contact,
    employers,
    pastemployers,
    tweets,
    mixedfeed: state.mixedReducer[contactId] && state.mixedReducer[contactId].received,
    list: state.listReducer[listId],
    headlineDidInvalidate: state.headlineReducer.didInvalidate
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchFeed: contactid => dispatch(headlineActions.fetchContactHeadlines(contactid)),
    fetchContact: contactid => dispatch(contactActions.fetchContact(contactid)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
    fetchContactFeeds: (contactId) => dispatch(feedActions.fetchContactFeeds(contactId)),
    fetchPublication: pubId => dispatch(AppActions.fetchPublication(pubId)),
    searchPublications: query => dispatch(AppActions.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, pubName, which) => dispatch(AppActions.createPublicationThenPatchContact(contactId, pubName, which)),
    fetchList: listId => dispatch(AppActions.fetchList(listId)),
    fetchMixedFeed: contactId => dispatch(mixedFeedActions.fetchMixedFeed(contactId)),
    fetchContactTweets: contactId => dispatch(tweetActions.fetchContactTweets(contactId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(ContactProfile));
