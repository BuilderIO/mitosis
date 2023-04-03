import type { MethodMap } from './state';

export function convertMethodToFunction(
  code: string,
  properties: MethodMap,
  lexicalArgs: string[],
): string {
  const out: string[] = [];
  let idx = 0;
  let lastIdx = idx;
  let end = code.length;
  let mode: Mode = Mode.code;
  let braceDepth = 0;
  let stringEndBraceDepth = -1;
  let stringEndBraceDepthQueue: number[] = [];
  let lastCh = null;
  while (idx < end) {
    const ch = code.charCodeAt(idx++);
    switch (mode) {
      case Mode.code:
        if (ch === QUOTE_DOUBLE) {
          mode = Mode.stringDouble;
        } else if (ch === QUOTE_SINGLE) {
          mode = Mode.stringSingle;
        } else if (ch === QUOTE_BACK_TICK) {
          mode = Mode.stringTemplate;
        } else if (ch === OPEN_BRACE) {
          braceDepth++;
        } else if (lastCh == FORWARD_SLASH && ch == FORWARD_SLASH) {
          mode = Mode.commentSingleline;
        } else if (lastCh == FORWARD_SLASH && ch == STAR) {
          mode = Mode.commentMultiline;
        } else if (ch === CLOSE_BRACE) {
          braceDepth--;
          if (braceDepth === stringEndBraceDepth) {
            stringEndBraceDepth = stringEndBraceDepthQueue.pop()!;
            mode = Mode.stringTemplate;
          }
        } else if (isWord(ch, code, idx, 'this') || isWord(ch, code, idx, 'state')) {
          idx--;
          flush();
          consumeIdent();
          if (code.charCodeAt(idx) == DOT) {
            idx++;
            const propEndIdx = findIdentEnd();
            const identifier = code.substring(idx, propEndIdx);
            const propType = properties[identifier];
            if (propType) {
              const isGetter = code.charCodeAt(propEndIdx) !== OPEN_PAREN;
              lastIdx = idx = propEndIdx + (isGetter ? 0 : 1);
              if (isGetter) {
                if (propType === 'method') {
                  out.push(identifier, `.bind(null,${lexicalArgs.join(',')})`);
                } else {
                  out.push(identifier, `(${lexicalArgs.join(',')})`);
                }
              } else {
                out.push(identifier, `(${lexicalArgs.join(',')},`);
              }
            } else {
              flush();
            }
          }
        }
        break;
      case Mode.commentSingleline:
        if (ch == EOL) mode = Mode.code;
        break;
      case Mode.commentMultiline:
        if (lastCh == STAR && ch == FORWARD_SLASH) mode = Mode.code;
        break;
      case Mode.stringSingle:
        if (lastCh !== BACKSLASH && ch == QUOTE_SINGLE) mode = Mode.code;
        break;
      case Mode.stringDouble:
        if (lastCh !== BACKSLASH && ch == QUOTE_DOUBLE) mode = Mode.code;
        break;
      case Mode.stringTemplate:
        if (lastCh !== BACKSLASH && ch == QUOTE_BACK_TICK) {
          mode = Mode.code;
        } else if (lastCh === DOLLAR && ch == OPEN_BRACE) {
          mode = Mode.code;
          stringEndBraceDepthQueue.push(stringEndBraceDepth);
          stringEndBraceDepth = braceDepth;
          braceDepth++;
        }
        break;
    }
    lastCh = ch;
  }
  flush();
  return out.join('');

  function flush() {
    out.push(code.substring(lastIdx, idx));
    lastIdx = idx;
  }

  function findIdentEnd(): number {
    let scanIdx = idx;
    while (isIdentCh(code.charCodeAt(scanIdx)) && scanIdx < end) {
      scanIdx++;
    }
    return scanIdx;
  }

  function consumeIdent() {
    while (isIdentCh(code.charCodeAt(idx))) {
      idx++;
    }
  }
}

const enum Mode {
  code = 'code', // {code: true}
  stringSingle = 'stringSingle', // 'text'
  stringDouble = 'stringDouble', // 'text'
  stringTemplate = 'stringTemplate', // `text`
  commentSingleline = 'commentSingleline', // // comment
  commentMultiline = 'commentMultiline', // /* ... */
}

function isIdentCh(ch: number): boolean {
  return (
    (CHAR_0 <= ch && ch <= CHAR_9) ||
    (CHAR_a <= ch && ch <= CHAR_z) ||
    (CHAR_A <= ch && ch <= CHAR_Z) ||
    ch === UNDERSCORE ||
    ch === DOLLAR
  );
}

function isWord(ch: number, code: string, idx: number, word: string) {
  if (ch !== word.charCodeAt(0)) return false;
  for (let i = 1; i < word.length; i++) {
    if (code.charCodeAt(idx + i - 1) !== word.charCodeAt(i)) {
      return false;
    }
  }
  if (isIdentCh(code.charCodeAt(idx + word.length - 1))) {
    return false;
  }
  return true;
}

const QUOTE_DOUBLE = '"'.charCodeAt(0);
const QUOTE_SINGLE = "'".charCodeAt(0);
const QUOTE_BACK_TICK = '`'.charCodeAt(0);
const BACKSLASH = `\\`.charCodeAt(0);
const FORWARD_SLASH = `/`.charCodeAt(0);
const EOL = `\n`.charCodeAt(0);
const STAR = `*`.charCodeAt(0);
const CHAR_0 = `0`.charCodeAt(0);
const CHAR_9 = `9`.charCodeAt(0);
const CHAR_a = `a`.charCodeAt(0);
const CHAR_z = `z`.charCodeAt(0);
const CHAR_A = `A`.charCodeAt(0);
const CHAR_Z = `Z`.charCodeAt(0);
const UNDERSCORE = `_`.charCodeAt(0);
const DOLLAR = `$`.charCodeAt(0);
const DOT = `.`.charCodeAt(0);
const OPEN_PAREN = '('.charCodeAt(0);
const OPEN_BRACE = '{'.charCodeAt(0);
const CLOSE_BRACE = '}'.charCodeAt(0);
