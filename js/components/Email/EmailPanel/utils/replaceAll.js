import {_getter} from 'components/ListTable/helpers';
import template from 'lodash/template';

const reg= /(?:\{\{|<%=)(.+?)(?:%>|\}\})/g;
export default function replaceAll(html, contact, fieldsmap) {
  if (html === null || html.length === 0) return {html: '', numMatches: 0, emptyFields: []};
  let newHtml = html;
  let matchCount = {};
  let emptyFields = [];
  let expectedMatches = newHtml.match(reg);
  fieldsmap.map(fieldObj => {
    let value = '';
    const replaceValue = _getter(contact, fieldObj);
    if (replaceValue) value = replaceValue;
    const regexValue = new RegExp('<%= ' + fieldObj.name + ' %>', 'g');
    // count num custom vars used
    const matches = newHtml.match(regexValue);
    if (matches !== null) {
      if (!value) emptyFields.push(fieldObj.name);
      matchCount[fieldObj.name] = matches.length;
    }
    newHtml = newHtml.replace(regexValue, value);
    if (expectedMatches !== null) expectedMatches = expectedMatches.filter(match => match !== `{${fieldObj.name}}`);
  });
  const numMatches = Object.keys(matchCount).length;
  if (numMatches > 0) {
    window.Intercom('trackEvent', 'num_custom_variables', {num_custom_variables: Object.keys(matchCount).length});
    mixpanel.track('num_custom_variables', {num_custom_variables: Object.keys(matchCount).length});
  }
  if (expectedMatches !== null && expectedMatches.length > 0) emptyFields = [...emptyFields, ...expectedMatches];
  return {html: newHtml, numMatches, emptyFields};
}

