import {EditorState, SelectionState, Modifier} from 'draft-js';

const applyFontSize = (editorState, selectedSize) => {
  const FONT_PREFIX = 'SIZE-';
  let contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const anchorKey = selection.getIsBackward() ? selection.getFocusKey() : selection.getAnchorKey();
  const focusKey = selection.getIsBackward() ? selection.getAnchorKey() : selection.getFocusKey();
  const selectionStart = selection.getStartOffset();
  const selectionEnd = selection.getEndOffset();
  let selectedBlocks = [];
  let inBlock = false;
  editorState.getCurrentContent().getBlockMap().forEach(block => {
    if (block.getKey() === anchorKey) inBlock = true;
    if (inBlock) selectedBlocks.push(block);
    if (block.getKey() === focusKey) inBlock = false;
  });
  selectedBlocks.map((block, i) => {
    const blockKey = block.getKey();

    // DESELECT ALL SELECTED WITH FONTSIZE
    let font = undefined;
    block.findStyleRanges(
      char => {
        const charFont = char.getStyle().toJS().filter(font => font.substring(0, FONT_PREFIX.length) === FONT_PREFIX)[0];
        font = charFont;
        if (charFont) return true;
        return false;
      },
      (styleStart, styleEnd) => {
        if (selection.hasEdgeWithin(blockKey, styleStart, styleEnd)) {
          let start = styleStart;
          let end = styleEnd;
          if (anchorKey === blockKey) start = selectionStart;
          if (focusKey === blockKey) end = selectionEnd;

          contentState = Modifier.removeInlineStyle(
            contentState,
            SelectionState.createEmpty().merge({
              anchorKey: blockKey,
              focusKey: blockKey,
              anchorOffset: start,
              focusOffset: end
            }),
            font
            )
        }
      });
  });
   // // APPLY SELECTED SIZE TO CLEANED SELECTED REGION
  contentState = Modifier.applyInlineStyle(
    contentState,
    selection,
    selectedSize
    );
  // console.log(selectedSize);
  editorState = EditorState.push(
    editorState,
    contentState,
    'change-inline-style'
  );
  return editorState;
};

export default applyFontSize;
