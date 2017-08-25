import {fontsizeMap} from '../utils/renderers';
import {SelectionState, Modifier} from 'draft-js';

const fontInlineStyles = Object.keys(fontsizeMap);

function applyDefaultFontSizeInlineStyle(contentState, defaultInlineStyle) {
  let newContentState = contentState;
  contentState.getBlockMap().forEach(block => {
    block.findStyleRanges(
        (character) => {
          const currentStyle = character.getStyle();
          return !fontInlineStyles.some(style => currentStyle.has(style));
        },
        (start, end) => {
          // console.log(start, end);
          const selection = SelectionState
          .createEmpty()
          .merge({
            anchorKey: block.getKey(),
            anchorOffset: start,
            focusKey: block.getKey(),
            focusOffset: end
          });
          newContentState = Modifier.applyInlineStyle(newContentState, selection, defaultInlineStyle);
        }
      );
  });
  return newContentState;
}

export default applyDefaultFontSizeInlineStyle;
