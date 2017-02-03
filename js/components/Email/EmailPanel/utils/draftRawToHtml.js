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
  'center-align':             ['<div style="text-align:center">','</div>\n'],
  'left-align':               ['<div>','</div>\n'],
  'right-align':              ['<div style="text-align:right">','</div>\n'],
  'default':                  ['<p>','</p>\n']
};

let inlineTagMap = {
  'BOLD': ['<strong>','</strong>'],
  'ITALIC': ['<em>','</em>'],
  'UNDERLINE': ['<u>','</u>'],
  'CODE': ['<code>','</code>'],
  'STRIKETHROUGH': ['<del>', '</del>'],
  'default': ['<span>','</span>']
};

let entityTagMap = {
  'LINK': ['<a href="<%= url %>" target="_blank">', '</a>'],
  'image': ['<a href="<%= imageLink %>" target="_blank"><img src="<%= src %>" style="max-height:<%= size %>;max-width:<%= size %>;">', '</img></a>'],
};

let nestedTagMap = {
  'ordered-list-item': ['<ol>', '</ol>'],
  'unordered-list-item': ['<ul>', '</ul>']
};

export default function(raw) {
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
          processInlineStylesAndEntities(inlineTagMap, entityTagMap, raw.entityMap, block) +
          blockTag[1] :
        blockTagMap['default'][0] +
          processInlineStylesAndEntities(inlineTagMap, block) +
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
