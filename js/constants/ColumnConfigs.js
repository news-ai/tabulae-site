import validator from 'validator';
import Handsontable from 'handsontable/dist/handsontable.full';
import { multiselectRenderer } from 'constants/CustomRenderers';
import * as api from '../actions/api';
import * as publicationActions from '../actions/publicationActions';
import { dispatch } from 'redux';

function _onInvalid(value, callback, validate) {
  if (value.length === 0 || validate(value)) callback(true);
  else callback(false);
}

export const COLUMNS = [
  {
    data: 'selected',
    title: 'Selected',
    type: 'checkbox',
  },
  // {
  //   data: 'isoutdated',
  //   title: 'Update',
  // },
  {
    data: 'firstname',
    title: 'firstname',
    pass: true
  },
  {
    data: 'lastname',
    title: 'lastname',
    pass: true
  },
  {
    data: 'email',
    title: 'Email',
    validator: (value, callback) => _onInvalid(value, callback, validator.isEmail),
    allowInvalid: true,
    invalidCellClass: 'invalid-cell',
    pass: true
  },
  // {
  //   data: 'employerString',
  //   title: 'Publication(s)',
  //   strict: false,
  //   renderer: multiselectRenderer,
  //   pass: false
  // },
  {
    data: 'linkedin',
    title: 'LinkedIn',
    validator: (value, callback) => _onInvalid(value, callback, validator.isURL),
    allowInvalid: true,
    invalidCellClass: 'invalid-cell',
  },
  {
    data: 'twitter',
    title: 'Twitter',
    pass: true
  },
  {
    data: 'instagram',
    title: 'Instagram',
    pass: true
  },
  // {
  //   data: 'id',
  //   title: 'ID',
  //   pass: true
  // },
  // {
  //   data: 'parent',
  //   title: 'Parent'
  // }
];
