import {
  SelectionState,
  AtomicBlockUtils,
  Modifier
} from 'draft-js';

const convertImageEntitiesToAtomicBlocks = oldContentState => {
  let contentState = oldContentState;
  contentState.getBlockMap().forEach((block, i) => {
    if (block.getType() === 'atomic' && block.getText() === 'a') {
      const targetRange = SelectionState.createEmpty(block.getKey()).merge({
        focusOffset: 0,
        anchorOffset: block.getLength()
      });
      contentState = Modifier.setBlockType(contentState, targetRange, 'unstyled');
      contentState = Modifier.replaceText(
        contentState,
        targetRange,
        ' ',
        null,
        block.getEntityAt(0)
        );
      contentState = Modifier.setBlockType(contentState, targetRange, 'atomic');
    }
  });
  return contentState;
};

export default convertImageEntitiesToAtomicBlocks;
