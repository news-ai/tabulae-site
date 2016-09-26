import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import validator from 'validator';
import * as feedActions from './actions';
import * as headlineActions from './Headlines/actions';
import * as contactActions from '../../actions/contactActions';
import {grey100, grey50, grey700} from 'material-ui/styles/colors';

import HeadlineItem from './Headlines/HeadlineItem.react';

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

const ContactProfileDescriptions = ({contact, patchContact}) => {
  return (
    <div className='large-12 medium-12 small-12 columns'>
      <div className='large-12 medium-12 small-12 columns'><h4>{contact.firstname} {contact.lastname}</h4></div>
      <ContactDescriptor className='large-3 medium-4 small-12 columns' content={contact.email} contentTitle='Email' onClick={(e, value) => isEmail(value) && patchContact(contact.id, {email: value})}/>
      <ContactDescriptor className='large-3 medium-4 small-12 columns' content={contact.blog} contentTitle='Blog' onClick={(e, value) => isURL(value) && patchContact(contact.id, {blog: value})}/>
      <ContactDescriptor className='large-3 medium-4 small-12 columns' content={contact.twitter} contentTitle='Twitter' onClick={(e, value) => isURL(value) && patchContact(contact.id, {twitter: value})}/>
      <ContactDescriptor className='large-3 medium-4 small-12 columns' content={contact.linkedin} contentTitle='LinkedIn' onClick={(e, value) => isURL(value) && patchContact(contact.id, {linkedin: value})}/>
      <ContactDescriptor className='large-3 medium-4 small-12 columns' content={contact.website} contentTitle='Website' onClick={(e, value) => isURL(value) && patchContact(contact.id, {website: value})}/>
    </div>
      );
};


class ContactProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRssPanelOpen: false,
      feedUrl: ''
    };
    this.togglePanel = _ => this.setState({isRssPanelOpen: !this.state.isRssPanelOpen});
    this.addFeedClick = this._addFeedClick.bind(this);
  }

  componentWillMount() {
    this.props.fetchContact(this.props.contactId);
    this.props.fetchFeed(this.props.contactId);
  }

  _addFeedClick() {
    const props = this.props;
    if (this.state.feedUrl.length === 0) return;
    props.addFeed(props.contactId, props.listId, this.state.feedUrl);
    this.togglePanel();
  }

  render() {
    const state = this.state;
    const props = this.props;
    const actions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={this.togglePanel}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={this.addFeedClick}
      />,
    ];
    return (
      <div className='row' style={{marginTop: 20}}>
        {props.contact && <ContactProfileDescriptions contact={props.contact} />}
        <div>
          <Dialog actions={actions} title='New Author RSS Feed' modal open={state.isRssPanelOpen} onRequestClose={this.togglePanel}>
            <TextField
            value={state.feedUrl}
            hintText='Enter RSS Url here'
            errorText={validator.isURL(state.feedUrl) || state.feedUrl.length === 0 ? null : 'not valid URL'}
            onChange={e => this.setState({feedUrl: e.target.value})}
            />
          </Dialog>
          <div className='large-12 medium-12 small-12 columns' style={{marginTop: 20}}>
            <RaisedButton label='Add New RSS Feed' onClick={this.togglePanel} labelStyle={{textTransform: 'none'}} />
          </div>
          <div className='large-12 medium-12 small-12 columns' style={{
            marginTop: 20,
            padding: 5,
            border: `solid 1px ${grey100}`}}>
            {props.headlines && props.headlines.map((headline, i) => <HeadlineItem key={i} {...headline} />)}
            {props.headlines && !props.headlineDidInvalidate && props.headlines.length === 0 && <div className='row'><p>No RSS attached. Try clicking on "Add New RSS Feed" start seeing some headlines.</p></div>}
            {props.headlineDidInvalidate && <div className='row'><p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right Interm button to reach out and we'll try to resolve this for you.</p></div>}
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

  return {
    listId,
    contactId,
    headlines,
    contact,
    headlineDidInvalidate: state.headlineReducer.didInvalidate
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addFeed: (contactid, listid, url) => dispatch(feedActions.addFeed(contactid, listid, url)),
    fetchFeed: contactid => dispatch(headlineActions.fetchContactHeadlines(contactid)),
    fetchContact: contactid => dispatch(contactActions.fetchContact(contactid)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ContactProfile);
