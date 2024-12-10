const {
  $C,
  $E,
  $EVENT,
  $EVENT_C,
  $EXPECT,
  $L,
  $N,
  $P,
  $Q,
  $R,
  $R$0,
  $S,
  $T,
  $TEXT,
  $TR,
  $TS,
  $TV,
  $Y,
  ParseError,
  Parser,
  Validator,
} = require('@danielx/hera/dist/machine.js');

const grammar = {
  Selector: Selector,
  TagName: TagName,
  Part: Part,
  Attribute: Attribute,
  AttributeValue: AttributeValue,
  DoubleQuotedString: DoubleQuotedString,
  SingleQuotedString: SingleQuotedString,
  Class: Class,
  Id: Id,
  EscapeSequence: EscapeSequence,
  Identifier: Identifier,
  AttributeName: AttributeName,
  __: __,
};

const $L0 = $L('[');
const $L1 = $L('=');
const $L2 = $L(']');
const $L3 = $L('"');
const $L4 = $L("'");
const $L5 = $L('.');
const $L6 = $L('#');
const $L7 = $L('\\');

const $R0 = $R(new RegExp('(?:\\\\.|[^"])*', 'suy'));
const $R1 = $R(new RegExp("(?:\\\\.|[^'])*", 'suy'));
const $R2 = $R(new RegExp('.', 'suy'));
const $R3 = $R(new RegExp('[_a-zA-Z][_a-zA-Z0-9-]*', 'suy'));
const $R4 = $R(new RegExp('[ \\t]*', 'suy'));

//@ts-ignore
const Selector$0 = $TS($S($E(TagName), $Q(Part)), function ($skip, $loc, $0, $1, $2) {
  var tagName = $1;
  var parts = $2;
  const firstId = parts.find(([key]) => key === 'id');
  let id;
  if (firstId) {
    id = firstId[1];
  }

  return {
    tagName,
    id,
    classes: parts.filter(([key]) => key === 'class').map(([, value]) => value),
    attributes: Object.fromEntries(parts.filter(([key]) => key !== 'id' && key !== 'class')),
  };
});
//@ts-ignore
function Selector(ctx, state) {
  return $EVENT(ctx, state, 'Selector', Selector$0);
}

//@ts-ignore
const TagName$0 = Identifier;
//@ts-ignore
function TagName(ctx, state) {
  return $EVENT(ctx, state, 'TagName', TagName$0);
}

//@ts-ignore
const Part$0 = Attribute;
//@ts-ignore
const Part$1 = Class;
//@ts-ignore
const Part$2 = Id;
//@ts-ignore
const Part$$ = [Part$0, Part$1, Part$2];
//@ts-ignore
function Part(ctx, state) {
  return $EVENT_C(ctx, state, 'Part', Part$$);
}

//@ts-ignore
const Attribute$0 = $TS(
  $S(
    $EXPECT($L0, 'Attribute "["'),
    __,
    AttributeName,
    __,
    $EXPECT($L1, 'Attribute "="'),
    __,
    AttributeValue,
    __,
    $EXPECT($L2, 'Attribute "]"'),
  ),
  function ($skip, $loc, $0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
    return [$3, $7];
  },
);
//@ts-ignore
const Attribute$1 = $TS(
  $S($EXPECT($L0, 'Attribute "["'), __, AttributeName, __, $EXPECT($L2, 'Attribute "]"')),
  function ($skip, $loc, $0, $1, $2, $3, $4, $5) {
    return [$3];
  },
);
//@ts-ignore
const Attribute$$ = [Attribute$0, Attribute$1];
//@ts-ignore
function Attribute(ctx, state) {
  return $EVENT_C(ctx, state, 'Attribute', Attribute$$);
}

//@ts-ignore
const AttributeValue$0 = $TEXT(DoubleQuotedString);
//@ts-ignore
const AttributeValue$1 = $TEXT(SingleQuotedString);
//@ts-ignore
const AttributeValue$$ = [AttributeValue$0, AttributeValue$1];
//@ts-ignore
function AttributeValue(ctx, state) {
  return $EVENT_C(ctx, state, 'AttributeValue', AttributeValue$$);
}

