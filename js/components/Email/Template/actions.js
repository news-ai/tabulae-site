import {
  templateConstant
} from './constants';
import * as api from '../../../actions/api';

import { normalize, Schema, arrayOf } from 'normalizr';
const templateSchema = new Schema('templates');

export function createTemplate(name, subject, body) {
  let templateBody = {};
  if (name.length > 0) templateBody.name = name;
  else templateBody.name = 'untitled template name';
  if (subject.length > 0) templateBody.subject = subject;
  else templateBody.subject = 'untitled subject line';
  if (body.length > 0) templateBody.body = body;
  else templateBody.body = '';
  return dispatch => {
    dispatch({type: templateConstant.CREATE_REQUEST});
    return api.post(`/templates`, templateBody)
    .then(response => {
      const res = normalize(response.data, templateSchema);
      dispatch({type: templateConstant.CREATE_RECEIVED, template: res.entities.templates, id: res.result});
      return res.result;
    })
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
    .then(response => {
      const res = normalize(response.data, templateSchema);
      return dispatch({type: templateConstant.RECEIVE, template: res.entities.templates, id: res.result});
    })
    .catch(message => dispatch({type: 'PATCH_TEMPLATE_FAIL', message}));
  };
}

export function toggleArchiveTemplate(templateId) {
  return (dispatch, getState) => {
    const template = getState().templateReducer[templateId];
    template.archived = !template.archived;
    dispatch({type: 'TEMPLATE_TOGGLE_ARCHIVE', templateId});
    return api.patch(`/templates/${templateId}`, template)
    .then(response => {
      const res = normalize(response.data, templateSchema);
      return dispatch({type: templateConstant.RECEIVE, template: res.entities.templates, id: res.result});
    })
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
