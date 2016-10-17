// helper function to add extra tableOnly columns like index, selected, etc.

export function generateTableFieldsmap(listData) {
  return [
    {
      name: '#',
      hidden: false,
      value: 'index',
      customfield: false,
      tableOnly: true
    },
    {
      name: 'Profile',
      hidden: false,
      value: 'profile',
      customfield: false,
      tableOnly: true
    },
    {
      name: 'Selected',
      hidden: false,
      value: 'selected',
      customfield: false,
      tableOnly: true
    },
    ...listData.fieldsmap
    .filter(fieldObj => !fieldObj.hidden)
    .map(fieldObj => Object.assign({}, fieldObj, {sortEnabled: true})),
    {
      customfield: false,
      name: 'Publication 1',
      value: 'publication_name_1',
      hidden: false
    },
    {
      customfield: false,
      name: 'Publication 2',
      value: 'publication_name_2',
      hidden: false
    }
  ];
}


export function measureSpanSize(txt, font) {
  const element = document.createElement('canvas');
  const context = element.getContext('2d');
  context.font = font;
  var tsize = {
    width: context.measureText(txt).width,
    height: parseInt(context.font)
  };
  return tsize;
}

export function escapeHtml(unsafe) {
  return unsafe
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
}

export function convertToCsvString(contacts, fieldsmap) {
  let base = 'data:text/csv;charset=utf-8,';
  const filteredfieldsmap = fieldsmap
  .filter(fieldObj => fieldObj.value !== 'selected' || fieldObj.data !== 'profile' || !fieldObj.hidden);
  base += filteredfieldsmap.map(fieldObj => fieldObj.name).toString() + '\n';
  contacts.map(contact => {
    let rowStringArray = [];
    filteredfieldsmap.map(fieldObj => {
      let el;
      if (fieldObj.customfield && contact.customfields !== null) {
        if (contact.customfields.some(obj => obj.name === fieldObj.value)) el = contact.customfields.find(obj => obj.name === fieldObj.value).value;
        else el = '';
      } else {
        el = contact[fieldObj.value];
      }
      if (typeof el === 'string') {
        if (el.split(',').length > 1) rowStringArray.push('\"' + escapeHtml(el) + '\"');
        else rowStringArray.push(escapeHtml(el));
      } else {
        rowStringArray.push('');
      }
    });
    base += rowStringArray.toString() + '\n';
  });
  return base;
}

export function exportOperations(contacts, fieldsmap, name) {
  const csvString = convertToCsvString(contacts, fieldsmap);
  const csvFile = encodeURI(csvString);
  const link = document.createElement('a');
  link.setAttribute('href', csvFile);
  link.setAttribute('download', name);
  link.click();
}
