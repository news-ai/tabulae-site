import * as feedActions from 'components/ContactProfile/actions';
import * as contactActions from 'actions/contactActions';
import * as listActions from 'actions/listActions';
// move contactActions to another folder eventually
import isEmpty from 'lodash/isEmpty';
import differenceBy from 'lodash/differenceBy';

export function addContactsThenPatchList(rawContacts, list, origListId) {
  return (dispatch, getState) => {
    if (rawContacts.length === 0) return;
    const contacts = rawContacts.map(contact => {
      let obj = {listid: list.id};
      list.fieldsmap
      .filter(fieldObj => !fieldObj.customfield)
      .map(fieldObj => {
        if (!isEmpty(contact[fieldObj.value])) obj[fieldObj.value] = contact[fieldObj.value];
      });
      obj.customfields = contact.customfields;
      return obj;
    });

    return dispatch(contactActions.addContacts(contacts))
    .then(addedContacts => {
      // copy feeds over
      for (let i = 0; i < addedContacts.length; i++) {
        dispatch(feedActions.copyFeeds(rawContacts[i].id, addedContacts[i].id, list.id));
      }

      const oldList = getState().listReducer[origListId];
      const extraFields = differenceBy(oldList.fieldsmap, list.fieldsmap, 'value');

      const ids = addedContacts.map(contact => contact.id);
      // update list
      const listBody = {
        listId: list.id,
        name: list.name,
        contacts: list.contacts !== null ? [...list.contacts, ...ids] : ids,
        fieldsmap: list.fieldsmap.filter(fieldObj => !fieldObj.readonly).concat(extraFields)
      };
      return dispatch(listActions.patchList(listBody));
    });
  };
}
