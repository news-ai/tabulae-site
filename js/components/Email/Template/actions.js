import {
  templateConstant
} from './constants';
import * as api from '../../../actions/api';

export function createTemplate(subject, body) {
  let templateBody = {};
  if (subject) templateBody.subject = subject;
  if (body) templateBody.body = body;
  return dispatch => {
    dispatch({type: templateConstant.REQUEST});
    return api.post(`/templates`, templateBody)
    .then(response => dispatch({type: templateConstant.RECEIVE, template: response.data}))
    .catch(message => dispatch({type: templateConstant.REQUEST_FAIL, message}));
  };
}

export function patchTemplate(templateId, subject, body) {
  let templateBody = {};
  if (subject) templateBody.subject = subject;
  if (body) templateBody.body = body;
  return dispatch => {
    dispatch({type: 'PATCH_TEMPLATE', templateId});
    return api.patch(`/templates/${templateId}`, templateBody)
    .then(response => dispatch({type: templateConstant.RECEIVE, template: response.data}))
    .catch(message => dispatch({type: 'PATCH_TEMPLATE_FAIL', message}));
  };
}

// export function getTemplates() {
//   return dispatch => {
    
//   }
// }
