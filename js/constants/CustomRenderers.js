import Handsontable from 'handsontable/dist/handsontable.full';


function roundedCellStringHelper(value) {
  return '<div style="border:1px solid lightgray;border-radius:20px;text-align:center;margin:4px;padding-left:3px;padding-right:3px;"><span>' + value + '</span></div>';
}

export function multiselectRenderer(instance, td, row, col, prop, value, cellProperties) {
  const valueStr = Handsontable.helper.stringify(value);
  if (value === null || valueStr.length === 0) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    return td;
  }
  const htmlString = valueStr.split(',').map( value => roundedCellStringHelper(value)).join('');
  td.innerHTML = htmlString;
  return td;
}

export function outdatedRenderer(instance, td, row, col, prop, value, cellProperties) {
  // different default renderer for each row that is not text-only
  if (prop === 'selected') Handsontable.renderers.CheckboxRenderer.apply(this, arguments);
  else if (prop === 'employerString') {
    const valueStr = Handsontable.helper.stringify(value);
    if (value === null || valueStr.length === 0) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
    } else {
      const htmlString = valueStr.split(',').map( value => roundedCellStringHelper(value)).join('');
      td.innerHTML = htmlString;
    }
  }
  else Handsontable.renderers.TextRenderer.apply(this, arguments);

  td.style.backgroundColor = '#CEC';
  return td;
}
