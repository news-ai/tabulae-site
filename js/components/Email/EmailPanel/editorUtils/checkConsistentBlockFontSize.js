import {SelectionState, Modifier, convertToRaw} from 'draft-js';
import toggleSingleInlineStyle from 'components/Email/EmailPanel/editorUtils/toggleSingleInlineStyle';

const DEFAULT_FONTSIZE = 'SIZE-10.5';
const FONT_PREFIX = 'SIZE-';

const checkConsistentBlockFontSize = oldContentState => {
  let contentState = oldContentState;
  contentState.getBlockMap().forEach((block, i) => {
    const countMap = {};
    block.getCharacterList().forEach((char, j) => {
      const fontsize = char.getStyle()
      .filter(fontsize => fontsize.substring(0, FONT_PREFIX.length) === FONT_PREFIX).first() || DEFAULT_FONTSIZE;
      console.log(fontsize);
      if (countMap[fontsize]) countMap[fontsize]++;
      else countMap[fontsize] = 1;
    });
    const maxUsedSize = Object.keys(countMap).reduce(({fontsize, count}, nextFontsize) =>
      countMap[nextFontsize] > count ? {fontsize: nextFontsize, count: countMap[nextFontsize]} : {fontsize, count},
      {fontsize: DEFAULT_FONTSIZE, count: 0}).fontsize;
    const seenSizes = {};
    let currSize = undefined;
    console.log(maxUsedSize);
    console.log(countMap);
    // deselect all font styles in the block
    Object.keys(countMap).map(fontsize => {
      contentState = Modifier.removeInlineStyle(
        contentState,
        SelectionState.createEmpty(block.getKey()).merge({focusOffset: 0, anchorOffset: block.getText().length}),
        fontsize
        );
      console.log(fontsize, convertToRaw(contentState));
    })
    // set SelectionState and untoggle maxUsedSize where it applies then retoggles maxUsedSize for the entire block
    contentState = Modifier.applyInlineStyle(
      contentState,
      SelectionState.createEmpty(block.getKey()).merge({focusOffset: 0, anchorOffset: block.getText().length}),
      maxUsedSize
      );
    console.log(convertToRaw(contentState));
    // editorState = toggleSingleInlineStyle(editorState, maxUsedSize, undefined, 'SIZE-');

  });
  return contentState;
};

export default checkConsistentBlockFontSize;