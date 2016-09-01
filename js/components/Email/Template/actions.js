import {
  templateConstant
} from './constants';
import * as api from '../../../actions/api';

import { normalize, Schema, arrayOf } from 'normalizr';
const templateSchema = new Schema('templates');

export function createTemplate(name, subject, body) {
  let templateBody = {};
  if (!name && !subject && !body) return;
  if (name) templateBody.name = name;
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

export function getTemplates() {
  return dispatch => {
    dispatch({type: templateConstant.REQUEST_MULTIPLE});
    return api.get(`/templates`)
    .then(response => {
      const res = normalize(response, {
        data: arrayOf(templateSchema),
      });
      return dispatch({
        type: templateConstant.RECEIVE_MULTIPLE,
        templates: res.entities.templates,
        ids: res.result.data
      });
    })
    .catch(message => dispatch({type: templateConstant.REQUEST_MULTIPLE_FAIL, message}));
  };
}