//@ts-ignore
const DoubleQuotedString$0 = $S(
  $EXPECT($L3, 'DoubleQuotedString "\\\\\\""'),
  $R$0($EXPECT($R0, 'DoubleQuotedString /(?:\\\\.|[^"])*/')),
  $EXPECT($L3, 'DoubleQuotedString "\\\\\\""'),
);
//@ts-ignore
function DoubleQuotedString(ctx, state) {
  return $EVENT(ctx, state, 'DoubleQuotedString', DoubleQuotedString$0);
}

//@ts-ignore
const SingleQuotedString$0 = $S(
  $EXPECT($L4, 'SingleQuotedString "\'"'),
  $R$0($EXPECT($R1, "SingleQuotedString /(?:\\\\.|[^'])*/")),
  $EXPECT($L4, 'SingleQuotedString "\'"'),
);
//@ts-ignore
function SingleQuotedString(ctx, state) {
  return $EVENT(ctx, state, 'SingleQuotedString', SingleQuotedString$0);
}

//@ts-ignore
const Class$0 = $TS($S($EXPECT($L5, 'Class "."'), Identifier), function ($skip, $loc, $0, $1, $2) {
  return ['class', $2];
});
//@ts-ignore
function Class(ctx, state) {
  return $EVENT(ctx, state, 'Class', Class$0);
}

//@ts-ignore
const Id$0 = $TS($S($EXPECT($L6, 'Id "#"'), Identifier), function ($skip, $loc, $0, $1, $2) {
  return ['id', $2];
});
//@ts-ignore
function Id(ctx, state) {
  return $EVENT(ctx, state, 'Id', Id$0);
}

//@ts-ignore
const EscapeSequence$0 = $EXPECT($L4, 'EscapeSequence "\'"');
//@ts-ignore
const EscapeSequence$1 = $EXPECT($L3, 'EscapeSequence "\\\\\\""');
//@ts-ignore
const EscapeSequence$2 = $EXPECT($L7, 'EscapeSequence "\\\\\\\\"');
//@ts-ignore
const EscapeSequence$3 = $TR(
  $EXPECT($R2, 'EscapeSequence /./'),
  function ($skip, $loc, $0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
    return '\\' + $0;
  },
);
//@ts-ignore
const EscapeSequence$$ = [EscapeSequence$0, EscapeSequence$1, EscapeSequence$2, EscapeSequence$3];
//@ts-ignore
function EscapeSequence(ctx, state) {
  return $EVENT_C(ctx, state, 'EscapeSequence', EscapeSequence$$);
}

//@ts-ignore
const Identifier$0 = $T($EXPECT($R3, 'Identifier /[_a-zA-Z][_a-zA-Z0-9-]*/'), function (value) {
  return value[0];
});
//@ts-ignore
function Identifier(ctx, state) {
  return $EVENT(ctx, state, 'Identifier', Identifier$0);
}

//@ts-ignore
const AttributeName$0 = Identifier;
//@ts-ignore
function AttributeName(ctx, state) {
  return $EVENT(ctx, state, 'AttributeName', AttributeName$0);
}

//@ts-ignore
const __$0 = $R$0($EXPECT($R4, '__ /[ \\t]*/'));
//@ts-ignore
function __(ctx, state) {
  return $EVENT(ctx, state, '__', __$0);
}

const parser = (function () {
  const { fail, validate, reset } = Validator();
  let ctx = { expectation: '', fail };

  return {
    parse: (input, options = {}) => {
      if (typeof input !== 'string') throw new Error('Input must be a string');

      const parser =
        options.startRule != null ? grammar[options.startRule] : Object.values(grammar)[0];

      if (!parser) throw new Error(`Could not find rule with name '${options.startRule}'`);

      const filename = options.filename || '<anonymous>';

      reset();
      Object.assign(ctx, { ...options.events, tokenize: options.tokenize });

      return validate(
        input,
        parser(ctx, {
          input,
          pos: 0,
        }),
        {
          filename: filename,
        },
      );
    },
  };
})();

exports.default = parser;
const parse = (exports.parse = parser.parse);

exports.Selector = Selector;
exports.TagName = TagName;
exports.Part = Part;
exports.Attribute = Attribute;
exports.AttributeValue = AttributeValue;
exports.DoubleQuotedString = DoubleQuotedString;
exports.SingleQuotedString = SingleQuotedString;
exports.Class = Class;
exports.Id = Id;
exports.EscapeSequence = EscapeSequence;
exports.Identifier = Identifier;
exports.AttributeName = AttributeName;
exports.__ = __;
