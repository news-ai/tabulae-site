import React from 'react';
import {grey700} from 'material-ui/styles/colors';

import isEmail from 'validator/lib/isEmail';
import isURL from 'validator/lib/isURL';
import ContactDescriptor from './ContactDescriptor.react';

function ContactProfileDescriptions({contact, patchContact, className, list}) {
  let instagramErrorText = null;
  if (contact.instagraminvalid) instagramErrorText = 'Invalid Instagram handle';
  else if (contact.instagramprivate) instagramErrorText = 'Instagram is private';

  let twitterErrorText = null;
  if (contact.twitterinvalid) twitterErrorText = 'Invalid Twitter handle';
  else if (contact.twitterprivate) twitterErrorText = 'Twitter is private';

  return (
    <div className={className} style={{marginTop: 5}}>
      <h4 style={{marginLeft: 10}}>{contact.firstname} {contact.lastname}</h4>
      <ContactDescriptor
      iconClassName='fa fa-envelope'
      className='large-12 medium-8 small-12 columns'
      content={contact.email}
      contentTitle='Email'
      onClick={(e, value) => isEmail(value) && patchContact(contact.id, {email: value})}/>
      <ContactDescriptor
      iconClassName='fa fa-rss'
      className='large-12 medium-8 small-12 columns'
      content={contact.blog}
      contentTitle='Blog'
      onClick={(e, value) => isURL(value) && patchContact(contact.id, {blog: value})}/>
      <ContactDescriptor
      iconClassName='fa fa-twitter'
      className='large-12 medium-8 small-12 columns'
      errorText={twitterErrorText}
      content={contact.twitter}
      contentTitle='Twitter'
      onClick={(e, value) => patchContact(contact.id, {twitter: value})}/>
      <ContactDescriptor
      iconClassName='fa fa-instagram'
      className='large-12 medium-8 small-12 columns'
      errorText={instagramErrorText}
      content={contact.instagram}
      contentTitle='Instagram'
      onClick={(e, value) => patchContact(contact.id, {instagram: value})}/>
      <ContactDescriptor
      iconClassName='fa fa-linkedin'
      className='large-12 medium-8 small-12 columns'
      content={contact.linkedin}
      contentTitle='LinkedIn'
      onClick={(e, value) => isURL(value) && patchContact(contact.id, {linkedin: value})}/>
      <ContactDescriptor
      iconClassName='fa fa-external-link'
      className='large-12 medium-8 small-12 columns'
      content={contact.website}
      contentTitle='Website'
      onClick={(e, value) => isURL(value) && patchContact(contact.id, {website: value})}/>
      <div style={{marginTop: 10, marginBottom: 30}}>
        <h5>Custom Fields</h5>
        <div>
        {list && contact && contact.customfields !== null ? list.fieldsmap
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
          }) : <span style={{fontSize: '0.9em', color: grey700}}>There are no custom fields. You can generate them as custom columns in Sheet.</span>}
        </div>
      </div>
    </div>);
}

export default ContactProfileDescriptions;
