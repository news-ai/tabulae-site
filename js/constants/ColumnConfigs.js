import validator from 'validator';
import Handsontable from 'handsontable/dist/handsontable.full';

function _onInvalid(value, callback, validate) {
  if (value.length === 0 || validate(value)) callback(true);
  else callback(false);
}

function outdatedRenderer(instance, td, row, col, prop, value, cellProperties) {
  // different default renderer for each row that is not text-only
  if (col === 0) Handsontable.renderers.CheckboxRenderer.apply(this, arguments);
  else Handsontable.renderers.TextRenderer.apply(this, arguments);
  td.style.backgroundColor = '#CEC';
  return td;
}

function multiselectRenderer(instance, td, row, col, prop, value, cellProperties) {
  let valueStr = Handsontable.helper.stringify(value);
  if (value === null) return td;
  let valueArray = valueStr.split(',');
  let htmlString = valueArray.map( value =>
    '<div style="border:1px solid lightgray;border-radius:25px;text-align:center;margin:4px;padding:3px;"><span>' + value + '</span></div>'
    ).join('');
  td.innerHTML = htmlString;
  return td;
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
    title: 'First Name',
    pass: true
  },
  {
    data: 'lastname',
    title: 'Last Name',
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
  {
    data: 'employerString',
    title: 'Employer(s)',
    strict: false,
    renderer: multiselectRenderer
  },
  {
    data: 'linkedin',
    title: 'LinkedIn',
    validator: (value, callback) => _onInvalid(value, callback, validator.isURL),
    allowInvalid: true,
    invalidCellClass: 'invalid-cell',
    pass: true
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
  {
    data: 'id',
    title: 'ID',
    pass: true
  },
  {
    data: 'parent',
    title: 'Parent'
  }
];