// helper function to add extra tableOnly columns like index, selected, etc.
import find from 'lodash/find';

function divide(numerator, denomenator, fixedTo) {
  const res = Math.round(numerator * (1 / fixedTo) / denomenator) / (1 / fixedTo);
  if (!isNaN(res)) return res;
}

export function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// returns contact value for certain fieldObj
export function _getter(contact, fieldObj) {
  try {
    if (fieldObj.customfield) {
      if (fieldObj.readonly) return contact[fieldObj.value];
      if (contact.customfields === null) return undefined;
      else if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return undefined;
      else return find(contact.customfields, obj => obj.name === fieldObj.value).value;
    } else {
      if (fieldObj.strategy) return fieldObj.strategy(contact);
      else return contact[fieldObj.value];
    }
  } catch (e) {
    return undefined;
  }
}

function instagramLikesToPosts(listData) {
  const likesColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramlikes' && !fieldObj.hidden);
  const postsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramposts' && !fieldObj.hidden);
  if (likesColumn && postsColumn) {
    return {
      name: 'likes-to-posts',
      value: 'likes_to_posts',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when likes and posts are visible',
      strategy: contact =>
      contact.instagramlikes &&
      contact.instagramposts &&
      divide(contact.instagramlikes, contact.instagramposts, 0.001)
    };
  }
}

function instagramLikesToComments(listData) {
  const likesColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramlikes' && !fieldObj.hidden);
  const commentsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramcomments' && !fieldObj.hidden);
  if (likesColumn && commentsColumn) {
    return {
      name: 'likes-to-comments',
      value: 'likes_to_comments',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when likes and comments are visible',
      strategy: contact =>
      contact.instagramlikes &&
      contact.instagramcomments &&
      divide(contact.instagramlikes, contact.instagramcomments, 0.001)
    };
  }
}

function instagramLikesToFollowers(listData) {
  const likesColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramlikes' && !fieldObj.hidden);
  const followersColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramfollowers' && !fieldObj.hidden);
  if (likesColumn && followersColumn) {
    return {
      name: 'likes-to-followers',
      value: 'likes_to_followers',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when likes and followers are visible',
      strategy: contact =>
      contact.instagramlikes &&
      contact.instagramfollowers &&
      divide(contact.instagramlikes, contact.instagramfollowers, 0.001)
    };
  }
}

function instagramCommentsToFollowers(listData) {
  const commentsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramcomments' && !fieldObj.hidden);
  const followersColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramfollowers' && !fieldObj.hidden);
  if (commentsColumn && followersColumn) {
    return {
      name: 'comments-to-followers',
      value: 'comments_to_followers',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when comments and followers are visible',
      strategy: contact =>
      contact.instagramcomments &&
      contact.instagramlikes &&
      divide(contact.instagramcomments, contact.instagramlikes, 0.001)
    };
  }
}

function instagramCommentsToPosts(listData) {
  const commentsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramcomments' && !fieldObj.hidden);
  const postsColumn = find(listData.fieldsmap, fieldObj => fieldObj.value === 'instagramposts' && !fieldObj.hidden);
  if (commentsColumn && postsColumn) {
    return {
      name: 'comments-to-posts',
      value: 'comments_to_posts',
      hidden: false,
      tableOnly: true,
      hideCheckbox: true,
      customfield: false,
      sortEnabled: true,
      description: 'Auto-generated when comments and followers are visible',
      strategy: contact =>
      contact.instagramcomments &&
      contact.instagramposts &&
      divide(contact.instagramcomments, contact.instagramposts, 0.001)
    };
  }
}

function publicationColumn(listData) {
  return {
    customfield: false,
    name: 'Publication',
    value: 'publication_name_1',
    hidden: find(listData.fieldsmap, fieldObj => fieldObj.value === 'employers').hidden,
    sortEnabled: true,
    tableOnly: true,
    hideCheckbox: false,
    checkboxStrategy: (fieldsmap, checked) => fieldsmap.map(fieldObj => {
      if (fieldObj.value === 'publication_name_1' || fieldObj.value === 'employers') return Object.assign({}, fieldObj, {hidden: checked});
      return fieldObj;
    }),
    strategy: contact => contact.publication_name_1
  };
}

export function reformatFieldsmap(fieldsmap) {
  const formattedMap = fieldsmap
  .filter(fieldObj => !fieldObj.tableOnly)
  .map(fieldObj => {
    switch (fieldObj.value) {
      case 'publication_name_1':
        return {
          name: 'Employers',
          value: 'employers',
          hidden: fieldObj.hidden,
          customfield: fieldObj.customfield
        };
      default:
        return {
          name: fieldObj.name,
          value: fieldObj.value,
          hidden: fieldObj.hidden,
          customfield: fieldObj.customfield
        };
    }
  });
  return formattedMap;
}

export function transformFieldsmap(fieldsmap) {
  return fieldsmap.map(fieldObj => {
    switch (fieldObj.value) {
      case 'employers':
        return {
          customfield: false,
          name: 'Publication',
          value: 'publication_name_1',
          hidden: find(fieldsmap, fObj => fObj.value === 'employers').hidden,
          sortEnabled: true,
          hideCheckbox: false,
          checkboxStrategy: (fMap, checked) => fMap.map(fObj => {
            if (fObj.value === 'publication_name_1' || fObj.value === 'employers') return Object.assign({}, fObj, {hidden: checked});
            return fObj;
          }),
          strategy: contact => contact.publication_name_1
        };
      default:
        return fieldObj;
    }
  });
}

export function generateTableFieldsmap(listData) {
  const replacedNameMap = transformFieldsmap(listData.fieldsmap);
  const fieldsmap = [
    {
      name: '#',
      hidden: false,
      value: 'index',
      customfield: false,
      tableOnly: true,
      hideCheckbox: true,
    },
    {
      name: 'Profile',
      hidden: false,
      value: 'profile',
      customfield: false,
      tableOnly: true,
      hideCheckbox: true,
    },
    {
      name: 'Selected',
      hidden: false,
      value: 'selected',
      customfield: false,
      tableOnly: true,
      hideCheckbox: true,
    },
    ...replacedNameMap.map(fieldObj => Object.assign({}, fieldObj, {sortEnabled: true})),
    instagramLikesToComments(listData),
    instagramLikesToPosts(listData),
    instagramCommentsToPosts(listData),
    instagramLikesToFollowers(listData),
    instagramCommentsToFollowers(listData),
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
  .filter(fieldObj => !fieldObj.hidden && !fieldObj.tableOnly);
  base += filteredfieldsmap.map(fieldObj => fieldObj.name).toString() + '\n';
  contacts.map(contact => {
    let rowStringArray = [];
    filteredfieldsmap.map(fieldObj => {
      let el;
      if (fieldObj.customfield && contact.customfields !== null) {
        if (contact.customfields.some(obj => obj.name === fieldObj.value)) el = find(contact.customfields, obj => obj.name === fieldObj.value).value;
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
