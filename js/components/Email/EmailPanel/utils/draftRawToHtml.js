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
  // 'atomic':                   ['<figure>','</figure>\n'],
  'atomic':                   ['<figure style="margin: 0">','</figure>\n'],
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
};

let combinableInlineTagMap = {
  'SIZE-5': ['font-size:5px;', 'span'],
  'SIZE-5.5': ['font-size:5.5px">', 'span'],
  'SIZE-6': ['font-size:6px;', 'span'],
  'SIZE-7.5': ['font-size:7.5px;', 'span'],
  'SIZE-8': ['font-size:8px;', 'span'],
  'SIZE-9': ['font-size:9px;', 'span'],
  'SIZE-10': ['font-size:10px;', '</span>'],
  'SIZE-10.5': ['font-size:10.5px;', '</span>'],
  'SIZE-11': ['font-size:11px;', 'span'],
  'SIZE-12': ['font-size:12px;', 'span'],
  'SIZE-14': ['font-size:14px;', 'span'],
  'SIZE-16': ['font-size:16px;', 'span'],
  'SIZE-18': ['font-size:18px;', 'span'],
  'SIZE-20': ['font-size:20px;', 'span'],
  'SIZE-22': ['font-size:202x;', 'span'],
  'SIZE-24': ['font-size:24px;', 'span'],
  'SIZE-26': ['font-size:26px;', 'span'],
  'SIZE-28': ['font-size:28px;', 'span'],
  'SIZE-36': ['font-size:36px;', 'span'],
  'SIZE-48': ['font-size:48px;', 'span'],
  'SIZE-72': ['font-size:72px;', 'span'],

  'Arial': ['font-family:Arial, &#39;Helvetica Neue&#39;, Helvetica, sans-serif;', 'span'],
  'Helvetica': ['font-family:&#39;Helvetica Neue&#39;, Helvetica, Arial, sans-serif;', 'span'],
  'Times New Roman': ['font-family:&#39;Times New Roman&#39;, Times, serif;', 'span'],
  'Courier New': ['font-family:&#39;Courier New&#39;, Courier, &#39;Lucida Sans Typewriter&#39;, &#39;Lucida Typewriter&#39;, monospace;', 'span'],
  'Courier': ['font-family:Courier;">','</span>'],
  'Palatino': ['font-family:Palatino, &#39;Palatino Linotype&#39;, &#39;Palatino LT STD&#39;, &#39;Book Antiqua&#39;, Georgia, serif;', 'span'],
  'Garamond': ['font-family:Garamond, Baskerville, &#39;Baskerville Old Face&#39;, &#39;Hoefler Text&#39;, &#39;Times New Roman&#39;, serif;', 'span'],
  'Bookman': ['font-family:Bookman;', 'span'],
  'Avant Garde': ['font-family:&#39;Avant Garde&#39;, Avantgarde, &#39;Century Gothic&#39;, CenturyGothic, AppleGothic, sans-serif;', 'span'],
  'Verdana': ['font-family:Verdana, Geneva, sans-serif;', 'span'],
  'Tahoma': ['font-family:Tahoma, Geneva, sans-serif;', 'span'],
  'Impact': ['font-family:Impact, Charcoal, sans-serif;', 'span'],
  'Avenir': ['font-family:&#39;Avenir Next&#39;, sans-serif;', 'span'],
  'Nunito': ['font-family:Nunito;', 'span'],
}

let entityTagMap = {
  'LINK': {
    process: data => ['<a href="<%= url %>" target="_blank">', '</a>'],
  },
  'IMAGE': {
    default: [
      `<div style="text-align:<%= align %>">
        <img src="<%= src %>">`,
        `</img>
      </div>`
    ],
    process: data => {
      if (data.imageLink && data.imageLink !== '#') {
        return [
        `<div style="text-align:<%= align %>">
            <a href="<%= imageLink %>" target="_blank">
              <img src="<%= src %>">`,
              `</img>
            </a>
          </div>`];
      } else {
        return [
        `<div style="text-align:<%= align %>">
            <img src="<%= src %>">`,
            `</img>
          </div>`
        ];
      }
    } 
  }
}

let nestedTagMap = {
  'ordered-list-item': ['<ol>', '</ol>'],
  'unordered-list-item': ['<ul>', '</ul>']
};

const entityDataConversionMap = {
  IMAGE: data => {
    const size = parseInt(data.size.slice(0, -1), 10) / 100;
    return Object.assign({}, data, {
      src: data.size === '100%' ? data.src : `https://image1.newsai.org/${size.toFixed(2)}x/${data.src}`
    });
  }
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
          processInlineStylesAndEntities({inlineTagMap, entityTagMap, entityMap: raw.entityMap, block, combinableInlineTagMap, entityDataConversionMap}) +
          blockTag[1] :
        blockTagMap['default'][0] +
          processInlineStylesAndEntities({inlineTagMap, block, combinableInlineTagMap, entityDataConversionMap}) +
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
