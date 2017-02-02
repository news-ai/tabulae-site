import {Entity} from 'draft-js';

export function findEntities(entityType, contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === entityType
      );
    },
    callback
  );
}

const CURLY_REGEX = /{([^}]+)}/g;

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

export function curlyStrategy(contentBlock, callback) {
  findWithRegex(CURLY_REGEX, contentBlock, callback);
}
