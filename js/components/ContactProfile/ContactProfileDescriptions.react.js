import React from 'react';

import {grey700} from 'material-ui/styles/colors';
import isEmail from 'validator/lib/isEmail';
import isURL from 'validator/lib/isURL';
import ContactDescriptor from './ContactDescriptor.react';
import IconButton from 'material-ui/IconButton';
import ContactCustomDescriptions from './ContactCustomDescriptions.react';
import TwitterProfile from './SocialProfiles/Twitter/TwitterProfile.react';
import InstagramProfile from './SocialProfiles/Instagram/InstagramProfile.react';
import {ToggleableEditInputHOC, ToggleableEditInput} from '../ToggleableEditInput';

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

const WrappedTwitter = props => {
  return (
     <TwitterProfile {...props}>
      {({onRequestOpen}) => (
        <IconButton
        iconStyle={styles.smallIcon}
        style={styles.small}
        iconClassName='fa fa-line-chart'
        tooltip='Show Profile & Engagement Data'
        tooltipPosition='top-right'
        onClick={onRequestOpen}
        />)}
      </TwitterProfile>
    );
};

const WrappedInstagram = props => {
  return (
     <InstagramProfile {...props}>
      {({onRequestOpen}) => (
        <IconButton
        iconStyle={styles.smallIcon}
        style={styles.small}
        iconClassName='fa fa-line-chart'
        tooltip='Show Profile & Engagement Data'
        tooltipPosition='top-right'
        onClick={onRequestOpen}
        />)}
      </InstagramProfile>
    );
};

const ControlledInput = props => {
  return (
    <ToggleableEditInputHOC {...props}>
      {({onToggleTitleEdit, isTitleEditing, name, onUpdateName}) =>
      <ToggleableEditInput
        onToggleTitleEdit={onToggleTitleEdit}
        isTitleEditing={isTitleEditing}
        name={name}
        onUpdateName={onUpdateName}
        nameStyle={props.nameStyle}
        />}
    </ToggleableEditInputHOC>);
};

const contactDescriptorClassname = 'large-12 medium-8 small-12 columns';

function ContactProfileDescriptions({contact, patchContact, className, list}) {
  let instagramErrorText = null;
  if (contact.instagraminvalid) instagramErrorText = 'Invalid Instagram handle';
  else if (contact.instagramprivate) instagramErrorText = 'Instagram is private';

  let twitterErrorText = null;
  if (contact.twitterinvalid) twitterErrorText = 'Invalid Twitter handle';
  else if (contact.twitterprivate) twitterErrorText = 'Twitter is private';

  return (
    <div className={className} style={{marginTop: 5}}>
      <div className='row' style={{margin: '5px 0'}}>
        <div className='large-12 medium-12 small-12 columns'>
          <ControlledInput
          nameStyle={{fontSize: '1.3em'}}
          name={`${contact.firstname} ${contact.lastname}`}
          onBlur={val => {
            if (val === `${contact.firstname} ${contact.lastname}`) return;
            const fullname = val.split(' ');
            const firstname = fullname[0];
            const lastname = fullname.filter((name, i) => i > 0).join(' ');
            patchContact(contact.id, {firstname, lastname});
          }}/>
        </div>
      </div>
      <ContactDescriptor
      iconClassName='fa fa-envelope'
      className={contactDescriptorClassname}
      content={contact.email}
      contentTitle='Email'
      onClick={(e, value) => isEmail(value) && patchContact(contact.id, {email: value})}/>
      <ContactDescriptor
      iconClassName='fa fa-rss'
      className={contactDescriptorClassname}
      content={contact.blog}
      contentTitle='Blog'
      onClick={(e, value) => isURL(value) && patchContact(contact.id, {blog: value})}/>
      <ContactDescriptor
      iconClassName='fa fa-twitter'
      className={contactDescriptorClassname}
      errorText={twitterErrorText}
      content={contact.twitter}
      contentTitle='Twitter'
      onClick={(e, value) => patchContact(contact.id, {twitter: value}).then(_ => window.location.reload())}
      extraIcons={contact.twitter && [
        <WrappedTwitter key={0} contactId={contact.id} />
        ]}
      />
      <ContactDescriptor
      iconClassName='fa fa-instagram'
      className={contactDescriptorClassname}
      errorText={instagramErrorText}
      content={contact.instagram}
      contentTitle='Instagram'
      onClick={(e, value) => patchContact(contact.id, {instagram: value}).then(_ => window.location.reload())}
      extraIcons={contact.instagram && [
        <WrappedInstagram key={0} contactId={contact.id} />
        ]}
      />
      <ContactDescriptor
      iconClassName='fa fa-linkedin'
      className={contactDescriptorClassname}
      content={contact.linkedin}
      contentTitle='LinkedIn'
      onClick={(e, value) => isURL(value) && patchContact(contact.id, {linkedin: value})}/>
      <ContactDescriptor
      iconClassName='fa fa-external-link'
      className={contactDescriptorClassname}
      content={contact.website}
      contentTitle='Website'
      onClick={(e, value) => isURL(value) && patchContact(contact.id, {website: value})}
      />
      <ContactCustomDescriptions contact={contact} patchContact={patchContact} list={list} />
    </div>);
}

export default ContactProfileDescriptions;
