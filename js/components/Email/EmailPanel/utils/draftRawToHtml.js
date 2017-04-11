// @flow
import processInlineStylesAndEntities from './processInlineStylesAndEntities';

let blockTagMap = {
  'header-one':               ['<h1>','</h1>\n'],
  'header-two':               ['<h1>','</h1>\n'],
  'unstyled':                 ['<div>','</div>\n'],
  'code-block':               ['<pre><code>','</code></pre>\n'],
  'blockquote':               ['<blockquote>','</blockquote>\n'],
  'ordered-list-item':        ['<li>','</li>\n'],
  'unordered-list-item':      ['<li>','</li>\n'],
  'atomic':                   ['<figure>','</figure>\n'],
  // 'atomic':              ['<figure style="text-align:center">','</figure>\n'],
  'center-align':             ['<div style="text-align:center">','</div>\n'],
  'left-align':               ['<div>','</div>\n'],
  'right-align':              ['<div style="text-align:right">','</div>\n'],
  'justify-align':            ['<div style="text-align:justify">','</div>\n'],
  'default':                  ['<p>','</p>\n']
};

let inlineTagMap = {
  'BOLD': ['<strong>','</strong>'],
  'ITALIC': ['<em>','</em>'],
  'UNDERLINE': ['<u>','</u>'],
  'CODE': ['<code>','</code>'],
  'STRIKETHROUGH': ['<del>', '</del>'],
  'default': ['<span>','</span>'],
  // 'SIZE-5': ['<span style="font-size:5px">','</span>'],
  // 'SIZE-5.5': ['<span style="font-size:5.5px">','</span>'],
  // 'SIZE-6': ['<span style="font-size:6px">','</span>'],
  // 'SIZE-7.5': ['<span style="font-size:7.5px">','</span>'],
  // 'SIZE-8': ['<span style="font-size:8px">','</span>'],
  // 'SIZE-9': ['<span style="font-size:9px">','</span>'],
  // 'SIZE-10': ['<span style="font-size:10px">','</span>'],
  // 'SIZE-10.5': ['<span style="font-size:10.5px">','</span>'],
  // 'SIZE-11': ['<span style="font-size:11px">','</span>'],
  // 'SIZE-12': ['<span style="font-size:12px">','</span>'],
  // 'SIZE-14': ['<span style="font-size:14px">','</span>'],
  // 'SIZE-16': ['<span style="font-size:16px">','</span>'],
  // 'SIZE-18': ['<span style="font-size:18px">','</span>'],
  // 'SIZE-20': ['<span style="font-size:20px">','</span>'],
  // 'SIZE-22': ['<span style="font-size:202x">','</span>'],
  // 'SIZE-24': ['<span style="font-size:24px">','</span>'],
  // 'SIZE-26': ['<span style="font-size:26px">','</span>'],
  // 'SIZE-28': ['<span style="font-size:28px">','</span>'],
  // 'SIZE-36': ['<span style="font-size:36px">','</span>'],
  // 'SIZE-48': ['<span style="font-size:48px">','</span>'],
  // 'SIZE-72': ['<span style="font-size:72px">','</span>'],

  // 'Arial': ['<span style="font-family:Arial, &#39;Helvetica Neue&#39;, Helvetica, sans-serif">','</span>'],
  // 'Helvetica': ['<span style="font-family:&#39;Helvetica Neue&#39;, Helvetica, Arial, sans-serif">','</span>'],
  // 'Times New Roman': ['<span style="font-family:&#39;Times New Roman&#39;, Times, serif">','</span>'],
  // 'Courier New': ['<span style="font-family:&#39;Courier New&#39;, Courier, &#39;Lucida Sans Typewriter&#39;, &#39;Lucida Typewriter&#39;, monospace">','</span>'],
  // 'Courier': ['<span style="font-family:Courier">','</span>'],
  // 'Palatino': ['<span style="font-family:Palatino, &#39;Palatino Linotype&#39;, &#39;Palatino LT STD&#39;, &#39;Book Antiqua&#39;, Georgia, serif">','</span>'],
  // 'Garamond': ['<span style="font-family:Garamond, Baskerville, &#39;Baskerville Old Face&#39;, &#39;Hoefler Text&#39;, &#39;Times New Roman&#39;, serif">','</span>'],
  // 'Bookman': ['<span style="Bookman">','</span>'],

  // 'Avant Garde': {fontFamily: '"Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, AppleGothic, sans-serif'},
  // 'Verdana': {fontFamily: 'Verdana, Geneva, sans-serif'},
  // 'Tahoma': {fontFamily: 'Tahoma, Geneva, sans-serif'},
  // 'Impact': {fontFamily: 'Impact, Charcoal, sans-serif'},
  // 'Avenir': {fontFamily: '"Avenir Next", sans-serif'},

};

let combinableInlineTagMap = {
  'SIZE-5': ['font-size:5px;','span'],
  'Times New Roman': ['font-family:&#39;Times New Roman&#39;, Times, serif;', 'span'],
}

let entityTagMap = {
  'LINK': ['<a href="<%= url %>" target="_blank">', '</a>'],
  'IMAGE': [
    `<div style="text-align:<%= align %>">
      <a href="<%= imageLink %>" target="_blank">
        <img src="<%= src %>" style="max-height:<%= size %>;max-width:<%= size %>;">`,
        `</img>
      </a>
    </div>`],
};

let nestedTagMap = {
  'ordered-list-item': ['<ol>', '</ol>'],
  'unordered-list-item': ['<ul>', '</ul>']
};

export default function(raw: Object): string {
  let html = '';
  let nestLevel = [];
  let lastIndex = raw.blocks.length - 1;

  raw.blocks.forEach(function(block, index) {
    if (block.text.length === 0) {
      html += '<br>';
    } else {
       // close tag if not consecutive same nested
      if (nestLevel.length > 0 && nestLevel[0] !== block.type) {
        let type = nestLevel.shift();
        html += nestedTagMap[type][1] + '\n';
      }

      // open tag if nested
      if ( nestedTagMap[block.type] && nestLevel[0] !== block.type) {
        html += nestedTagMap[block.type][0] + '\n';
        nestLevel.unshift(block.type);
      }

      let blockTag = blockTagMap[block.type];

      html += blockTag ?
        blockTag[0] +
          processInlineStylesAndEntities(inlineTagMap, entityTagMap, raw.entityMap, block, combinableInlineTagMap) +
          blockTag[1] :
        blockTagMap['default'][0] +
          processInlineStylesAndEntities(inlineTagMap, block, combinableInlineTagMap) +
          blockTagMap['default'][1];
    }

    // close any unclosed blocks if we've processed all the blocks
    if (index === lastIndex && nestLevel.length > 0 ) {
      while(nestLevel.length > 0 ) {
        html += nestedTagMap[ nestLevel.shift() ][1];
      }
    }
  });
  return html;
}
