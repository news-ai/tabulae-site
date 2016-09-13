import Handsontable from 'handsontable/dist/handsontable.full';
import {yellow100} from 'material-ui/styles/colors';

export function toCenterRenderer(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.CheckboxRenderer.apply(this, arguments);
  td.style.textAlign = 'center';
  return td;
}

export function outdatedRenderer(instance, td, row, col, prop, value, cellProperties) {
  // different default renderer for each row that is not text-only
  if (prop === 'selected') toCenterRenderer.apply(this, arguments);
  else Handsontable.renderers.TextRenderer.apply(this, arguments);

  td.style.backgroundColor = yellow100;
  return td;
}
