import find from 'lodash/find';
import {FONTSIZE_TYPES} from 'components/Email/EmailPanel/utils/typeConstants';
import tinycolor from 'tinycolor2';
export const htmlToBlock = (nodeName, node) => {
  if (nodeName === 'figure') return;
  if (nodeName === 'p' || nodeName === 'div') {
    if (node.style.textAlign === 'center') {
      return {
        type: 'center-align',
        data: {}
      };
    } else if (node.style.textAlign === 'right') {
      return {
        type: 'right-align',
        data: {}
      };
    } else if (node.style.textAlign === 'justify') {
      return {
        type: 'justify-align',
        data: {}
      };
    } else {
      return {
        type: 'unstyled',
        data: {}
      };
    }
  }
};

export const htmlToStyle = (nodeName, node, currentStyle) => {
  let newStyle = currentStyle;
  if (nodeName === 'span') {
    if (!!node.style.fontSize) {
      const fontSize = node.style.fontSize.substring(0, node.style.fontSize.length - 2);
      const foundType = find(FONTSIZE_TYPES, type => type.label === fontSize);
      if (foundType) newStyle = newStyle.add(foundType.style);
    }

    if (!!node.style.color) {
      const color = tinycolor(node.style.color);
      if (color.isValid()) {
        newStyle = newStyle.add(`COLOR-${color.toHexString()}`);
      }
    }

    return newStyle;
  } else {
    return currentStyle;
  }
};


