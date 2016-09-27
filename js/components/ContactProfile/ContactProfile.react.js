import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import validator from 'validator';
import * as feedActions from './actions';
import * as AppActions from '../../actions/AppActions';
import * as headlineActions from './Headlines/actions';
import * as contactActions from '../../actions/contactActions';
import {grey100, grey50, grey700} from 'material-ui/styles/colors';

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';

import HeadlineItem from './Headlines/HeadlineItem.react';
import ContactEmployerDescriptor from './ContactEmployerDescriptor.react';

import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

import isEmail from 'validator/lib/isEmail';
import isURL from 'validator/lib/isURL';

const styles = {
  parent: {
    marginBottom: 10,
    borderRadius: '1.5em',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    ':hover': {
      backgroundColor: grey50
    }
  },
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

const ContactDescriptor = ({content, contentTitle, onClick, className}) => {
  return (
    <div className={className} style={{display: 'flex', alignItems: 'center'}}>
      <span>{content ? content : `${contentTitle} not filled`}</span>
      <IconButton
        style={{marginLeft: 3}}
        iconStyle={styles.smallIcon}
        style={styles.small}
        iconClassName={content ? 'fa fa-edit' : 'fa fa-plus'}
        tooltip={`Add ${contentTitle}`}
        tooltipPosition='top-right'
        onClick={_ => alertify.prompt(`Enter ${contentTitle}`, '', onClick, function() {})}
        />
  </div>
  );
};

const ContactProfileDescriptions = ({contact, patchContact, className}) => {
  return (
    <div className={className} style={{marginTop: 30}}>
      <div className='large-12 medium-12 small-12 columns'><h4>{contact.firstname} {contact.lastname}</h4></div>
      <ContactDescriptor className='large-12 medium-8 small-12 columns' content={contact.email} contentTitle='Email' onClick={(e, value) => isEmail(value) && patchContact(contact.id, {email: value})}/>
      <ContactDescriptor className='large-12 medium-8 small-12 columns' content={contact.blog} contentTitle='Blog' onClick={(e, value) => isURL(value) && patchContact(contact.id, {blog: value})}/>
      <ContactDescriptor className='large-12 medium-8 small-12 columns' content={contact.twitter} contentTitle='Twitter' onClick={(e, value) => isURL(value) && patchContact(contact.id, {twitter: value})}/>
      <ContactDescriptor className='large-12 medium-8 small-12 columns' content={contact.linkedin} contentTitle='LinkedIn' onClick={(e, value) => isURL(value) && patchContact(contact.id, {linkedin: value})}/>
      <ContactDescriptor className='large-12 medium-8 small-12 columns' content={contact.website} contentTitle='Website' onClick={(e, value) => isURL(value) && patchContact(contact.id, {website: value})}/>
    </div>);
};


class ContactProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRSSPanelOpen: false,
      isEmployerPanelOpen: false,
      feedUrl: '',
      employerAutocompleteList: [],
      autoinput: ''
    };
    this.togglePanel = this._togglePanel.bind(this);
    this.addFeedClick = this._addFeedClick.bind(this);
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
  }

  _addFeedClick() {
    const props = this.props;
    if (this.state.feedUrl.length === 0) return;
    props.addFeed(props.contactId, props.listId, this.state.feedUrl);
    this.togglePanel('rss');
  }

  _togglePanel(key) {
    switch (key) {
      case 'rss':
        this.setState({isRSSPanelOpen: !this.state.isRSSPanelOpen});
        break;
      case 'employers':
        this.setState({isEmployerPanelOpen: !this.state.isEmployerPanelOpen});
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
    console.log(this.state.autoinput);
    this.props.createPublicationThenPatchContact(this.props.contact.id, this.state.autoinput);
  }

  render() {
    const state = this.state;
    const props = this.props;
    const addFeedActions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={_ => this.togglePanel('rss')}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={this.addFeedClick}
      />,
    ];
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
          props.createPublicationThenPatchContact(props.contact.id, state.autoinput, 'pastemployers');
          this.togglePanel('employers');
        }}
      />,
    ];
    return (
      <div style={{marginTop: 20}}>
        {props.contact && (
          <div className='row'>
            <ContactProfileDescriptions className='large-7 medium-12 small-12 columns' contact={props.contact} {...props} />
            <div className='large-5 medium-12 small-12 columns'>
              <div>
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
                    <ContactEmployerDescriptor style={{margin: 2}} key={i} employer={employer} which='employers' contact={props.contact} />)}
                  {props.employers.length === 0 && <span>None added</span>}
                </div>
              </div>
              <div>
                <div className='row vertical-center'>
                  <h5>Past Publications/Employers</h5>
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
              </div>
              <div>
                {props.pastemployers && props.pastemployers.map((employer, i) =>
                  <ContactEmployerDescriptor key={i} employer={employer} which='pastemployers' contact={props.contact} />)}
                {props.pastemployers.length === 0 && <span>None added</span>}
              </div>
            </div>
          </div>
          )}
        <div>
          <Dialog actions={addFeedActions} title='New Author RSS Feed' modal open={state.isRSSPanelOpen} onRequestClose={_ => this.togglePanel('rss')}>
            <TextField
            value={state.feedUrl}
            hintText='Enter RSS Url here'
            errorText={validator.isURL(state.feedUrl) || state.feedUrl.length === 0 ? null : 'not valid URL'}
            onChange={e => this.setState({feedUrl: e.target.value})}
            />
          </Dialog>
          <Dialog actions={addEmployerActions} title='Add Current Publication' modal open={state.isEmployerPanelOpen} onRequestClose={_ => this.togglePanel('employers')}>
            <AutoComplete
            floatingLabelText='Autocomplete dropdown'
            filter={AutoComplete.noFilter}
            onUpdateInput={this.updateAutoInput}
            onNewRequest={autoinput => this.setState({autoinput})}
            openOnFocus
            dataSource={state.employerAutocompleteList}
            />
          </Dialog>
           <Dialog actions={addPastEmployerActions} title='Add Past Publication' modal open={state.isEmployerPanelOpen} onRequestClose={_ => this.togglePanel('employers')}>
            <AutoComplete
            floatingLabelText='Autocomplete dropdown'
            filter={AutoComplete.noFilter}
            onUpdateInput={this.updateAutoInput}
            onNewRequest={autoinput => this.setState({autoinput})}
            openOnFocus
            dataSource={state.employerAutocompleteList}
            />
          </Dialog>
          <div className='large-offset-10 medium-offset-8 small-12 columns' style={{marginTop: 20}}>
            <RaisedButton label='Add New RSS Feed' onClick={_ => this.togglePanel('rss')} labelStyle={{textTransform: 'none'}} />
          </div>
          <div className='large-12 medium-12 small-12 columns' style={{
            marginTop: 20,
            padding: 5,
            border: `solid 1px ${grey100}`}}>
            {props.headlines && props.headlines.map((headline, i) => <HeadlineItem key={i} {...headline} />)}
            {props.headlines
              && !props.headlineDidInvalidate
              && props.headlines.length === 0
              && <div className='row'><p>No RSS attached. Try clicking on "Add New RSS Feed" start seeing some headlines.</p></div>}
            {props.headlineDidInvalidate
              && <div className='row'><p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right Interm button to reach out and we'll try to resolve this for you.</p></div>}
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

  return {
    listId,
    contactId,
    headlines,
    contact,
    employers,
    pastemployers,
    headlineDidInvalidate: state.headlineReducer.didInvalidate
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addFeed: (contactid, listid, url) => dispatch(feedActions.addFeed(contactid, listid, url)),
    fetchFeed: contactid => dispatch(headlineActions.fetchContactHeadlines(contactid)),
    fetchContact: contactid => dispatch(contactActions.fetchContact(contactid)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
    fetchPublication: pubId => dispatch(AppActions.fetchPublication(pubId)),
    searchPublications: query => dispatch(AppActions.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, pubName, which) => dispatch(AppActions.createPublicationThenPatchContact(contactId, pubName, which))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ContactProfile);
