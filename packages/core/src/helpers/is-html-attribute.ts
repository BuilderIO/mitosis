export const htmlElementAttributes: { [key: string]: string[] } = {
  '*': [
    'accesskey',
    'autocapitalize',
    'autofocus',
    'class',
    'contenteditable',
    'dir',
    'draggable',
    'enterkeyhint',
    'hidden',
    'id',
    'inputmode',
    'is',
    'itemid',
    'itemprop',
    'itemref',
    'itemscope',
    'itemtype',
    'lang',
    'nonce',
    'slot',
    'spellcheck',
    'style',
    'tabindex',
    'title',
    'translate',
  ],
  a: [
    'charset',
    'coords',
    'download',
    'href',
    'hreflang',
    'name',
    'ping',
    'referrerpolicy',
    'rel',
    'rev',
    'shape',
    'target',
    'type',
  ],
  applet: [
    'align',
    'alt',
    'archive',
    'code',
    'codebase',
    'height',
    'hspace',
    'name',
    'object',
    'vspace',
    'width',
  ],
  area: [
    'alt',
    'coords',
    'download',
    'href',
    'hreflang',
    'nohref',
    'ping',
    'referrerpolicy',
    'rel',
    'shape',
    'target',
    'type',
  ],
  audio: [
    'autoplay',
    'controls',
    'crossorigin',
    'loop',
    'muted',
    'preload',
    'src',
  ],
  base: ['href', 'target'],
  basefont: ['color', 'face', 'size'],
  blockquote: ['cite'],
  body: ['alink', 'background', 'bgcolor', 'link', 'text', 'vlink'],
  br: ['clear'],
  button: [
    'disabled',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'name',
    'type',
    'value',
  ],
  canvas: ['height', 'width'],
  caption: ['align'],
  col: ['align', 'char', 'charoff', 'span', 'valign', 'width'],
  colgroup: ['align', 'char', 'charoff', 'span', 'valign', 'width'],
  data: ['value'],
  del: ['cite', 'datetime'],
  details: ['open'],
  dialog: ['open'],
  dir: ['compact'],
  div: ['align'],
  dl: ['compact'],
  embed: ['height', 'src', 'type', 'width'],
  fieldset: ['disabled', 'form', 'name'],
  font: ['color', 'face', 'size'],
  form: [
    'accept',
    'accept-charset',
    'action',
    'autocomplete',
    'enctype',
    'method',
    'name',
    'novalidate',
    'target',
  ],
  frame: [
    'frameborder',
    'longdesc',
    'marginheight',
    'marginwidth',
    'name',
    'noresize',
    'scrolling',
    'src',
  ],
  frameset: ['cols', 'rows'],
  h1: ['align'],
  h2: ['align'],
  h3: ['align'],
  h4: ['align'],
  h5: ['align'],
  h6: ['align'],
  head: ['profile'],
  hr: ['align', 'noshade', 'size', 'width'],
  html: ['manifest', 'version'],
  iframe: [
    'align',
    'allow',
    'allowfullscreen',
    'allowpaymentrequest',
    'allowusermedia',
    'frameborder',
    'height',
    'loading',
    'longdesc',
    'marginheight',
    'marginwidth',
    'name',
    'referrerpolicy',
    'sandbox',
    'scrolling',
    'src',
    'srcdoc',
    'width',
  ],
  img: [
    'align',
    'alt',
    'border',
    'crossorigin',
    'decoding',
    'height',
    'hspace',
    'ismap',
    'loading',
    'longdesc',
    'name',
    'referrerpolicy',
    'sizes',
    'src',
    'srcset',
    'usemap',
    'vspace',
    'width',
  ],
  input: [
    'accept',
    'align',
    'alt',
    'autocomplete',
    'checked',
    'dirname',
    'disabled',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'height',
    'ismap',
    'list',
    'max',
    'maxlength',
    'min',
    'minlength',
    'multiple',
    'name',
    'pattern',
    'placeholder',
    'readonly',
    'required',
    'size',
    'src',
    'step',
    'type',
    'usemap',
    'value',
    'width',
  ],
  ins: ['cite', 'datetime'],
  isindex: ['prompt'],
  label: ['for', 'form'],
  legend: ['align'],
  li: ['type', 'value'],
  link: [
    'as',
    'charset',
    'color',
    'crossorigin',
    'disabled',
    'href',
    'hreflang',
    'imagesizes',
    'imagesrcset',
    'integrity',
    'media',
    'referrerpolicy',
    'rel',
    'rev',
    'sizes',
    'target',
    'type',
  ],
  map: ['name'],
  menu: ['compact'],
  meta: ['charset', 'content', 'http-equiv', 'media', 'name', 'scheme'],
  meter: ['high', 'low', 'max', 'min', 'optimum', 'value'],
  object: [
    'align',
    'archive',
    'border',
    'classid',
    'codebase',
    'codetype',
    'data',
    'declare',
    'form',
    'height',
    'hspace',
    'name',
    'standby',
    'type',
    'typemustmatch',
    'usemap',
    'vspace',
    'width',
  ],
  ol: ['compact', 'reversed', 'start', 'type'],
  optgroup: ['disabled', 'label'],
  option: ['disabled', 'label', 'selected', 'value'],
  output: ['for', 'form', 'name'],
  p: ['align'],
  param: ['name', 'type', 'value', 'valuetype'],
  pre: ['width'],
  progress: ['max', 'value'],
  q: ['cite'],
  script: [
    'async',
    'charset',
    'crossorigin',
    'defer',
    'integrity',
    'language',
    'nomodule',
    'referrerpolicy',
    'src',
    'type',
  ],
  select: [
    'autocomplete',
    'disabled',
    'form',
    'multiple',
    'name',
    'required',
    'size',
  ],
  slot: ['name'],
  source: ['height', 'media', 'sizes', 'src', 'srcset', 'type', 'width'],
  style: ['media', 'type'],
  table: [
    'align',
    'bgcolor',
    'border',
    'cellpadding',
    'cellspacing',
    'frame',
    'rules',
    'summary',
    'width',
  ],
  tbody: ['align', 'char', 'charoff', 'valign'],
  td: [
    'abbr',
    'align',
    'axis',
    'bgcolor',
    'char',
    'charoff',
    'colspan',
    'headers',
    'height',
    'nowrap',
    'rowspan',
    'scope',
    'valign',
    'width',
  ],
  textarea: [
    'autocomplete',
    'cols',
    'dirname',
    'disabled',
    'form',
    'maxlength',
    'minlength',
    'name',
    'placeholder',
    'readonly',
    'required',
    'rows',
    'wrap',
  ],
  tfoot: ['align', 'char', 'charoff', 'valign'],
  th: [
    'abbr',
    'align',
    'axis',
    'bgcolor',
    'char',
    'charoff',
    'colspan',
    'headers',
    'height',
    'nowrap',
    'rowspan',
    'scope',
    'valign',
    'width',
  ],
  thead: ['align', 'char', 'charoff', 'valign'],
  time: ['datetime'],
  tr: ['align', 'bgcolor', 'char', 'charoff', 'valign'],
  track: ['default', 'kind', 'label', 'src', 'srclang'],
  ul: ['compact', 'type'],
  video: [
    'autoplay',
    'controls',
    'crossorigin',
    'height',
    'loop',
    'muted',
    'playsinline',
    'poster',
    'preload',
    'src',
    'width',
  ],
};

export const isHtmlAttribute = (attr: string, tagName: string) => {
  if (/role|aria-/.test(attr)) {
    return true;
  }
  const getAttr = [
    ...htmlElementAttributes['*'],
    ...(htmlElementAttributes[tagName] || []),
  ].find((attribute) => attr === attribute);
  return Boolean(getAttr);
};
