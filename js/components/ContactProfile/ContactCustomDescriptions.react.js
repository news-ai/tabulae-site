import React from 'react';
import {grey700} from 'material-ui/styles/colors';
import ContactDescriptor from './ContactDescriptor.react';

function ContactCustomDescriptions({contact, patchContact, list}) {
  return (
    <div style={{marginTop: 10, marginBottom: 20, marginLeft: 8}}>
      <h5>Custom Fields</h5>
      <div style={{marginLeft: 5}}>
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
    </div>);
}

export default ContactCustomDescriptions;