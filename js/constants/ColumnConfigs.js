import validator from 'validator';
import Handsontable from 'handsontable/dist/handsontable.full';
import { multiselectRenderer } from 'constants/CustomRenderers';

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
  },
  {
    data: 'lastname',
    title: 'lastname',
  },
  {
    data: 'email',
    title: 'Email',
    validator: (value, callback) => _onInvalid(value, callback, validator.isEmail),
    allowInvalid: true,
    invalidCellClass: 'invalid-cell',
  },
  {
    data: 'employerString',
    title: 'Employer(s)',
    strict: false,
    renderer: multiselectRenderer,
  },
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
  },
  {
    data: 'instagram',
    title: 'Instagram',
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
