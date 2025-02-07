import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  bulletListMarker: '-',
  strongDelimiter: '**'
});

// Customize turndown rules
turndownService.addRule('preserveHtmlComments', {
  filter: function(node) {
    return node.nodeType === 8; // Comment node
  },
  replacement: function(content) {
    return '<!--' + content + '-->';
  }
});

// Add support for additional HTML elements
turndownService.addRule('divClass', {
  filter: function(node) {
    return node.nodeName === 'DIV' && node.hasAttribute('class');
  },
  replacement: function(content, node) {
    return '\n\n' + content + '\n\n';
  }
});

export const turndown = (html: string): string => {
  return turndownService.turndown(html);
}; 