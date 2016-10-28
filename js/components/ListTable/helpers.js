// helper function to add extra tableOnly columns like index, selected, etc.

function divideTwoDecimal(numerator, denomenator) {
  const res = Math.round(numerator * 1000.0 / denomenator) / 1000;
  if (!isNaN(res)) return res;
}

function instagramLikesToComments(listData) {
  const likesColumn = listData.fieldsmap.find(fieldObj => fieldObj.value === 'instagramlikes' && !fieldObj.hidden);
  const commentsColumn = listData.fieldsmap.find(fieldObj => fieldObj.value === 'instagramcomments' && !fieldObj.hidden);
  if (likesColumn && commentsColumn) {
    return {
      name: 'likes-to-comments',
      value: 'likes_to_comments',
      hidden: false,
      tableOnly: true,
      customfield: false,
      sortEnabled: true,
      comment: 'Auto-generated when likes and comments are visible',
      strategy: contact => contact.instagramlikes && contact.instagramcomments && divideTwoDecimal(contact.instagramlikes, contact.instagramcomments)
    };
  }
}

function instagramLikesToFollowers(listData) {
  const likesColumn = listData.fieldsmap.find(fieldObj => fieldObj.value === 'instagramlikes' && !fieldObj.hidden);
  const followersColumn = listData.fieldsmap.find(fieldObj => fieldObj.value === 'instagramfollowers' && !fieldObj.hidden);
  if (likesColumn && followersColumn) {
    return {
      name: 'likes-to-followers',
      value: 'likes_to_followers',
      hidden: false,
      tableOnly: true,
      customfield: false,
      sortEnabled: true,
      comment: 'Auto-generated when likes and followers are not hidden',
      strategy: contact => contact.instagramlikes && contact.instagramfollowers && divideTwoDecimal(contact.instagramlikes, contact.instagramfollowers)
    };
  }
}

function instagramCommentsToFollowers(listData) {
  const commentsColumn = listData.fieldsmap.find(fieldObj => fieldObj.value === 'instagramcomments' && !fieldObj.hidden);
  const followersColumn = listData.fieldsmap.find(fieldObj => fieldObj.value === 'instagramfollowers' && !fieldObj.hidden);
  if (commentsColumn && followersColumn) {
    return {
      name: 'comments-to-followers',
      value: 'comments_to_followers',
      hidden: false,
      tableOnly: true,
      customfield: false,
      sortEnabled: true,
      comment: 'Auto-generated when comments and followers are not hidden',
      strategy: contact => contact.instagramcomments && contact.instagramlikes && divideTwoDecimal(contact.instagramcomments, contact.instagramlikes)
    };
  }
}


export function generateTableFieldsmap(listData) {
  const fieldsmap = [
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
    .map(fieldObj => Object.assign({}, fieldObj, {sortEnabled: true})),
    instagramLikesToComments(listData),
    instagramLikesToFollowers(listData),
    instagramCommentsToFollowers(listData),
    {
      customfield: false,
      name: 'Publication',
      value: 'publication_name_1',
      hidden: false,
      sortEnabled: true,
      tableOnly: true
    },
  ];
  return fieldsmap.filter(fieldObj => fieldObj);
}


export function measureSpanSize(txt, font) {
  const element = document.createElement('canvas');
  const context = element.getContext('2d');
  context.font = font;
  var tsize = {
    width: context.measureText(txt).width + 23,
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
