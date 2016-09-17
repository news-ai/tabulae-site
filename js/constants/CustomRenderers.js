import Handsontable from 'handsontable/dist/handsontable.full';
import {yellow100, blue50} from 'material-ui/styles/colors';

export function hightlightRenderer(instance, td, row, col, prop, value, cellProperties) {
  if (prop === 'selected') Handsontable.renderers.CheckboxRenderer.apply(this, arguments);
  else Handsontable.renderers.TextRenderer.apply(this, arguments);
  if (instance.getDataAtRowProp(row, 'selected')) td.style.backgroundColor = blue50;
}


export function outdatedRenderer(instance, td, row, col, prop, value, cellProperties) {
  // different default renderer for each row that is not text-only
  if (prop === 'selected') Handsontable.renderers.CheckboxRenderer.apply(this, arguments);
  else Handsontable.renderers.TextRenderer.apply(this, arguments);

  td.style.backgroundColor = yellow100;
}
