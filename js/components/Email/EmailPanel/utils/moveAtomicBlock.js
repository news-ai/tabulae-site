import {
  EditorState,
  Modifier
} from 'draft-js';
import moveBlockInContentState from './moveBlockInContentState';

export default function moveAtomicBlock(
    editorState: EditorState,
    atomicBlock: ContentBlock,
    targetRange: SelectionState,
    insertionMode?: DraftInsertionType
  ): EditorState {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    let withMovedAtomicBlock;

    if (insertionMode === 'before' || insertionMode === 'after') {
      const targetBlock = contentState.getBlockForKey(
        insertionMode === 'before' ?
          targetRange.getStartKey() :
          targetRange.getEndKey()
      );

      withMovedAtomicBlock = moveBlockInContentState(
        contentState,
        atomicBlock,
        targetBlock,
        insertionMode
      );
    } else {
      const afterRemoval = Modifier.removeRange(
        contentState,
        targetRange,
        'backward'
      );

      const selectionAfterRemoval = afterRemoval.getSelectionAfter();
      const targetBlock = afterRemoval.getBlockForKey(
        selectionAfterRemoval.getFocusKey()
      );

      if (selectionAfterRemoval.getStartOffset() === 0) {
        withMovedAtomicBlock = moveBlockInContentState(
          afterRemoval,
          atomicBlock,
          targetBlock,
          'before'
        );
      } else if (selectionAfterRemoval.getEndOffset() === targetBlock.getLength()) {
        withMovedAtomicBlock = moveBlockInContentState(
          afterRemoval,
          atomicBlock,
          targetBlock,
          'after'
        );
      } else {
        const afterSplit = Modifier.splitBlock(
          afterRemoval,
          selectionAfterRemoval
        );

        const selectionAfterSplit = afterSplit.getSelectionAfter();
        const targetBlock = afterSplit.getBlockForKey(
          selectionAfterSplit.getFocusKey()
        );

        withMovedAtomicBlock = moveBlockInContentState(
          afterSplit,
          atomicBlock,
          targetBlock,
          'before'
        );
      }
    }

    const newContent = withMovedAtomicBlock.merge({
      selectionBefore: selectionState,
      selectionAfter: withMovedAtomicBlock.getSelectionAfter().set('hasFocus', true),
    });

    return EditorState.push(editorState, newContent, 'move-block');
  }
