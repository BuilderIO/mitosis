import * as babel from '@babel/core';

export const SPEC = {
  type: 'ObjectExpression',
  start: 10,
  end: 4687,
  loc: {
    start: {
      line: 1,
      column: 10,
      index: 10,
    },
    end: {
      line: 165,
      column: 3,
      index: 4687,
    },
  },
  properties: [
    {
      type: 'ObjectProperty',
      start: 16,
      end: 37,
      loc: {
        start: {
          line: 2,
          column: 4,
          index: 16,
        },
        end: {
          line: 2,
          column: 25,
          index: 37,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 16,
        end: 34,
        loc: {
          start: {
            line: 2,
            column: 4,
            index: 16,
          },
          end: {
            line: 2,
            column: 22,
            index: 34,
          },
          identifierName: 'forceReRenderCount',
        },
        name: 'forceReRenderCount',
      },
      computed: false,
      shorthand: false,
      value: {
        type: 'NumericLiteral',
        start: 36,
        end: 37,
        loc: {
          start: {
            line: 2,
            column: 24,
            index: 36,
          },
          end: {
            line: 2,
            column: 25,
            index: 37,
          },
        },
        extra: {
          rawValue: 0,
          raw: '0',
        },
        value: 0,
      },
    },
    {
      type: 'ObjectMethod',
      start: 43,
      end: 364,
      loc: {
        start: {
          line: 3,
          column: 4,
          index: 43,
        },
        end: {
          line: 14,
          column: 5,
          index: 364,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 47,
        end: 57,
        loc: {
          start: {
            line: 3,
            column: 8,
            index: 47,
          },
          end: {
            line: 3,
            column: 18,
            index: 57,
          },
          identifierName: 'useContent',
        },
        name: 'useContent',
      },
      computed: false,
      kind: 'get',
      id: null,
      generator: false,
      async: false,
      params: [],
      returnType: {
        type: 'TSTypeAnnotation',
        start: 59,
        end: 85,
        loc: {
          start: {
            line: 3,
            column: 20,
            index: 59,
          },
          end: {
            line: 3,
            column: 46,
            index: 85,
          },
        },
        typeAnnotation: {
          type: 'TSTypeReference',
          start: 61,
          end: 85,
          loc: {
            start: {
              line: 3,
              column: 22,
              index: 61,
            },
            end: {
              line: 3,
              column: 46,
              index: 85,
            },
          },
          typeName: {
            type: 'Identifier',
            start: 61,
            end: 69,
            loc: {
              start: {
                line: 3,
                column: 22,
                index: 61,
              },
              end: {
                line: 3,
                column: 30,
                index: 69,
              },
              identifierName: 'Nullable',
            },
            name: 'Nullable',
          },
          typeParameters: {
            type: 'TSTypeParameterInstantiation',
            start: 69,
            end: 85,
            loc: {
              start: {
                line: 3,
                column: 30,
                index: 69,
              },
              end: {
                line: 3,
                column: 46,
                index: 85,
              },
            },
            params: [
              {
                type: 'TSTypeReference',
                start: 70,
                end: 84,
                loc: {
                  start: {
                    line: 3,
                    column: 31,
                    index: 70,
                  },
                  end: {
                    line: 3,
                    column: 45,
                    index: 84,
                  },
                },
                typeName: {
                  type: 'Identifier',
                  start: 70,
                  end: 84,
                  loc: {
                    start: {
                      line: 3,
                      column: 31,
                      index: 70,
                    },
                    end: {
                      line: 3,
                      column: 45,
                      index: 84,
                    },
                    identifierName: 'BuilderContent',
                  },
                  name: 'BuilderContent',
                },
              },
            ],
          },
        },
      },
      body: {
        type: 'BlockStatement',
        start: 86,
        end: 364,
        loc: {
          start: {
            line: 3,
            column: 47,
            index: 86,
          },
          end: {
            line: 14,
            column: 5,
            index: 364,
          },
        },
        body: [
          {
            type: 'VariableDeclaration',
            start: 94,
            end: 330,
            loc: {
              start: {
                line: 4,
                column: 6,
                index: 94,
              },
              end: {
                line: 12,
                column: 8,
                index: 330,
              },
            },
            declarations: [
              {
                type: 'VariableDeclarator',
                start: 100,
                end: 329,
                loc: {
                  start: {
                    line: 4,
                    column: 12,
                    index: 100,
                  },
                  end: {
                    line: 12,
                    column: 7,
                    index: 329,
                  },
                },
                id: {
                  type: 'Identifier',
                  start: 100,
                  end: 129,
                  loc: {
                    start: {
                      line: 4,
                      column: 12,
                      index: 100,
                    },
                    end: {
                      line: 4,
                      column: 41,
                      index: 129,
                    },
                    identifierName: 'mergedContent',
                  },
                  name: 'mergedContent',
                  typeAnnotation: {
                    type: 'TSTypeAnnotation',
                    start: 113,
                    end: 129,
                    loc: {
                      start: {
                        line: 4,
                        column: 25,
                        index: 113,
                      },
                      end: {
                        line: 4,
                        column: 41,
                        index: 129,
                      },
                    },
                    typeAnnotation: {
                      type: 'TSTypeReference',
                      start: 115,
                      end: 129,
                      loc: {
                        start: {
                          line: 4,
                          column: 27,
                          index: 115,
                        },
                        end: {
                          line: 4,
                          column: 41,
                          index: 129,
                        },
                      },
                      typeName: {
                        type: 'Identifier',
                        start: 115,
                        end: 129,
                        loc: {
                          start: {
                            line: 4,
                            column: 27,
                            index: 115,
                          },
                          end: {
                            line: 4,
                            column: 41,
                            index: 129,
                          },
                          identifierName: 'BuilderContent',
                        },
                        name: 'BuilderContent',
                      },
                    },
                  },
                },
                init: {
                  type: 'ObjectExpression',
                  start: 132,
                  end: 329,
                  loc: {
                    start: {
                      line: 4,
                      column: 44,
                      index: 132,
                    },
                    end: {
                      line: 12,
                      column: 7,
                      index: 329,
                    },
                  },
                  properties: [
                    {
                      type: 'SpreadElement',
                      start: 142,
                      end: 158,
                      loc: {
                        start: {
                          line: 5,
                          column: 8,
                          index: 142,
                        },
                        end: {
                          line: 5,
                          column: 24,
                          index: 158,
                        },
                      },
                      argument: {
                        type: 'MemberExpression',
                        start: 145,
                        end: 158,
                        loc: {
                          start: {
                            line: 5,
                            column: 11,
                            index: 145,
                          },
                          end: {
                            line: 5,
                            column: 24,
                            index: 158,
                          },
                        },
                        object: {
                          type: 'Identifier',
                          start: 145,
                          end: 150,
                          loc: {
                            start: {
                              line: 5,
                              column: 11,
                              index: 145,
                            },
                            end: {
                              line: 5,
                              column: 16,
                              index: 150,
                            },
                            identifierName: 'props',
                          },
                          name: 'props',
                        },
                        computed: false,
                        property: {
                          type: 'Identifier',
                          start: 151,
                          end: 158,
                          loc: {
                            start: {
                              line: 5,
                              column: 17,
                              index: 151,
                            },
                            end: {
                              line: 5,
                              column: 24,
                              index: 158,
                            },
                            identifierName: 'content',
                          },
                          name: 'content',
                        },
                      },
                    },
                    {
                      type: 'SpreadElement',
                      start: 168,
                      end: 192,
                      loc: {
                        start: {
                          line: 6,
                          column: 8,
                          index: 168,
                        },
                        end: {
                          line: 6,
                          column: 32,
                          index: 192,
                        },
                      },
                      argument: {
                        type: 'MemberExpression',
                        start: 171,
                        end: 192,
                        loc: {
                          start: {
                            line: 6,
                            column: 11,
                            index: 171,
                          },
                          end: {
                            line: 6,
                            column: 32,
                            index: 192,
                          },
                        },
                        object: {
                          type: 'Identifier',
                          start: 171,
                          end: 176,
                          loc: {
                            start: {
                              line: 6,
                              column: 11,
                              index: 171,
                            },
                            end: {
                              line: 6,
                              column: 16,
                              index: 176,
                            },
                            identifierName: 'state',
                          },
                          name: 'state',
                        },
                        computed: false,
                        property: {
                          type: 'Identifier',
                          start: 177,
                          end: 192,
                          loc: {
                            start: {
                              line: 6,
                              column: 17,
                              index: 177,
                            },
                            end: {
                              line: 6,
                              column: 32,
                              index: 192,
                            },
                            identifierName: 'overrideContent',
                          },
                          name: 'overrideContent',
                        },
                      },
                    },
                    {
                      type: 'ObjectProperty',
                      start: 202,
                      end: 320,
                      loc: {
                        start: {
                          line: 7,
                          column: 8,
                          index: 202,
                        },
                        end: {
                          line: 11,
                          column: 9,
                          index: 320,
                        },
                      },
                      method: false,
                      key: {
                        type: 'Identifier',
                        start: 202,
                        end: 206,
                        loc: {
                          start: {
                            line: 7,
                            column: 8,
                            index: 202,
                          },
                          end: {
                            line: 7,
                            column: 12,
                            index: 206,
                          },
                          identifierName: 'data',
                        },
                        name: 'data',
                      },
                      computed: false,
                      shorthand: false,
                      value: {
                        type: 'ObjectExpression',
                        start: 208,
                        end: 320,
                        loc: {
                          start: {
                            line: 7,
                            column: 14,
                            index: 208,
                          },
                          end: {
                            line: 11,
                            column: 9,
                            index: 320,
                          },
                        },
                        properties: [
                          {
                            type: 'SpreadElement',
                            start: 220,
                            end: 242,
                            loc: {
                              start: {
                                line: 8,
                                column: 10,
                                index: 220,
                              },
                              end: {
                                line: 8,
                                column: 32,
                                index: 242,
                              },
                            },
                            argument: {
                              type: 'OptionalMemberExpression',
                              start: 223,
                              end: 242,
                              loc: {
                                start: {
                                  line: 8,
                                  column: 13,
                                  index: 223,
                                },
                                end: {
                                  line: 8,
                                  column: 32,
                                  index: 242,
                                },
                              },
                              object: {
                                type: 'MemberExpression',
                                start: 223,
                                end: 236,
                                loc: {
                                  start: {
                                    line: 8,
                                    column: 13,
                                    index: 223,
                                  },
                                  end: {
                                    line: 8,
                                    column: 26,
                                    index: 236,
                                  },
                                },
                                object: {
                                  type: 'Identifier',
                                  start: 223,
                                  end: 228,
                                  loc: {
                                    start: {
                                      line: 8,
                                      column: 13,
                                      index: 223,
                                    },
                                    end: {
                                      line: 8,
                                      column: 18,
                                      index: 228,
                                    },
                                    identifierName: 'props',
                                  },
                                  name: 'props',
                                },
                                computed: false,
                                property: {
                                  type: 'Identifier',
                                  start: 229,
                                  end: 236,
                                  loc: {
                                    start: {
                                      line: 8,
                                      column: 19,
                                      index: 229,
                                    },
                                    end: {
                                      line: 8,
                                      column: 26,
                                      index: 236,
                                    },
                                    identifierName: 'content',
                                  },
                                  name: 'content',
                                },
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 238,
                                end: 242,
                                loc: {
                                  start: {
                                    line: 8,
                                    column: 28,
                                    index: 238,
                                  },
                                  end: {
                                    line: 8,
                                    column: 32,
                                    index: 242,
                                  },
                                  identifierName: 'data',
                                },
                                name: 'data',
                              },
                              optional: true,
                            },
                          },
                          {
                            type: 'SpreadElement',
                            start: 254,
                            end: 267,
                            loc: {
                              start: {
                                line: 9,
                                column: 10,
                                index: 254,
                              },
                              end: {
                                line: 9,
                                column: 23,
                                index: 267,
                              },
                            },
                            argument: {
                              type: 'MemberExpression',
                              start: 257,
                              end: 267,
                              loc: {
                                start: {
                                  line: 9,
                                  column: 13,
                                  index: 257,
                                },
                                end: {
                                  line: 9,
                                  column: 23,
                                  index: 267,
                                },
                              },
                              object: {
                                type: 'Identifier',
                                start: 257,
                                end: 262,
                                loc: {
                                  start: {
                                    line: 9,
                                    column: 13,
                                    index: 257,
                                  },
                                  end: {
                                    line: 9,
                                    column: 18,
                                    index: 262,
                                  },
                                  identifierName: 'props',
                                },
                                name: 'props',
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 263,
                                end: 267,
                                loc: {
                                  start: {
                                    line: 9,
                                    column: 19,
                                    index: 263,
                                  },
                                  end: {
                                    line: 9,
                                    column: 23,
                                    index: 267,
                                  },
                                  identifierName: 'data',
                                },
                                name: 'data',
                              },
                            },
                          },
                          {
                            type: 'SpreadElement',
                            start: 279,
                            end: 309,
                            loc: {
                              start: {
                                line: 10,
                                column: 10,
                                index: 279,
                              },
                              end: {
                                line: 10,
                                column: 40,
                                index: 309,
                              },
                            },
                            argument: {
                              type: 'OptionalMemberExpression',
                              start: 282,
                              end: 309,
                              loc: {
                                start: {
                                  line: 10,
                                  column: 13,
                                  index: 282,
                                },
                                end: {
                                  line: 10,
                                  column: 40,
                                  index: 309,
                                },
                              },
                              object: {
                                type: 'MemberExpression',
                                start: 282,
                                end: 303,
                                loc: {
                                  start: {
                                    line: 10,
                                    column: 13,
                                    index: 282,
                                  },
                                  end: {
                                    line: 10,
                                    column: 34,
                                    index: 303,
                                  },
                                },
                                object: {
                                  type: 'Identifier',
                                  start: 282,
                                  end: 287,
                                  loc: {
                                    start: {
                                      line: 10,
                                      column: 13,
                                      index: 282,
                                    },
                                    end: {
                                      line: 10,
                                      column: 18,
                                      index: 287,
                                    },
                                    identifierName: 'state',
                                  },
                                  name: 'state',
                                },
                                computed: false,
                                property: {
                                  type: 'Identifier',
                                  start: 288,
                                  end: 303,
                                  loc: {
                                    start: {
                                      line: 10,
                                      column: 19,
                                      index: 288,
                                    },
                                    end: {
                                      line: 10,
                                      column: 34,
                                      index: 303,
                                    },
                                    identifierName: 'overrideContent',
                                  },
                                  name: 'overrideContent',
                                },
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 305,
                                end: 309,
                                loc: {
                                  start: {
                                    line: 10,
                                    column: 36,
                                    index: 305,
                                  },
                                  end: {
                                    line: 10,
                                    column: 40,
                                    index: 309,
                                  },
                                  identifierName: 'data',
                                },
                                name: 'data',
                              },
                              optional: true,
                            },
                          },
                        ],
                        extra: {
                          trailingComma: 309,
                        },
                      },
                    },
                  ],
                  extra: {
                    trailingComma: 320,
                  },
                },
              },
            ],
            kind: 'const',
          },
          {
            type: 'ReturnStatement',
            start: 337,
            end: 358,
            loc: {
              start: {
                line: 13,
                column: 6,
                index: 337,
              },
              end: {
                line: 13,
                column: 27,
                index: 358,
              },
            },
            argument: {
              type: 'Identifier',
              start: 344,
              end: 357,
              loc: {
                start: {
                  line: 13,
                  column: 13,
                  index: 344,
                },
                end: {
                  line: 13,
                  column: 26,
                  index: 357,
                },
                identifierName: 'mergedContent',
              },
              name: 'mergedContent',
            },
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectProperty',
      start: 370,
      end: 419,
      loc: {
        start: {
          line: 15,
          column: 4,
          index: 370,
        },
        end: {
          line: 15,
          column: 53,
          index: 419,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 370,
        end: 385,
        loc: {
          start: {
            line: 15,
            column: 4,
            index: 370,
          },
          end: {
            line: 15,
            column: 19,
            index: 385,
          },
          identifierName: 'overrideContent',
        },
        name: 'overrideContent',
      },
      computed: false,
      shorthand: false,
      value: {
        type: 'TSAsExpression',
        start: 387,
        end: 419,
        loc: {
          start: {
            line: 15,
            column: 21,
            index: 387,
          },
          end: {
            line: 15,
            column: 53,
            index: 419,
          },
        },
        expression: {
          type: 'NullLiteral',
          start: 387,
          end: 391,
          loc: {
            start: {
              line: 15,
              column: 21,
              index: 387,
            },
            end: {
              line: 15,
              column: 25,
              index: 391,
            },
          },
        },
        typeAnnotation: {
          type: 'TSTypeReference',
          start: 395,
          end: 419,
          loc: {
            start: {
              line: 15,
              column: 29,
              index: 395,
            },
            end: {
              line: 15,
              column: 53,
              index: 419,
            },
          },
          typeName: {
            type: 'Identifier',
            start: 395,
            end: 403,
            loc: {
              start: {
                line: 15,
                column: 29,
                index: 395,
              },
              end: {
                line: 15,
                column: 37,
                index: 403,
              },
              identifierName: 'Nullable',
            },
            name: 'Nullable',
          },
          typeParameters: {
            type: 'TSTypeParameterInstantiation',
            start: 403,
            end: 419,
            loc: {
              start: {
                line: 15,
                column: 37,
                index: 403,
              },
              end: {
                line: 15,
                column: 53,
                index: 419,
              },
            },
            params: [
              {
                type: 'TSTypeReference',
                start: 404,
                end: 418,
                loc: {
                  start: {
                    line: 15,
                    column: 38,
                    index: 404,
                  },
                  end: {
                    line: 15,
                    column: 52,
                    index: 418,
                  },
                },
                typeName: {
                  type: 'Identifier',
                  start: 404,
                  end: 418,
                  loc: {
                    start: {
                      line: 15,
                      column: 38,
                      index: 404,
                    },
                    end: {
                      line: 15,
                      column: 52,
                      index: 418,
                    },
                    identifierName: 'BuilderContent',
                  },
                  name: 'BuilderContent',
                },
              },
            ],
          },
        },
      },
    },
    {
      type: 'ObjectProperty',
      start: 425,
      end: 434,
      loc: {
        start: {
          line: 16,
          column: 4,
          index: 425,
        },
        end: {
          line: 16,
          column: 13,
          index: 434,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 425,
        end: 431,
        loc: {
          start: {
            line: 16,
            column: 4,
            index: 425,
          },
          end: {
            line: 16,
            column: 10,
            index: 431,
          },
          identifierName: 'update',
        },
        name: 'update',
      },
      computed: false,
      shorthand: false,
      value: {
        type: 'NumericLiteral',
        start: 433,
        end: 434,
        loc: {
          start: {
            line: 16,
            column: 12,
            index: 433,
          },
          end: {
            line: 16,
            column: 13,
            index: 434,
          },
        },
        extra: {
          rawValue: 0,
          raw: '0',
        },
        value: 0,
      },
    },
    {
      type: 'ObjectMethod',
      start: 440,
      end: 513,
      loc: {
        start: {
          line: 17,
          column: 4,
          index: 440,
        },
        end: {
          line: 19,
          column: 5,
          index: 513,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 444,
        end: 457,
        loc: {
          start: {
            line: 17,
            column: 8,
            index: 444,
          },
          end: {
            line: 17,
            column: 21,
            index: 457,
          },
          identifierName: 'canTrackToUse',
        },
        name: 'canTrackToUse',
      },
      computed: false,
      kind: 'get',
      id: null,
      generator: false,
      async: false,
      params: [],
      returnType: {
        type: 'TSTypeAnnotation',
        start: 459,
        end: 468,
        loc: {
          start: {
            line: 17,
            column: 23,
            index: 459,
          },
          end: {
            line: 17,
            column: 32,
            index: 468,
          },
        },
        typeAnnotation: {
          type: 'TSBooleanKeyword',
          start: 461,
          end: 468,
          loc: {
            start: {
              line: 17,
              column: 25,
              index: 461,
            },
            end: {
              line: 17,
              column: 32,
              index: 468,
            },
          },
        },
      },
      body: {
        type: 'BlockStatement',
        start: 469,
        end: 513,
        loc: {
          start: {
            line: 17,
            column: 33,
            index: 469,
          },
          end: {
            line: 19,
            column: 5,
            index: 513,
          },
        },
        body: [
          {
            type: 'ReturnStatement',
            start: 477,
            end: 507,
            loc: {
              start: {
                line: 18,
                column: 6,
                index: 477,
              },
              end: {
                line: 18,
                column: 36,
                index: 507,
              },
            },
            argument: {
              type: 'LogicalExpression',
              start: 484,
              end: 506,
              loc: {
                start: {
                  line: 18,
                  column: 13,
                  index: 484,
                },
                end: {
                  line: 18,
                  column: 35,
                  index: 506,
                },
              },
              left: {
                type: 'MemberExpression',
                start: 484,
                end: 498,
                loc: {
                  start: {
                    line: 18,
                    column: 13,
                    index: 484,
                  },
                  end: {
                    line: 18,
                    column: 27,
                    index: 498,
                  },
                },
                object: {
                  type: 'Identifier',
                  start: 484,
                  end: 489,
                  loc: {
                    start: {
                      line: 18,
                      column: 13,
                      index: 484,
                    },
                    end: {
                      line: 18,
                      column: 18,
                      index: 489,
                    },
                    identifierName: 'props',
                  },
                  name: 'props',
                },
                computed: false,
                property: {
                  type: 'Identifier',
                  start: 490,
                  end: 498,
                  loc: {
                    start: {
                      line: 18,
                      column: 19,
                      index: 490,
                    },
                    end: {
                      line: 18,
                      column: 27,
                      index: 498,
                    },
                    identifierName: 'canTrack',
                  },
                  name: 'canTrack',
                },
              },
              operator: '||',
              right: {
                type: 'BooleanLiteral',
                start: 502,
                end: 506,
                loc: {
                  start: {
                    line: 18,
                    column: 31,
                    index: 502,
                  },
                  end: {
                    line: 18,
                    column: 35,
                    index: 506,
                  },
                },
                value: true,
              },
            },
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectProperty',
      start: 519,
      end: 558,
      loc: {
        start: {
          line: 20,
          column: 4,
          index: 519,
        },
        end: {
          line: 20,
          column: 43,
          index: 558,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 519,
        end: 532,
        loc: {
          start: {
            line: 20,
            column: 4,
            index: 519,
          },
          end: {
            line: 20,
            column: 17,
            index: 532,
          },
          identifierName: 'overrideState',
        },
        name: 'overrideState',
      },
      computed: false,
      shorthand: false,
      value: {
        type: 'TSAsExpression',
        start: 534,
        end: 558,
        loc: {
          start: {
            line: 20,
            column: 19,
            index: 534,
          },
          end: {
            line: 20,
            column: 43,
            index: 558,
          },
        },
        expression: {
          type: 'ObjectExpression',
          start: 534,
          end: 536,
          loc: {
            start: {
              line: 20,
              column: 19,
              index: 534,
            },
            end: {
              line: 20,
              column: 21,
              index: 536,
            },
          },
          properties: [],
        },
        typeAnnotation: {
          type: 'TSTypeReference',
          start: 540,
          end: 558,
          loc: {
            start: {
              line: 20,
              column: 25,
              index: 540,
            },
            end: {
              line: 20,
              column: 43,
              index: 558,
            },
          },
          typeName: {
            type: 'Identifier',
            start: 540,
            end: 558,
            loc: {
              start: {
                line: 20,
                column: 25,
                index: 540,
              },
              end: {
                line: 20,
                column: 43,
                index: 558,
              },
              identifierName: 'BuilderRenderState',
            },
            name: 'BuilderRenderState',
          },
        },
      },
    },
    {
      type: 'ObjectMethod',
      start: 564,
      end: 728,
      loc: {
        start: {
          line: 21,
          column: 4,
          index: 564,
        },
        end: {
          line: 27,
          column: 5,
          index: 728,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 568,
        end: 580,
        loc: {
          start: {
            line: 21,
            column: 8,
            index: 568,
          },
          end: {
            line: 21,
            column: 20,
            index: 580,
          },
          identifierName: 'contentState',
        },
        name: 'contentState',
      },
      computed: false,
      kind: 'get',
      id: null,
      generator: false,
      async: false,
      params: [],
      returnType: {
        type: 'TSTypeAnnotation',
        start: 582,
        end: 602,
        loc: {
          start: {
            line: 21,
            column: 22,
            index: 582,
          },
          end: {
            line: 21,
            column: 42,
            index: 602,
          },
        },
        typeAnnotation: {
          type: 'TSTypeReference',
          start: 584,
          end: 602,
          loc: {
            start: {
              line: 21,
              column: 24,
              index: 584,
            },
            end: {
              line: 21,
              column: 42,
              index: 602,
            },
          },
          typeName: {
            type: 'Identifier',
            start: 584,
            end: 602,
            loc: {
              start: {
                line: 21,
                column: 24,
                index: 584,
              },
              end: {
                line: 21,
                column: 42,
                index: 602,
              },
              identifierName: 'BuilderRenderState',
            },
            name: 'BuilderRenderState',
          },
        },
      },
      body: {
        type: 'BlockStatement',
        start: 603,
        end: 728,
        loc: {
          start: {
            line: 21,
            column: 43,
            index: 603,
          },
          end: {
            line: 27,
            column: 5,
            index: 728,
          },
        },
        body: [
          {
            type: 'ReturnStatement',
            start: 611,
            end: 722,
            loc: {
              start: {
                line: 22,
                column: 6,
                index: 611,
              },
              end: {
                line: 26,
                column: 8,
                index: 722,
              },
            },
            argument: {
              type: 'ObjectExpression',
              start: 618,
              end: 721,
              loc: {
                start: {
                  line: 22,
                  column: 13,
                  index: 618,
                },
                end: {
                  line: 26,
                  column: 7,
                  index: 721,
                },
              },
              properties: [
                {
                  type: 'SpreadElement',
                  start: 628,
                  end: 657,
                  loc: {
                    start: {
                      line: 23,
                      column: 8,
                      index: 628,
                    },
                    end: {
                      line: 23,
                      column: 37,
                      index: 657,
                    },
                  },
                  argument: {
                    type: 'OptionalMemberExpression',
                    start: 631,
                    end: 657,
                    loc: {
                      start: {
                        line: 23,
                        column: 11,
                        index: 631,
                      },
                      end: {
                        line: 23,
                        column: 37,
                        index: 657,
                      },
                    },
                    object: {
                      type: 'OptionalMemberExpression',
                      start: 631,
                      end: 650,
                      loc: {
                        start: {
                          line: 23,
                          column: 11,
                          index: 631,
                        },
                        end: {
                          line: 23,
                          column: 30,
                          index: 650,
                        },
                      },
                      object: {
                        type: 'MemberExpression',
                        start: 631,
                        end: 644,
                        loc: {
                          start: {
                            line: 23,
                            column: 11,
                            index: 631,
                          },
                          end: {
                            line: 23,
                            column: 24,
                            index: 644,
                          },
                        },
                        object: {
                          type: 'Identifier',
                          start: 631,
                          end: 636,
                          loc: {
                            start: {
                              line: 23,
                              column: 11,
                              index: 631,
                            },
                            end: {
                              line: 23,
                              column: 16,
                              index: 636,
                            },
                            identifierName: 'props',
                          },
                          name: 'props',
                        },
                        computed: false,
                        property: {
                          type: 'Identifier',
                          start: 637,
                          end: 644,
                          loc: {
                            start: {
                              line: 23,
                              column: 17,
                              index: 637,
                            },
                            end: {
                              line: 23,
                              column: 24,
                              index: 644,
                            },
                            identifierName: 'content',
                          },
                          name: 'content',
                        },
                      },
                      computed: false,
                      property: {
                        type: 'Identifier',
                        start: 646,
                        end: 650,
                        loc: {
                          start: {
                            line: 23,
                            column: 26,
                            index: 646,
                          },
                          end: {
                            line: 23,
                            column: 30,
                            index: 650,
                          },
                          identifierName: 'data',
                        },
                        name: 'data',
                      },
                      optional: true,
                    },
                    computed: false,
                    property: {
                      type: 'Identifier',
                      start: 652,
                      end: 657,
                      loc: {
                        start: {
                          line: 23,
                          column: 32,
                          index: 652,
                        },
                        end: {
                          line: 23,
                          column: 37,
                          index: 657,
                        },
                        identifierName: 'state',
                      },
                      name: 'state',
                    },
                    optional: true,
                  },
                },
                {
                  type: 'SpreadElement',
                  start: 667,
                  end: 680,
                  loc: {
                    start: {
                      line: 24,
                      column: 8,
                      index: 667,
                    },
                    end: {
                      line: 24,
                      column: 21,
                      index: 680,
                    },
                  },
                  argument: {
                    type: 'MemberExpression',
                    start: 670,
                    end: 680,
                    loc: {
                      start: {
                        line: 24,
                        column: 11,
                        index: 670,
                      },
                      end: {
                        line: 24,
                        column: 21,
                        index: 680,
                      },
                    },
                    object: {
                      type: 'Identifier',
                      start: 670,
                      end: 675,
                      loc: {
                        start: {
                          line: 24,
                          column: 11,
                          index: 670,
                        },
                        end: {
                          line: 24,
                          column: 16,
                          index: 675,
                        },
                        identifierName: 'props',
                      },
                      name: 'props',
                    },
                    computed: false,
                    property: {
                      type: 'Identifier',
                      start: 676,
                      end: 680,
                      loc: {
                        start: {
                          line: 24,
                          column: 17,
                          index: 676,
                        },
                        end: {
                          line: 24,
                          column: 21,
                          index: 680,
                        },
                        identifierName: 'data',
                      },
                      name: 'data',
                    },
                  },
                },
                {
                  type: 'SpreadElement',
                  start: 690,
                  end: 712,
                  loc: {
                    start: {
                      line: 25,
                      column: 8,
                      index: 690,
                    },
                    end: {
                      line: 25,
                      column: 30,
                      index: 712,
                    },
                  },
                  argument: {
                    type: 'MemberExpression',
                    start: 693,
                    end: 712,
                    loc: {
                      start: {
                        line: 25,
                        column: 11,
                        index: 693,
                      },
                      end: {
                        line: 25,
                        column: 30,
                        index: 712,
                      },
                    },
                    object: {
                      type: 'Identifier',
                      start: 693,
                      end: 698,
                      loc: {
                        start: {
                          line: 25,
                          column: 11,
                          index: 693,
                        },
                        end: {
                          line: 25,
                          column: 16,
                          index: 698,
                        },
                        identifierName: 'state',
                      },
                      name: 'state',
                    },
                    computed: false,
                    property: {
                      type: 'Identifier',
                      start: 699,
                      end: 712,
                      loc: {
                        start: {
                          line: 25,
                          column: 17,
                          index: 699,
                        },
                        end: {
                          line: 25,
                          column: 30,
                          index: 712,
                        },
                        identifierName: 'overrideState',
                      },
                      name: 'overrideState',
                    },
                  },
                },
              ],
              extra: {
                trailingComma: 712,
              },
            },
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 734,
      end: 796,
      loc: {
        start: {
          line: 28,
          column: 4,
          index: 734,
        },
        end: {
          line: 30,
          column: 5,
          index: 796,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 738,
        end: 752,
        loc: {
          start: {
            line: 28,
            column: 8,
            index: 738,
          },
          end: {
            line: 28,
            column: 22,
            index: 752,
          },
          identifierName: 'contextContext',
        },
        name: 'contextContext',
      },
      computed: false,
      kind: 'get',
      id: null,
      generator: false,
      async: false,
      params: [],
      body: {
        type: 'BlockStatement',
        start: 755,
        end: 796,
        loc: {
          start: {
            line: 28,
            column: 25,
            index: 755,
          },
          end: {
            line: 30,
            column: 5,
            index: 796,
          },
        },
        body: [
          {
            type: 'ReturnStatement',
            start: 763,
            end: 790,
            loc: {
              start: {
                line: 29,
                column: 6,
                index: 763,
              },
              end: {
                line: 29,
                column: 33,
                index: 790,
              },
            },
            argument: {
              type: 'LogicalExpression',
              start: 770,
              end: 789,
              loc: {
                start: {
                  line: 29,
                  column: 13,
                  index: 770,
                },
                end: {
                  line: 29,
                  column: 32,
                  index: 789,
                },
              },
              left: {
                type: 'MemberExpression',
                start: 770,
                end: 783,
                loc: {
                  start: {
                    line: 29,
                    column: 13,
                    index: 770,
                  },
                  end: {
                    line: 29,
                    column: 26,
                    index: 783,
                  },
                },
                object: {
                  type: 'Identifier',
                  start: 770,
                  end: 775,
                  loc: {
                    start: {
                      line: 29,
                      column: 13,
                      index: 770,
                    },
                    end: {
                      line: 29,
                      column: 18,
                      index: 775,
                    },
                    identifierName: 'props',
                  },
                  name: 'props',
                },
                computed: false,
                property: {
                  type: 'Identifier',
                  start: 776,
                  end: 783,
                  loc: {
                    start: {
                      line: 29,
                      column: 19,
                      index: 776,
                    },
                    end: {
                      line: 29,
                      column: 26,
                      index: 783,
                    },
                    identifierName: 'context',
                  },
                  name: 'context',
                },
              },
              operator: '||',
              right: {
                type: 'ObjectExpression',
                start: 787,
                end: 789,
                loc: {
                  start: {
                    line: 29,
                    column: 30,
                    index: 787,
                  },
                  end: {
                    line: 29,
                    column: 32,
                    index: 789,
                  },
                },
                properties: [],
              },
            },
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 803,
      end: 1700,
      loc: {
        start: {
          line: 32,
          column: 4,
          index: 803,
        },
        end: {
          line: 53,
          column: 5,
          index: 1700,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 807,
        end: 830,
        loc: {
          start: {
            line: 32,
            column: 8,
            index: 807,
          },
          end: {
            line: 32,
            column: 31,
            index: 830,
          },
          identifierName: 'allRegisteredComponents',
        },
        name: 'allRegisteredComponents',
      },
      computed: false,
      kind: 'get',
      id: null,
      generator: false,
      async: false,
      params: [],
      returnType: {
        type: 'TSTypeAnnotation',
        start: 832,
        end: 854,
        loc: {
          start: {
            line: 32,
            column: 33,
            index: 832,
          },
          end: {
            line: 32,
            column: 55,
            index: 854,
          },
        },
        typeAnnotation: {
          type: 'TSTypeReference',
          start: 834,
          end: 854,
          loc: {
            start: {
              line: 32,
              column: 35,
              index: 834,
            },
            end: {
              line: 32,
              column: 55,
              index: 854,
            },
          },
          typeName: {
            type: 'Identifier',
            start: 834,
            end: 854,
            loc: {
              start: {
                line: 32,
                column: 35,
                index: 834,
              },
              end: {
                line: 32,
                column: 55,
                index: 854,
              },
              identifierName: 'RegisteredComponents',
            },
            name: 'RegisteredComponents',
          },
        },
      },
      body: {
        type: 'BlockStatement',
        start: 855,
        end: 1700,
        loc: {
          start: {
            line: 32,
            column: 56,
            index: 855,
          },
          end: {
            line: 53,
            column: 5,
            index: 1700,
          },
        },
        body: [
          {
            type: 'VariableDeclaration',
            start: 863,
            end: 1480,
            loc: {
              start: {
                line: 33,
                column: 6,
                index: 863,
              },
              end: {
                line: 42,
                column: 8,
                index: 1480,
              },
            },
            declarations: [
              {
                type: 'VariableDeclarator',
                start: 869,
                end: 1479,
                loc: {
                  start: {
                    line: 33,
                    column: 12,
                    index: 869,
                  },
                  end: {
                    line: 42,
                    column: 7,
                    index: 1479,
                  },
                },
                id: {
                  type: 'Identifier',
                  start: 869,
                  end: 887,
                  loc: {
                    start: {
                      line: 33,
                      column: 12,
                      index: 869,
                    },
                    end: {
                      line: 33,
                      column: 30,
                      index: 887,
                    },
                    identifierName: 'allComponentsArray',
                  },
                  name: 'allComponentsArray',
                },
                init: {
                  type: 'ArrayExpression',
                  start: 890,
                  end: 1479,
                  loc: {
                    start: {
                      line: 33,
                      column: 33,
                      index: 890,
                    },
                    end: {
                      line: 42,
                      column: 7,
                      index: 1479,
                    },
                  },
                  extra: {
                    trailingComma: 1470,
                  },
                  elements: [
                    {
                      type: 'SpreadElement',
                      start: 900,
                      end: 935,
                      loc: {
                        start: {
                          line: 34,
                          column: 8,
                          index: 900,
                        },
                        end: {
                          line: 34,
                          column: 43,
                          index: 935,
                        },
                      },
                      argument: {
                        type: 'CallExpression',
                        start: 903,
                        end: 935,
                        loc: {
                          start: {
                            line: 34,
                            column: 11,
                            index: 903,
                          },
                          end: {
                            line: 34,
                            column: 43,
                            index: 935,
                          },
                        },
                        callee: {
                          type: 'Identifier',
                          start: 903,
                          end: 933,
                          loc: {
                            start: {
                              line: 34,
                              column: 11,
                              index: 903,
                            },
                            end: {
                              line: 34,
                              column: 41,
                              index: 933,
                            },
                            identifierName: 'getDefaultRegisteredComponents',
                          },
                          name: 'getDefaultRegisteredComponents',
                        },
                        arguments: [],
                      },
                    },
                    {
                      type: 'SpreadElement',
                      start: 1414,
                      end: 1427,
                      loc: {
                        start: {
                          line: 40,
                          column: 8,
                          index: 1414,
                        },
                        end: {
                          line: 40,
                          column: 21,
                          index: 1427,
                        },
                      },
                      argument: {
                        type: 'Identifier',
                        start: 1417,
                        end: 1427,
                        loc: {
                          start: {
                            line: 40,
                            column: 11,
                            index: 1417,
                          },
                          end: {
                            line: 40,
                            column: 21,
                            index: 1427,
                          },
                          identifierName: 'components',
                        },
                        name: 'components',
                      },
                      leadingComments: [
                        {
                          type: 'CommentLine',
                          value:
                            ' While this `components` object is deprecated, we must maintain support for it.',
                          start: 945,
                          end: 1026,
                          loc: {
                            start: {
                              line: 35,
                              column: 8,
                              index: 945,
                            },
                            end: {
                              line: 35,
                              column: 89,
                              index: 1026,
                            },
                          },
                        },
                        {
                          type: 'CommentLine',
                          value:
                            ' Since users are able to override our default components, we need to make sure that we do not break such',
                          start: 1035,
                          end: 1141,
                          loc: {
                            start: {
                              line: 36,
                              column: 8,
                              index: 1035,
                            },
                            end: {
                              line: 36,
                              column: 114,
                              index: 1141,
                            },
                          },
                        },
                        {
                          type: 'CommentLine',
                          value: ' existing usage.',
                          start: 1150,
                          end: 1168,
                          loc: {
                            start: {
                              line: 37,
                              column: 8,
                              index: 1150,
                            },
                            end: {
                              line: 37,
                              column: 26,
                              index: 1168,
                            },
                          },
                        },
                        {
                          type: 'CommentLine',
                          value:
                            ' This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,',
                          start: 1177,
                          end: 1296,
                          loc: {
                            start: {
                              line: 38,
                              column: 8,
                              index: 1177,
                            },
                            end: {
                              line: 38,
                              column: 127,
                              index: 1296,
                            },
                          },
                        },
                        {
                          type: 'CommentLine',
                          value:
                            ' which is the new standard way of providing custom components, and must therefore take precedence.',
                          start: 1305,
                          end: 1405,
                          loc: {
                            start: {
                              line: 39,
                              column: 8,
                              index: 1305,
                            },
                            end: {
                              line: 39,
                              column: 108,
                              index: 1405,
                            },
                          },
                        },
                      ],
                    },
                    {
                      type: 'SpreadElement',
                      start: 1437,
                      end: 1470,
                      loc: {
                        start: {
                          line: 41,
                          column: 8,
                          index: 1437,
                        },
                        end: {
                          line: 41,
                          column: 41,
                          index: 1470,
                        },
                      },
                      argument: {
                        type: 'LogicalExpression',
                        start: 1441,
                        end: 1469,
                        loc: {
                          start: {
                            line: 41,
                            column: 12,
                            index: 1441,
                          },
                          end: {
                            line: 41,
                            column: 40,
                            index: 1469,
                          },
                        },
                        left: {
                          type: 'MemberExpression',
                          start: 1441,
                          end: 1463,
                          loc: {
                            start: {
                              line: 41,
                              column: 12,
                              index: 1441,
                            },
                            end: {
                              line: 41,
                              column: 34,
                              index: 1463,
                            },
                          },
                          object: {
                            type: 'Identifier',
                            start: 1441,
                            end: 1446,
                            loc: {
                              start: {
                                line: 41,
                                column: 12,
                                index: 1441,
                              },
                              end: {
                                line: 41,
                                column: 17,
                                index: 1446,
                              },
                              identifierName: 'props',
                            },
                            name: 'props',
                          },
                          computed: false,
                          property: {
                            type: 'Identifier',
                            start: 1447,
                            end: 1463,
                            loc: {
                              start: {
                                line: 41,
                                column: 18,
                                index: 1447,
                              },
                              end: {
                                line: 41,
                                column: 34,
                                index: 1463,
                              },
                              identifierName: 'customComponents',
                            },
                            name: 'customComponents',
                          },
                        },
                        operator: '||',
                        right: {
                          type: 'ArrayExpression',
                          start: 1467,
                          end: 1469,
                          loc: {
                            start: {
                              line: 41,
                              column: 38,
                              index: 1467,
                            },
                            end: {
                              line: 41,
                              column: 40,
                              index: 1469,
                            },
                          },
                          elements: [],
                        },
                        extra: {
                          parenthesized: true,
                          parenStart: 1440,
                        },
                      },
                    },
                  ],
                },
              },
            ],
            kind: 'const',
          },
          {
            type: 'VariableDeclaration',
            start: 1488,
            end: 1665,
            loc: {
              start: {
                line: 44,
                column: 6,
                index: 1488,
              },
              end: {
                line: 50,
                column: 8,
                index: 1665,
              },
            },
            declarations: [
              {
                type: 'VariableDeclarator',
                start: 1494,
                end: 1664,
                loc: {
                  start: {
                    line: 44,
                    column: 12,
                    index: 1494,
                  },
                  end: {
                    line: 50,
                    column: 7,
                    index: 1664,
                  },
                },
                id: {
                  type: 'Identifier',
                  start: 1494,
                  end: 1507,
                  loc: {
                    start: {
                      line: 44,
                      column: 12,
                      index: 1494,
                    },
                    end: {
                      line: 44,
                      column: 25,
                      index: 1507,
                    },
                    identifierName: 'allComponents',
                  },
                  name: 'allComponents',
                },
                init: {
                  type: 'CallExpression',
                  start: 1510,
                  end: 1664,
                  loc: {
                    start: {
                      line: 44,
                      column: 28,
                      index: 1510,
                    },
                    end: {
                      line: 50,
                      column: 7,
                      index: 1664,
                    },
                  },
                  callee: {
                    type: 'MemberExpression',
                    start: 1510,
                    end: 1535,
                    loc: {
                      start: {
                        line: 44,
                        column: 28,
                        index: 1510,
                      },
                      end: {
                        line: 44,
                        column: 53,
                        index: 1535,
                      },
                    },
                    object: {
                      type: 'Identifier',
                      start: 1510,
                      end: 1528,
                      loc: {
                        start: {
                          line: 44,
                          column: 28,
                          index: 1510,
                        },
                        end: {
                          line: 44,
                          column: 46,
                          index: 1528,
                        },
                        identifierName: 'allComponentsArray',
                      },
                      name: 'allComponentsArray',
                    },
                    computed: false,
                    property: {
                      type: 'Identifier',
                      start: 1529,
                      end: 1535,
                      loc: {
                        start: {
                          line: 44,
                          column: 47,
                          index: 1529,
                        },
                        end: {
                          line: 44,
                          column: 53,
                          index: 1535,
                        },
                        identifierName: 'reduce',
                      },
                      name: 'reduce',
                    },
                  },
                  arguments: [
                    {
                      type: 'ArrowFunctionExpression',
                      start: 1545,
                      end: 1620,
                      loc: {
                        start: {
                          line: 45,
                          column: 8,
                          index: 1545,
                        },
                        end: {
                          line: 48,
                          column: 10,
                          index: 1620,
                        },
                      },
                      id: null,
                      generator: false,
                      async: false,
                      params: [
                        {
                          type: 'Identifier',
                          start: 1546,
                          end: 1549,
                          loc: {
                            start: {
                              line: 45,
                              column: 9,
                              index: 1546,
                            },
                            end: {
                              line: 45,
                              column: 12,
                              index: 1549,
                            },
                            identifierName: 'acc',
                          },
                          name: 'acc',
                        },
                        {
                          type: 'Identifier',
                          start: 1551,
                          end: 1555,
                          loc: {
                            start: {
                              line: 45,
                              column: 14,
                              index: 1551,
                            },
                            end: {
                              line: 45,
                              column: 18,
                              index: 1555,
                            },
                            identifierName: 'curr',
                          },
                          name: 'curr',
                        },
                      ],
                      body: {
                        type: 'ObjectExpression',
                        start: 1561,
                        end: 1619,
                        loc: {
                          start: {
                            line: 45,
                            column: 24,
                            index: 1561,
                          },
                          end: {
                            line: 48,
                            column: 9,
                            index: 1619,
                          },
                        },
                        properties: [
                          {
                            type: 'SpreadElement',
                            start: 1573,
                            end: 1579,
                            loc: {
                              start: {
                                line: 46,
                                column: 10,
                                index: 1573,
                              },
                              end: {
                                line: 46,
                                column: 16,
                                index: 1579,
                              },
                            },
                            argument: {
                              type: 'Identifier',
                              start: 1576,
                              end: 1579,
                              loc: {
                                start: {
                                  line: 46,
                                  column: 13,
                                  index: 1576,
                                },
                                end: {
                                  line: 46,
                                  column: 16,
                                  index: 1579,
                                },
                                identifierName: 'acc',
                              },
                              name: 'acc',
                            },
                          },
                          {
                            type: 'ObjectProperty',
                            start: 1591,
                            end: 1608,
                            loc: {
                              start: {
                                line: 47,
                                column: 10,
                                index: 1591,
                              },
                              end: {
                                line: 47,
                                column: 27,
                                index: 1608,
                              },
                            },
                            method: false,
                            computed: true,
                            key: {
                              type: 'MemberExpression',
                              start: 1592,
                              end: 1601,
                              loc: {
                                start: {
                                  line: 47,
                                  column: 11,
                                  index: 1592,
                                },
                                end: {
                                  line: 47,
                                  column: 20,
                                  index: 1601,
                                },
                              },
                              object: {
                                type: 'Identifier',
                                start: 1592,
                                end: 1596,
                                loc: {
                                  start: {
                                    line: 47,
                                    column: 11,
                                    index: 1592,
                                  },
                                  end: {
                                    line: 47,
                                    column: 15,
                                    index: 1596,
                                  },
                                  identifierName: 'curr',
                                },
                                name: 'curr',
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 1597,
                                end: 1601,
                                loc: {
                                  start: {
                                    line: 47,
                                    column: 16,
                                    index: 1597,
                                  },
                                  end: {
                                    line: 47,
                                    column: 20,
                                    index: 1601,
                                  },
                                  identifierName: 'name',
                                },
                                name: 'name',
                              },
                            },
                            shorthand: false,
                            value: {
                              type: 'Identifier',
                              start: 1604,
                              end: 1608,
                              loc: {
                                start: {
                                  line: 47,
                                  column: 23,
                                  index: 1604,
                                },
                                end: {
                                  line: 47,
                                  column: 27,
                                  index: 1608,
                                },
                                identifierName: 'curr',
                              },
                              name: 'curr',
                            },
                          },
                        ],
                        extra: {
                          trailingComma: 1608,
                          parenthesized: true,
                          parenStart: 1560,
                        },
                      },
                    },
                    {
                      type: 'TSAsExpression',
                      start: 1630,
                      end: 1656,
                      loc: {
                        start: {
                          line: 49,
                          column: 8,
                          index: 1630,
                        },
                        end: {
                          line: 49,
                          column: 34,
                          index: 1656,
                        },
                      },
                      expression: {
                        type: 'ObjectExpression',
                        start: 1630,
                        end: 1632,
                        loc: {
                          start: {
                            line: 49,
                            column: 8,
                            index: 1630,
                          },
                          end: {
                            line: 49,
                            column: 10,
                            index: 1632,
                          },
                        },
                        properties: [],
                      },
                      typeAnnotation: {
                        type: 'TSTypeReference',
                        start: 1636,
                        end: 1656,
                        loc: {
                          start: {
                            line: 49,
                            column: 14,
                            index: 1636,
                          },
                          end: {
                            line: 49,
                            column: 34,
                            index: 1656,
                          },
                        },
                        typeName: {
                          type: 'Identifier',
                          start: 1636,
                          end: 1656,
                          loc: {
                            start: {
                              line: 49,
                              column: 14,
                              index: 1636,
                            },
                            end: {
                              line: 49,
                              column: 34,
                              index: 1656,
                            },
                            identifierName: 'RegisteredComponents',
                          },
                          name: 'RegisteredComponents',
                        },
                      },
                    },
                  ],
                },
              },
            ],
            kind: 'const',
          },
          {
            type: 'ReturnStatement',
            start: 1673,
            end: 1694,
            loc: {
              start: {
                line: 52,
                column: 6,
                index: 1673,
              },
              end: {
                line: 52,
                column: 27,
                index: 1694,
              },
            },
            argument: {
              type: 'Identifier',
              start: 1680,
              end: 1693,
              loc: {
                start: {
                  line: 52,
                  column: 13,
                  index: 1680,
                },
                end: {
                  line: 52,
                  column: 26,
                  index: 1693,
                },
                identifierName: 'allComponents',
              },
              name: 'allComponents',
            },
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 1707,
      end: 2397,
      loc: {
        start: {
          line: 55,
          column: 4,
          index: 1707,
        },
        end: {
          line: 80,
          column: 5,
          index: 2397,
        },
      },
      method: true,
      key: {
        type: 'Identifier',
        start: 1707,
        end: 1721,
        loc: {
          start: {
            line: 55,
            column: 4,
            index: 1707,
          },
          end: {
            line: 55,
            column: 18,
            index: 1721,
          },
          identifierName: 'processMessage',
        },
        name: 'processMessage',
      },
      computed: false,
      kind: 'method',
      id: null,
      generator: false,
      async: false,
      params: [
        {
          type: 'Identifier',
          start: 1722,
          end: 1741,
          loc: {
            start: {
              line: 55,
              column: 19,
              index: 1722,
            },
            end: {
              line: 55,
              column: 38,
              index: 1741,
            },
            identifierName: 'event',
          },
          name: 'event',
          typeAnnotation: {
            type: 'TSTypeAnnotation',
            start: 1727,
            end: 1741,
            loc: {
              start: {
                line: 55,
                column: 24,
                index: 1727,
              },
              end: {
                line: 55,
                column: 38,
                index: 1741,
              },
            },
            typeAnnotation: {
              type: 'TSTypeReference',
              start: 1729,
              end: 1741,
              loc: {
                start: {
                  line: 55,
                  column: 26,
                  index: 1729,
                },
                end: {
                  line: 55,
                  column: 38,
                  index: 1741,
                },
              },
              typeName: {
                type: 'Identifier',
                start: 1729,
                end: 1741,
                loc: {
                  start: {
                    line: 55,
                    column: 26,
                    index: 1729,
                  },
                  end: {
                    line: 55,
                    column: 38,
                    index: 1741,
                  },
                  identifierName: 'MessageEvent',
                },
                name: 'MessageEvent',
              },
            },
          },
        },
      ],
      returnType: {
        type: 'TSTypeAnnotation',
        start: 1742,
        end: 1748,
        loc: {
          start: {
            line: 55,
            column: 39,
            index: 1742,
          },
          end: {
            line: 55,
            column: 45,
            index: 1748,
          },
        },
        typeAnnotation: {
          type: 'TSVoidKeyword',
          start: 1744,
          end: 1748,
          loc: {
            start: {
              line: 55,
              column: 41,
              index: 1744,
            },
            end: {
              line: 55,
              column: 45,
              index: 1748,
            },
          },
        },
      },
      body: {
        type: 'BlockStatement',
        start: 1749,
        end: 2397,
        loc: {
          start: {
            line: 55,
            column: 46,
            index: 1749,
          },
          end: {
            line: 80,
            column: 5,
            index: 2397,
          },
        },
        body: [
          {
            type: 'VariableDeclaration',
            start: 1757,
            end: 1780,
            loc: {
              start: {
                line: 56,
                column: 6,
                index: 1757,
              },
              end: {
                line: 56,
                column: 29,
                index: 1780,
              },
            },
            declarations: [
              {
                type: 'VariableDeclarator',
                start: 1763,
                end: 1779,
                loc: {
                  start: {
                    line: 56,
                    column: 12,
                    index: 1763,
                  },
                  end: {
                    line: 56,
                    column: 28,
                    index: 1779,
                  },
                },
                id: {
                  type: 'ObjectPattern',
                  start: 1763,
                  end: 1771,
                  loc: {
                    start: {
                      line: 56,
                      column: 12,
                      index: 1763,
                    },
                    end: {
                      line: 56,
                      column: 20,
                      index: 1771,
                    },
                  },
                  properties: [
                    {
                      type: 'ObjectProperty',
                      start: 1765,
                      end: 1769,
                      loc: {
                        start: {
                          line: 56,
                          column: 14,
                          index: 1765,
                        },
                        end: {
                          line: 56,
                          column: 18,
                          index: 1769,
                        },
                      },
                      key: {
                        type: 'Identifier',
                        start: 1765,
                        end: 1769,
                        loc: {
                          start: {
                            line: 56,
                            column: 14,
                            index: 1765,
                          },
                          end: {
                            line: 56,
                            column: 18,
                            index: 1769,
                          },
                          identifierName: 'data',
                        },
                        name: 'data',
                      },
                      computed: false,
                      method: false,
                      shorthand: true,
                      value: {
                        type: 'Identifier',
                        start: 1765,
                        end: 1769,
                        loc: {
                          start: {
                            line: 56,
                            column: 14,
                            index: 1765,
                          },
                          end: {
                            line: 56,
                            column: 18,
                            index: 1769,
                          },
                          identifierName: 'data',
                        },
                        name: 'data',
                      },
                      extra: {
                        shorthand: true,
                      },
                    },
                  ],
                },
                init: {
                  type: 'Identifier',
                  start: 1774,
                  end: 1779,
                  loc: {
                    start: {
                      line: 56,
                      column: 23,
                      index: 1774,
                    },
                    end: {
                      line: 56,
                      column: 28,
                      index: 1779,
                    },
                    identifierName: 'event',
                  },
                  name: 'event',
                },
              },
            ],
            kind: 'const',
          },
          {
            type: 'IfStatement',
            start: 1787,
            end: 2391,
            loc: {
              start: {
                line: 57,
                column: 6,
                index: 1787,
              },
              end: {
                line: 79,
                column: 7,
                index: 2391,
              },
            },
            test: {
              type: 'Identifier',
              start: 1791,
              end: 1795,
              loc: {
                start: {
                  line: 57,
                  column: 10,
                  index: 1791,
                },
                end: {
                  line: 57,
                  column: 14,
                  index: 1795,
                },
                identifierName: 'data',
              },
              name: 'data',
            },
            consequent: {
              type: 'BlockStatement',
              start: 1797,
              end: 2391,
              loc: {
                start: {
                  line: 57,
                  column: 16,
                  index: 1797,
                },
                end: {
                  line: 79,
                  column: 7,
                  index: 2391,
                },
              },
              body: [
                {
                  type: 'SwitchStatement',
                  start: 1807,
                  end: 2383,
                  loc: {
                    start: {
                      line: 58,
                      column: 8,
                      index: 1807,
                    },
                    end: {
                      line: 78,
                      column: 9,
                      index: 2383,
                    },
                  },
                  discriminant: {
                    type: 'MemberExpression',
                    start: 1815,
                    end: 1824,
                    loc: {
                      start: {
                        line: 58,
                        column: 16,
                        index: 1815,
                      },
                      end: {
                        line: 58,
                        column: 25,
                        index: 1824,
                      },
                    },
                    object: {
                      type: 'Identifier',
                      start: 1815,
                      end: 1819,
                      loc: {
                        start: {
                          line: 58,
                          column: 16,
                          index: 1815,
                        },
                        end: {
                          line: 58,
                          column: 20,
                          index: 1819,
                        },
                        identifierName: 'data',
                      },
                      name: 'data',
                    },
                    computed: false,
                    property: {
                      type: 'Identifier',
                      start: 1820,
                      end: 1824,
                      loc: {
                        start: {
                          line: 58,
                          column: 21,
                          index: 1820,
                        },
                        end: {
                          line: 58,
                          column: 25,
                          index: 1824,
                        },
                        identifierName: 'type',
                      },
                      name: 'type',
                    },
                  },
                  cases: [
                    {
                      type: 'SwitchCase',
                      start: 1838,
                      end: 2281,
                      loc: {
                        start: {
                          line: 59,
                          column: 10,
                          index: 1838,
                        },
                        end: {
                          line: 73,
                          column: 11,
                          index: 2281,
                        },
                      },
                      consequent: [
                        {
                          type: 'BlockStatement',
                          start: 1868,
                          end: 2281,
                          loc: {
                            start: {
                              line: 59,
                              column: 40,
                              index: 1868,
                            },
                            end: {
                              line: 73,
                              column: 11,
                              index: 2281,
                            },
                          },
                          body: [
                            {
                              type: 'VariableDeclaration',
                              start: 1882,
                              end: 1915,
                              loc: {
                                start: {
                                  line: 60,
                                  column: 12,
                                  index: 1882,
                                },
                                end: {
                                  line: 60,
                                  column: 45,
                                  index: 1915,
                                },
                              },
                              declarations: [
                                {
                                  type: 'VariableDeclarator',
                                  start: 1888,
                                  end: 1914,
                                  loc: {
                                    start: {
                                      line: 60,
                                      column: 18,
                                      index: 1888,
                                    },
                                    end: {
                                      line: 60,
                                      column: 44,
                                      index: 1914,
                                    },
                                  },
                                  id: {
                                    type: 'Identifier',
                                    start: 1888,
                                    end: 1902,
                                    loc: {
                                      start: {
                                        line: 60,
                                        column: 18,
                                        index: 1888,
                                      },
                                      end: {
                                        line: 60,
                                        column: 32,
                                        index: 1902,
                                      },
                                      identifierName: 'messageContent',
                                    },
                                    name: 'messageContent',
                                  },
                                  init: {
                                    type: 'MemberExpression',
                                    start: 1905,
                                    end: 1914,
                                    loc: {
                                      start: {
                                        line: 60,
                                        column: 35,
                                        index: 1905,
                                      },
                                      end: {
                                        line: 60,
                                        column: 44,
                                        index: 1914,
                                      },
                                    },
                                    object: {
                                      type: 'Identifier',
                                      start: 1905,
                                      end: 1909,
                                      loc: {
                                        start: {
                                          line: 60,
                                          column: 35,
                                          index: 1905,
                                        },
                                        end: {
                                          line: 60,
                                          column: 39,
                                          index: 1909,
                                        },
                                        identifierName: 'data',
                                      },
                                      name: 'data',
                                    },
                                    computed: false,
                                    property: {
                                      type: 'Identifier',
                                      start: 1910,
                                      end: 1914,
                                      loc: {
                                        start: {
                                          line: 60,
                                          column: 40,
                                          index: 1910,
                                        },
                                        end: {
                                          line: 60,
                                          column: 44,
                                          index: 1914,
                                        },
                                        identifierName: 'data',
                                      },
                                      name: 'data',
                                    },
                                  },
                                },
                              ],
                              kind: 'const',
                            },
                            {
                              type: 'VariableDeclaration',
                              start: 1928,
                              end: 2091,
                              loc: {
                                start: {
                                  line: 61,
                                  column: 12,
                                  index: 1928,
                                },
                                end: {
                                  line: 65,
                                  column: 39,
                                  index: 2091,
                                },
                              },
                              declarations: [
                                {
                                  type: 'VariableDeclarator',
                                  start: 1934,
                                  end: 2090,
                                  loc: {
                                    start: {
                                      line: 61,
                                      column: 18,
                                      index: 1934,
                                    },
                                    end: {
                                      line: 65,
                                      column: 38,
                                      index: 2090,
                                    },
                                  },
                                  id: {
                                    type: 'Identifier',
                                    start: 1934,
                                    end: 1937,
                                    loc: {
                                      start: {
                                        line: 61,
                                        column: 18,
                                        index: 1934,
                                      },
                                      end: {
                                        line: 61,
                                        column: 21,
                                        index: 1937,
                                      },
                                      identifierName: 'key',
                                    },
                                    name: 'key',
                                  },
                                  init: {
                                    type: 'LogicalExpression',
                                    start: 1954,
                                    end: 2090,
                                    loc: {
                                      start: {
                                        line: 62,
                                        column: 14,
                                        index: 1954,
                                      },
                                      end: {
                                        line: 65,
                                        column: 38,
                                        index: 2090,
                                      },
                                    },
                                    left: {
                                      type: 'LogicalExpression',
                                      start: 1954,
                                      end: 2048,
                                      loc: {
                                        start: {
                                          line: 62,
                                          column: 14,
                                          index: 1954,
                                        },
                                        end: {
                                          line: 64,
                                          column: 34,
                                          index: 2048,
                                        },
                                      },
                                      left: {
                                        type: 'LogicalExpression',
                                        start: 1954,
                                        end: 2010,
                                        loc: {
                                          start: {
                                            line: 62,
                                            column: 14,
                                            index: 1954,
                                          },
                                          end: {
                                            line: 63,
                                            column: 34,
                                            index: 2010,
                                          },
                                        },
                                        left: {
                                          type: 'MemberExpression',
                                          start: 1954,
                                          end: 1972,
                                          loc: {
                                            start: {
                                              line: 62,
                                              column: 14,
                                              index: 1954,
                                            },
                                            end: {
                                              line: 62,
                                              column: 32,
                                              index: 1972,
                                            },
                                          },
                                          object: {
                                            type: 'Identifier',
                                            start: 1954,
                                            end: 1968,
                                            loc: {
                                              start: {
                                                line: 62,
                                                column: 14,
                                                index: 1954,
                                              },
                                              end: {
                                                line: 62,
                                                column: 28,
                                                index: 1968,
                                              },
                                              identifierName: 'messageContent',
                                            },
                                            name: 'messageContent',
                                          },
                                          computed: false,
                                          property: {
                                            type: 'Identifier',
                                            start: 1969,
                                            end: 1972,
                                            loc: {
                                              start: {
                                                line: 62,
                                                column: 29,
                                                index: 1969,
                                              },
                                              end: {
                                                line: 62,
                                                column: 32,
                                                index: 1972,
                                              },
                                              identifierName: 'key',
                                            },
                                            name: 'key',
                                          },
                                        },
                                        operator: '||',
                                        right: {
                                          type: 'MemberExpression',
                                          start: 1990,
                                          end: 2010,
                                          loc: {
                                            start: {
                                              line: 63,
                                              column: 14,
                                              index: 1990,
                                            },
                                            end: {
                                              line: 63,
                                              column: 34,
                                              index: 2010,
                                            },
                                          },
                                          object: {
                                            type: 'Identifier',
                                            start: 1990,
                                            end: 2004,
                                            loc: {
                                              start: {
                                                line: 63,
                                                column: 14,
                                                index: 1990,
                                              },
                                              end: {
                                                line: 63,
                                                column: 28,
                                                index: 2004,
                                              },
                                              identifierName: 'messageContent',
                                            },
                                            name: 'messageContent',
                                          },
                                          computed: false,
                                          property: {
                                            type: 'Identifier',
                                            start: 2005,
                                            end: 2010,
                                            loc: {
                                              start: {
                                                line: 63,
                                                column: 29,
                                                index: 2005,
                                              },
                                              end: {
                                                line: 63,
                                                column: 34,
                                                index: 2010,
                                              },
                                              identifierName: 'alias',
                                            },
                                            name: 'alias',
                                          },
                                        },
                                      },
                                      operator: '||',
                                      right: {
                                        type: 'MemberExpression',
                                        start: 2028,
                                        end: 2048,
                                        loc: {
                                          start: {
                                            line: 64,
                                            column: 14,
                                            index: 2028,
                                          },
                                          end: {
                                            line: 64,
                                            column: 34,
                                            index: 2048,
                                          },
                                        },
                                        object: {
                                          type: 'Identifier',
                                          start: 2028,
                                          end: 2042,
                                          loc: {
                                            start: {
                                              line: 64,
                                              column: 14,
                                              index: 2028,
                                            },
                                            end: {
                                              line: 64,
                                              column: 28,
                                              index: 2042,
                                            },
                                            identifierName: 'messageContent',
                                          },
                                          name: 'messageContent',
                                        },
                                        computed: false,
                                        property: {
                                          type: 'Identifier',
                                          start: 2043,
                                          end: 2048,
                                          loc: {
                                            start: {
                                              line: 64,
                                              column: 29,
                                              index: 2043,
                                            },
                                            end: {
                                              line: 64,
                                              column: 34,
                                              index: 2048,
                                            },
                                            identifierName: 'entry',
                                          },
                                          name: 'entry',
                                        },
                                      },
                                    },
                                    operator: '||',
                                    right: {
                                      type: 'MemberExpression',
                                      start: 2066,
                                      end: 2090,
                                      loc: {
                                        start: {
                                          line: 65,
                                          column: 14,
                                          index: 2066,
                                        },
                                        end: {
                                          line: 65,
                                          column: 38,
                                          index: 2090,
                                        },
                                      },
                                      object: {
                                        type: 'Identifier',
                                        start: 2066,
                                        end: 2080,
                                        loc: {
                                          start: {
                                            line: 65,
                                            column: 14,
                                            index: 2066,
                                          },
                                          end: {
                                            line: 65,
                                            column: 28,
                                            index: 2080,
                                          },
                                          identifierName: 'messageContent',
                                        },
                                        name: 'messageContent',
                                      },
                                      computed: false,
                                      property: {
                                        type: 'Identifier',
                                        start: 2081,
                                        end: 2090,
                                        loc: {
                                          start: {
                                            line: 65,
                                            column: 29,
                                            index: 2081,
                                          },
                                          end: {
                                            line: 65,
                                            column: 38,
                                            index: 2090,
                                          },
                                          identifierName: 'modelName',
                                        },
                                        name: 'modelName',
                                      },
                                    },
                                  },
                                },
                              ],
                              kind: 'const',
                            },
                            {
                              type: 'VariableDeclaration',
                              start: 2105,
                              end: 2145,
                              loc: {
                                start: {
                                  line: 67,
                                  column: 12,
                                  index: 2105,
                                },
                                end: {
                                  line: 67,
                                  column: 52,
                                  index: 2145,
                                },
                              },
                              declarations: [
                                {
                                  type: 'VariableDeclarator',
                                  start: 2111,
                                  end: 2144,
                                  loc: {
                                    start: {
                                      line: 67,
                                      column: 18,
                                      index: 2111,
                                    },
                                    end: {
                                      line: 67,
                                      column: 51,
                                      index: 2144,
                                    },
                                  },
                                  id: {
                                    type: 'Identifier',
                                    start: 2111,
                                    end: 2122,
                                    loc: {
                                      start: {
                                        line: 67,
                                        column: 18,
                                        index: 2111,
                                      },
                                      end: {
                                        line: 67,
                                        column: 29,
                                        index: 2122,
                                      },
                                      identifierName: 'contentData',
                                    },
                                    name: 'contentData',
                                  },
                                  init: {
                                    type: 'MemberExpression',
                                    start: 2125,
                                    end: 2144,
                                    loc: {
                                      start: {
                                        line: 67,
                                        column: 32,
                                        index: 2125,
                                      },
                                      end: {
                                        line: 67,
                                        column: 51,
                                        index: 2144,
                                      },
                                    },
                                    object: {
                                      type: 'Identifier',
                                      start: 2125,
                                      end: 2139,
                                      loc: {
                                        start: {
                                          line: 67,
                                          column: 32,
                                          index: 2125,
                                        },
                                        end: {
                                          line: 67,
                                          column: 46,
                                          index: 2139,
                                        },
                                        identifierName: 'messageContent',
                                      },
                                      name: 'messageContent',
                                    },
                                    computed: false,
                                    property: {
                                      type: 'Identifier',
                                      start: 2140,
                                      end: 2144,
                                      loc: {
                                        start: {
                                          line: 67,
                                          column: 47,
                                          index: 2140,
                                        },
                                        end: {
                                          line: 67,
                                          column: 51,
                                          index: 2144,
                                        },
                                        identifierName: 'data',
                                      },
                                      name: 'data',
                                    },
                                  },
                                },
                              ],
                              kind: 'const',
                            },
                            {
                              type: 'IfStatement',
                              start: 2159,
                              end: 2250,
                              loc: {
                                start: {
                                  line: 69,
                                  column: 12,
                                  index: 2159,
                                },
                                end: {
                                  line: 71,
                                  column: 13,
                                  index: 2250,
                                },
                              },
                              test: {
                                type: 'BinaryExpression',
                                start: 2163,
                                end: 2182,
                                loc: {
                                  start: {
                                    line: 69,
                                    column: 16,
                                    index: 2163,
                                  },
                                  end: {
                                    line: 69,
                                    column: 35,
                                    index: 2182,
                                  },
                                },
                                left: {
                                  type: 'Identifier',
                                  start: 2163,
                                  end: 2166,
                                  loc: {
                                    start: {
                                      line: 69,
                                      column: 16,
                                      index: 2163,
                                    },
                                    end: {
                                      line: 69,
                                      column: 19,
                                      index: 2166,
                                    },
                                    identifierName: 'key',
                                  },
                                  name: 'key',
                                },
                                operator: '===',
                                right: {
                                  type: 'MemberExpression',
                                  start: 2171,
                                  end: 2182,
                                  loc: {
                                    start: {
                                      line: 69,
                                      column: 24,
                                      index: 2171,
                                    },
                                    end: {
                                      line: 69,
                                      column: 35,
                                      index: 2182,
                                    },
                                  },
                                  object: {
                                    type: 'Identifier',
                                    start: 2171,
                                    end: 2176,
                                    loc: {
                                      start: {
                                        line: 69,
                                        column: 24,
                                        index: 2171,
                                      },
                                      end: {
                                        line: 69,
                                        column: 29,
                                        index: 2176,
                                      },
                                      identifierName: 'props',
                                    },
                                    name: 'props',
                                  },
                                  computed: false,
                                  property: {
                                    type: 'Identifier',
                                    start: 2177,
                                    end: 2182,
                                    loc: {
                                      start: {
                                        line: 69,
                                        column: 30,
                                        index: 2177,
                                      },
                                      end: {
                                        line: 69,
                                        column: 35,
                                        index: 2182,
                                      },
                                      identifierName: 'model',
                                    },
                                    name: 'model',
                                  },
                                },
                              },
                              consequent: {
                                type: 'BlockStatement',
                                start: 2184,
                                end: 2250,
                                loc: {
                                  start: {
                                    line: 69,
                                    column: 37,
                                    index: 2184,
                                  },
                                  end: {
                                    line: 71,
                                    column: 13,
                                    index: 2250,
                                  },
                                },
                                body: [
                                  {
                                    type: 'ExpressionStatement',
                                    start: 2200,
                                    end: 2236,
                                    loc: {
                                      start: {
                                        line: 70,
                                        column: 14,
                                        index: 2200,
                                      },
                                      end: {
                                        line: 70,
                                        column: 50,
                                        index: 2236,
                                      },
                                    },
                                    expression: {
                                      type: 'AssignmentExpression',
                                      start: 2200,
                                      end: 2235,
                                      loc: {
                                        start: {
                                          line: 70,
                                          column: 14,
                                          index: 2200,
                                        },
                                        end: {
                                          line: 70,
                                          column: 49,
                                          index: 2235,
                                        },
                                      },
                                      operator: '=',
                                      left: {
                                        type: 'MemberExpression',
                                        start: 2200,
                                        end: 2221,
                                        loc: {
                                          start: {
                                            line: 70,
                                            column: 14,
                                            index: 2200,
                                          },
                                          end: {
                                            line: 70,
                                            column: 35,
                                            index: 2221,
                                          },
                                        },
                                        object: {
                                          type: 'Identifier',
                                          start: 2200,
                                          end: 2205,
                                          loc: {
                                            start: {
                                              line: 70,
                                              column: 14,
                                              index: 2200,
                                            },
                                            end: {
                                              line: 70,
                                              column: 19,
                                              index: 2205,
                                            },
                                            identifierName: 'state',
                                          },
                                          name: 'state',
                                        },
                                        computed: false,
                                        property: {
                                          type: 'Identifier',
                                          start: 2206,
                                          end: 2221,
                                          loc: {
                                            start: {
                                              line: 70,
                                              column: 20,
                                              index: 2206,
                                            },
                                            end: {
                                              line: 70,
                                              column: 35,
                                              index: 2221,
                                            },
                                            identifierName: 'overrideContent',
                                          },
                                          name: 'overrideContent',
                                        },
                                      },
                                      right: {
                                        type: 'Identifier',
                                        start: 2224,
                                        end: 2235,
                                        loc: {
                                          start: {
                                            line: 70,
                                            column: 38,
                                            index: 2224,
                                          },
                                          end: {
                                            line: 70,
                                            column: 49,
                                            index: 2235,
                                          },
                                          identifierName: 'contentData',
                                        },
                                        name: 'contentData',
                                      },
                                    },
                                  },
                                ],
                                directives: [],
                              },
                              alternate: null,
                            },
                            {
                              type: 'BreakStatement',
                              start: 2263,
                              end: 2269,
                              loc: {
                                start: {
                                  line: 72,
                                  column: 12,
                                  index: 2263,
                                },
                                end: {
                                  line: 72,
                                  column: 18,
                                  index: 2269,
                                },
                              },
                              label: null,
                            },
                          ],
                          directives: [],
                        },
                      ],
                      test: {
                        type: 'StringLiteral',
                        start: 1843,
                        end: 1866,
                        loc: {
                          start: {
                            line: 59,
                            column: 15,
                            index: 1843,
                          },
                          end: {
                            line: 59,
                            column: 38,
                            index: 1866,
                          },
                        },
                        extra: {
                          rawValue: 'builder.contentUpdate',
                          raw: "'builder.contentUpdate'",
                        },
                        value: 'builder.contentUpdate',
                      },
                    },
                    {
                      type: 'SwitchCase',
                      start: 2292,
                      end: 2373,
                      loc: {
                        start: {
                          line: 74,
                          column: 10,
                          index: 2292,
                        },
                        end: {
                          line: 77,
                          column: 11,
                          index: 2373,
                        },
                      },
                      consequent: [
                        {
                          type: 'BlockStatement',
                          start: 2321,
                          end: 2373,
                          loc: {
                            start: {
                              line: 74,
                              column: 39,
                              index: 2321,
                            },
                            end: {
                              line: 77,
                              column: 11,
                              index: 2373,
                            },
                          },
                          body: [
                            {
                              type: 'BreakStatement',
                              start: 2355,
                              end: 2361,
                              loc: {
                                start: {
                                  line: 76,
                                  column: 12,
                                  index: 2355,
                                },
                                end: {
                                  line: 76,
                                  column: 18,
                                  index: 2361,
                                },
                              },
                              label: null,
                              leadingComments: [
                                {
                                  type: 'CommentLine',
                                  value: ' TODO',
                                  start: 2335,
                                  end: 2342,
                                  loc: {
                                    start: {
                                      line: 75,
                                      column: 12,
                                      index: 2335,
                                    },
                                    end: {
                                      line: 75,
                                      column: 19,
                                      index: 2342,
                                    },
                                  },
                                },
                              ],
                            },
                          ],
                          directives: [],
                        },
                      ],
                      test: {
                        type: 'StringLiteral',
                        start: 2297,
                        end: 2319,
                        loc: {
                          start: {
                            line: 74,
                            column: 15,
                            index: 2297,
                          },
                          end: {
                            line: 74,
                            column: 37,
                            index: 2319,
                          },
                        },
                        extra: {
                          rawValue: 'builder.patchUpdates',
                          raw: "'builder.patchUpdates'",
                        },
                        value: 'builder.patchUpdates',
                      },
                    },
                  ],
                },
              ],
              directives: [],
            },
            alternate: null,
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 2404,
      end: 2695,
      loc: {
        start: {
          line: 82,
          column: 4,
          index: 2404,
        },
        end: {
          line: 92,
          column: 5,
          index: 2695,
        },
      },
      method: true,
      key: {
        type: 'Identifier',
        start: 2404,
        end: 2418,
        loc: {
          start: {
            line: 82,
            column: 4,
            index: 2404,
          },
          end: {
            line: 82,
            column: 18,
            index: 2418,
          },
          identifierName: 'evaluateJsCode',
        },
        name: 'evaluateJsCode',
      },
      computed: false,
      kind: 'method',
      id: null,
      generator: false,
      async: false,
      params: [],
      body: {
        type: 'BlockStatement',
        start: 2421,
        end: 2695,
        loc: {
          start: {
            line: 82,
            column: 21,
            index: 2421,
          },
          end: {
            line: 92,
            column: 5,
            index: 2695,
          },
        },
        body: [
          {
            type: 'VariableDeclaration',
            start: 2482,
            end: 2528,
            loc: {
              start: {
                line: 84,
                column: 6,
                index: 2482,
              },
              end: {
                line: 84,
                column: 52,
                index: 2528,
              },
            },
            declarations: [
              {
                type: 'VariableDeclarator',
                start: 2488,
                end: 2527,
                loc: {
                  start: {
                    line: 84,
                    column: 12,
                    index: 2488,
                  },
                  end: {
                    line: 84,
                    column: 51,
                    index: 2527,
                  },
                },
                id: {
                  type: 'Identifier',
                  start: 2488,
                  end: 2494,
                  loc: {
                    start: {
                      line: 84,
                      column: 12,
                      index: 2488,
                    },
                    end: {
                      line: 84,
                      column: 18,
                      index: 2494,
                    },
                    identifierName: 'jsCode',
                  },
                  name: 'jsCode',
                },
                init: {
                  type: 'OptionalMemberExpression',
                  start: 2497,
                  end: 2527,
                  loc: {
                    start: {
                      line: 84,
                      column: 21,
                      index: 2497,
                    },
                    end: {
                      line: 84,
                      column: 51,
                      index: 2527,
                    },
                  },
                  object: {
                    type: 'OptionalMemberExpression',
                    start: 2497,
                    end: 2519,
                    loc: {
                      start: {
                        line: 84,
                        column: 21,
                        index: 2497,
                      },
                      end: {
                        line: 84,
                        column: 43,
                        index: 2519,
                      },
                    },
                    object: {
                      type: 'MemberExpression',
                      start: 2497,
                      end: 2513,
                      loc: {
                        start: {
                          line: 84,
                          column: 21,
                          index: 2497,
                        },
                        end: {
                          line: 84,
                          column: 37,
                          index: 2513,
                        },
                      },
                      object: {
                        type: 'Identifier',
                        start: 2497,
                        end: 2502,
                        loc: {
                          start: {
                            line: 84,
                            column: 21,
                            index: 2497,
                          },
                          end: {
                            line: 84,
                            column: 26,
                            index: 2502,
                          },
                          identifierName: 'state',
                        },
                        name: 'state',
                      },
                      computed: false,
                      property: {
                        type: 'Identifier',
                        start: 2503,
                        end: 2513,
                        loc: {
                          start: {
                            line: 84,
                            column: 27,
                            index: 2503,
                          },
                          end: {
                            line: 84,
                            column: 37,
                            index: 2513,
                          },
                          identifierName: 'useContent',
                        },
                        name: 'useContent',
                      },
                    },
                    computed: false,
                    property: {
                      type: 'Identifier',
                      start: 2515,
                      end: 2519,
                      loc: {
                        start: {
                          line: 84,
                          column: 39,
                          index: 2515,
                        },
                        end: {
                          line: 84,
                          column: 43,
                          index: 2519,
                        },
                        identifierName: 'data',
                      },
                      name: 'data',
                    },
                    optional: true,
                  },
                  computed: false,
                  property: {
                    type: 'Identifier',
                    start: 2521,
                    end: 2527,
                    loc: {
                      start: {
                        line: 84,
                        column: 45,
                        index: 2521,
                      },
                      end: {
                        line: 84,
                        column: 51,
                        index: 2527,
                      },
                      identifierName: 'jsCode',
                    },
                    name: 'jsCode',
                  },
                  optional: true,
                },
              },
            ],
            kind: 'const',
            leadingComments: [
              {
                type: 'CommentLine',
                value: ' run any dynamic JS code attached to content',
                start: 2429,
                end: 2475,
                loc: {
                  start: {
                    line: 83,
                    column: 6,
                    index: 2429,
                  },
                  end: {
                    line: 83,
                    column: 52,
                    index: 2475,
                  },
                },
              },
            ],
          },
          {
            type: 'IfStatement',
            start: 2535,
            end: 2689,
            loc: {
              start: {
                line: 85,
                column: 6,
                index: 2535,
              },
              end: {
                line: 91,
                column: 7,
                index: 2689,
              },
            },
            test: {
              type: 'Identifier',
              start: 2539,
              end: 2545,
              loc: {
                start: {
                  line: 85,
                  column: 10,
                  index: 2539,
                },
                end: {
                  line: 85,
                  column: 16,
                  index: 2545,
                },
                identifierName: 'jsCode',
              },
              name: 'jsCode',
            },
            consequent: {
              type: 'BlockStatement',
              start: 2547,
              end: 2689,
              loc: {
                start: {
                  line: 85,
                  column: 18,
                  index: 2547,
                },
                end: {
                  line: 91,
                  column: 7,
                  index: 2689,
                },
              },
              body: [
                {
                  type: 'ExpressionStatement',
                  start: 2557,
                  end: 2681,
                  loc: {
                    start: {
                      line: 86,
                      column: 8,
                      index: 2557,
                    },
                    end: {
                      line: 90,
                      column: 11,
                      index: 2681,
                    },
                  },
                  expression: {
                    type: 'CallExpression',
                    start: 2557,
                    end: 2680,
                    loc: {
                      start: {
                        line: 86,
                        column: 8,
                        index: 2557,
                      },
                      end: {
                        line: 90,
                        column: 10,
                        index: 2680,
                      },
                    },
                    callee: {
                      type: 'Identifier',
                      start: 2557,
                      end: 2565,
                      loc: {
                        start: {
                          line: 86,
                          column: 8,
                          index: 2557,
                        },
                        end: {
                          line: 86,
                          column: 16,
                          index: 2565,
                        },
                        identifierName: 'evaluate',
                      },
                      name: 'evaluate',
                    },
                    arguments: [
                      {
                        type: 'ObjectExpression',
                        start: 2566,
                        end: 2679,
                        loc: {
                          start: {
                            line: 86,
                            column: 17,
                            index: 2566,
                          },
                          end: {
                            line: 90,
                            column: 9,
                            index: 2679,
                          },
                        },
                        properties: [
                          {
                            type: 'ObjectProperty',
                            start: 2578,
                            end: 2590,
                            loc: {
                              start: {
                                line: 87,
                                column: 10,
                                index: 2578,
                              },
                              end: {
                                line: 87,
                                column: 22,
                                index: 2590,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 2578,
                              end: 2582,
                              loc: {
                                start: {
                                  line: 87,
                                  column: 10,
                                  index: 2578,
                                },
                                end: {
                                  line: 87,
                                  column: 14,
                                  index: 2582,
                                },
                                identifierName: 'code',
                              },
                              name: 'code',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'Identifier',
                              start: 2584,
                              end: 2590,
                              loc: {
                                start: {
                                  line: 87,
                                  column: 16,
                                  index: 2584,
                                },
                                end: {
                                  line: 87,
                                  column: 22,
                                  index: 2590,
                                },
                                identifierName: 'jsCode',
                              },
                              name: 'jsCode',
                            },
                          },
                          {
                            type: 'ObjectProperty',
                            start: 2602,
                            end: 2631,
                            loc: {
                              start: {
                                line: 88,
                                column: 10,
                                index: 2602,
                              },
                              end: {
                                line: 88,
                                column: 39,
                                index: 2631,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 2602,
                              end: 2609,
                              loc: {
                                start: {
                                  line: 88,
                                  column: 10,
                                  index: 2602,
                                },
                                end: {
                                  line: 88,
                                  column: 17,
                                  index: 2609,
                                },
                                identifierName: 'context',
                              },
                              name: 'context',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'MemberExpression',
                              start: 2611,
                              end: 2631,
                              loc: {
                                start: {
                                  line: 88,
                                  column: 19,
                                  index: 2611,
                                },
                                end: {
                                  line: 88,
                                  column: 39,
                                  index: 2631,
                                },
                              },
                              object: {
                                type: 'Identifier',
                                start: 2611,
                                end: 2616,
                                loc: {
                                  start: {
                                    line: 88,
                                    column: 19,
                                    index: 2611,
                                  },
                                  end: {
                                    line: 88,
                                    column: 24,
                                    index: 2616,
                                  },
                                  identifierName: 'state',
                                },
                                name: 'state',
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 2617,
                                end: 2631,
                                loc: {
                                  start: {
                                    line: 88,
                                    column: 25,
                                    index: 2617,
                                  },
                                  end: {
                                    line: 88,
                                    column: 39,
                                    index: 2631,
                                  },
                                  identifierName: 'contextContext',
                                },
                                name: 'contextContext',
                              },
                            },
                          },
                          {
                            type: 'ObjectProperty',
                            start: 2643,
                            end: 2668,
                            loc: {
                              start: {
                                line: 89,
                                column: 10,
                                index: 2643,
                              },
                              end: {
                                line: 89,
                                column: 35,
                                index: 2668,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 2643,
                              end: 2648,
                              loc: {
                                start: {
                                  line: 89,
                                  column: 10,
                                  index: 2643,
                                },
                                end: {
                                  line: 89,
                                  column: 15,
                                  index: 2648,
                                },
                                identifierName: 'state',
                              },
                              name: 'state',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'MemberExpression',
                              start: 2650,
                              end: 2668,
                              loc: {
                                start: {
                                  line: 89,
                                  column: 17,
                                  index: 2650,
                                },
                                end: {
                                  line: 89,
                                  column: 35,
                                  index: 2668,
                                },
                              },
                              object: {
                                type: 'Identifier',
                                start: 2650,
                                end: 2655,
                                loc: {
                                  start: {
                                    line: 89,
                                    column: 17,
                                    index: 2650,
                                  },
                                  end: {
                                    line: 89,
                                    column: 22,
                                    index: 2655,
                                  },
                                  identifierName: 'state',
                                },
                                name: 'state',
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 2656,
                                end: 2668,
                                loc: {
                                  start: {
                                    line: 89,
                                    column: 23,
                                    index: 2656,
                                  },
                                  end: {
                                    line: 89,
                                    column: 35,
                                    index: 2668,
                                  },
                                  identifierName: 'contentState',
                                },
                                name: 'contentState',
                              },
                            },
                          },
                        ],
                        extra: {
                          trailingComma: 2668,
                        },
                      },
                    ],
                  },
                },
              ],
              directives: [],
            },
            alternate: null,
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 2701,
      end: 2761,
      loc: {
        start: {
          line: 93,
          column: 4,
          index: 2701,
        },
        end: {
          line: 95,
          column: 5,
          index: 2761,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 2705,
        end: 2717,
        loc: {
          start: {
            line: 93,
            column: 8,
            index: 2705,
          },
          end: {
            line: 93,
            column: 20,
            index: 2717,
          },
          identifierName: 'httpReqsData',
        },
        name: 'httpReqsData',
      },
      computed: false,
      kind: 'get',
      id: null,
      generator: false,
      async: false,
      params: [],
      returnType: {
        type: 'TSTypeAnnotation',
        start: 2719,
        end: 2736,
        loc: {
          start: {
            line: 93,
            column: 22,
            index: 2719,
          },
          end: {
            line: 93,
            column: 39,
            index: 2736,
          },
        },
        typeAnnotation: {
          type: 'TSTypeReference',
          start: 2721,
          end: 2736,
          loc: {
            start: {
              line: 93,
              column: 24,
              index: 2721,
            },
            end: {
              line: 93,
              column: 39,
              index: 2736,
            },
          },
          typeName: {
            type: 'Identifier',
            start: 2721,
            end: 2731,
            loc: {
              start: {
                line: 93,
                column: 24,
                index: 2721,
              },
              end: {
                line: 93,
                column: 34,
                index: 2731,
              },
              identifierName: 'Dictionary',
            },
            name: 'Dictionary',
          },
          typeParameters: {
            type: 'TSTypeParameterInstantiation',
            start: 2731,
            end: 2736,
            loc: {
              start: {
                line: 93,
                column: 34,
                index: 2731,
              },
              end: {
                line: 93,
                column: 39,
                index: 2736,
              },
            },
            params: [
              {
                type: 'TSAnyKeyword',
                start: 2732,
                end: 2735,
                loc: {
                  start: {
                    line: 93,
                    column: 35,
                    index: 2732,
                  },
                  end: {
                    line: 93,
                    column: 38,
                    index: 2735,
                  },
                },
              },
            ],
          },
        },
      },
      body: {
        type: 'BlockStatement',
        start: 2737,
        end: 2761,
        loc: {
          start: {
            line: 93,
            column: 40,
            index: 2737,
          },
          end: {
            line: 95,
            column: 5,
            index: 2761,
          },
        },
        body: [
          {
            type: 'ReturnStatement',
            start: 2745,
            end: 2755,
            loc: {
              start: {
                line: 94,
                column: 6,
                index: 2745,
              },
              end: {
                line: 94,
                column: 16,
                index: 2755,
              },
            },
            argument: {
              type: 'ObjectExpression',
              start: 2752,
              end: 2754,
              loc: {
                start: {
                  line: 94,
                  column: 13,
                  index: 2752,
                },
                end: {
                  line: 94,
                  column: 15,
                  index: 2754,
                },
              },
              properties: [],
            },
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 2768,
      end: 3008,
      loc: {
        start: {
          line: 97,
          column: 4,
          index: 2768,
        },
        end: {
          line: 106,
          column: 5,
          index: 3008,
        },
      },
      method: true,
      key: {
        type: 'Identifier',
        start: 2768,
        end: 2775,
        loc: {
          start: {
            line: 97,
            column: 4,
            index: 2768,
          },
          end: {
            line: 97,
            column: 11,
            index: 2775,
          },
          identifierName: 'onClick',
        },
        name: 'onClick',
      },
      computed: false,
      kind: 'method',
      id: null,
      generator: false,
      async: false,
      params: [
        {
          type: 'Identifier',
          start: 2776,
          end: 2794,
          loc: {
            start: {
              line: 97,
              column: 12,
              index: 2776,
            },
            end: {
              line: 97,
              column: 30,
              index: 2794,
            },
            identifierName: '_event',
          },
          name: '_event',
          typeAnnotation: {
            type: 'TSTypeAnnotation',
            start: 2782,
            end: 2794,
            loc: {
              start: {
                line: 97,
                column: 18,
                index: 2782,
              },
              end: {
                line: 97,
                column: 30,
                index: 2794,
              },
            },
            typeAnnotation: {
              type: 'TSTypeReference',
              start: 2784,
              end: 2794,
              loc: {
                start: {
                  line: 97,
                  column: 20,
                  index: 2784,
                },
                end: {
                  line: 97,
                  column: 30,
                  index: 2794,
                },
              },
              typeName: {
                type: 'Identifier',
                start: 2784,
                end: 2794,
                loc: {
                  start: {
                    line: 97,
                    column: 20,
                    index: 2784,
                  },
                  end: {
                    line: 97,
                    column: 30,
                    index: 2794,
                  },
                  identifierName: 'MouseEvent',
                },
                name: 'MouseEvent',
              },
            },
          },
        },
      ],
      body: {
        type: 'BlockStatement',
        start: 2796,
        end: 3008,
        loc: {
          start: {
            line: 97,
            column: 32,
            index: 2796,
          },
          end: {
            line: 106,
            column: 5,
            index: 3008,
          },
        },
        body: [
          {
            type: 'IfStatement',
            start: 2804,
            end: 3002,
            loc: {
              start: {
                line: 98,
                column: 6,
                index: 2804,
              },
              end: {
                line: 105,
                column: 7,
                index: 3002,
              },
            },
            test: {
              type: 'MemberExpression',
              start: 2808,
              end: 2824,
              loc: {
                start: {
                  line: 98,
                  column: 10,
                  index: 2808,
                },
                end: {
                  line: 98,
                  column: 26,
                  index: 2824,
                },
              },
              object: {
                type: 'Identifier',
                start: 2808,
                end: 2813,
                loc: {
                  start: {
                    line: 98,
                    column: 10,
                    index: 2808,
                  },
                  end: {
                    line: 98,
                    column: 15,
                    index: 2813,
                  },
                  identifierName: 'state',
                },
                name: 'state',
              },
              computed: false,
              property: {
                type: 'Identifier',
                start: 2814,
                end: 2824,
                loc: {
                  start: {
                    line: 98,
                    column: 16,
                    index: 2814,
                  },
                  end: {
                    line: 98,
                    column: 26,
                    index: 2824,
                  },
                  identifierName: 'useContent',
                },
                name: 'useContent',
              },
            },
            consequent: {
              type: 'BlockStatement',
              start: 2826,
              end: 3002,
              loc: {
                start: {
                  line: 98,
                  column: 28,
                  index: 2826,
                },
                end: {
                  line: 105,
                  column: 7,
                  index: 3002,
                },
              },
              body: [
                {
                  type: 'ExpressionStatement',
                  start: 2836,
                  end: 2994,
                  loc: {
                    start: {
                      line: 99,
                      column: 8,
                      index: 2836,
                    },
                    end: {
                      line: 104,
                      column: 11,
                      index: 2994,
                    },
                  },
                  expression: {
                    type: 'CallExpression',
                    start: 2836,
                    end: 2993,
                    loc: {
                      start: {
                        line: 99,
                        column: 8,
                        index: 2836,
                      },
                      end: {
                        line: 104,
                        column: 10,
                        index: 2993,
                      },
                    },
                    callee: {
                      type: 'Identifier',
                      start: 2836,
                      end: 2841,
                      loc: {
                        start: {
                          line: 99,
                          column: 8,
                          index: 2836,
                        },
                        end: {
                          line: 99,
                          column: 13,
                          index: 2841,
                        },
                        identifierName: 'track',
                      },
                      name: 'track',
                    },
                    arguments: [
                      {
                        type: 'ObjectExpression',
                        start: 2842,
                        end: 2992,
                        loc: {
                          start: {
                            line: 99,
                            column: 14,
                            index: 2842,
                          },
                          end: {
                            line: 104,
                            column: 9,
                            index: 2992,
                          },
                        },
                        properties: [
                          {
                            type: 'ObjectProperty',
                            start: 2854,
                            end: 2867,
                            loc: {
                              start: {
                                line: 100,
                                column: 10,
                                index: 2854,
                              },
                              end: {
                                line: 100,
                                column: 23,
                                index: 2867,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 2854,
                              end: 2858,
                              loc: {
                                start: {
                                  line: 100,
                                  column: 10,
                                  index: 2854,
                                },
                                end: {
                                  line: 100,
                                  column: 14,
                                  index: 2858,
                                },
                                identifierName: 'type',
                              },
                              name: 'type',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'StringLiteral',
                              start: 2860,
                              end: 2867,
                              loc: {
                                start: {
                                  line: 100,
                                  column: 16,
                                  index: 2860,
                                },
                                end: {
                                  line: 100,
                                  column: 23,
                                  index: 2867,
                                },
                              },
                              extra: {
                                rawValue: 'click',
                                raw: "'click'",
                              },
                              value: 'click',
                            },
                          },
                          {
                            type: 'ObjectProperty',
                            start: 2879,
                            end: 2908,
                            loc: {
                              start: {
                                line: 101,
                                column: 10,
                                index: 2879,
                              },
                              end: {
                                line: 101,
                                column: 39,
                                index: 2908,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 2879,
                              end: 2887,
                              loc: {
                                start: {
                                  line: 101,
                                  column: 10,
                                  index: 2879,
                                },
                                end: {
                                  line: 101,
                                  column: 18,
                                  index: 2887,
                                },
                                identifierName: 'canTrack',
                              },
                              name: 'canTrack',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'MemberExpression',
                              start: 2889,
                              end: 2908,
                              loc: {
                                start: {
                                  line: 101,
                                  column: 20,
                                  index: 2889,
                                },
                                end: {
                                  line: 101,
                                  column: 39,
                                  index: 2908,
                                },
                              },
                              object: {
                                type: 'Identifier',
                                start: 2889,
                                end: 2894,
                                loc: {
                                  start: {
                                    line: 101,
                                    column: 20,
                                    index: 2889,
                                  },
                                  end: {
                                    line: 101,
                                    column: 25,
                                    index: 2894,
                                  },
                                  identifierName: 'state',
                                },
                                name: 'state',
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 2895,
                                end: 2908,
                                loc: {
                                  start: {
                                    line: 101,
                                    column: 26,
                                    index: 2895,
                                  },
                                  end: {
                                    line: 101,
                                    column: 39,
                                    index: 2908,
                                  },
                                  identifierName: 'canTrackToUse',
                                },
                                name: 'canTrackToUse',
                              },
                            },
                          },
                          {
                            type: 'ObjectProperty',
                            start: 2920,
                            end: 2950,
                            loc: {
                              start: {
                                line: 102,
                                column: 10,
                                index: 2920,
                              },
                              end: {
                                line: 102,
                                column: 40,
                                index: 2950,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 2920,
                              end: 2929,
                              loc: {
                                start: {
                                  line: 102,
                                  column: 10,
                                  index: 2920,
                                },
                                end: {
                                  line: 102,
                                  column: 19,
                                  index: 2929,
                                },
                                identifierName: 'contentId',
                              },
                              name: 'contentId',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'MemberExpression',
                              start: 2931,
                              end: 2950,
                              loc: {
                                start: {
                                  line: 102,
                                  column: 21,
                                  index: 2931,
                                },
                                end: {
                                  line: 102,
                                  column: 40,
                                  index: 2950,
                                },
                              },
                              object: {
                                type: 'MemberExpression',
                                start: 2931,
                                end: 2947,
                                loc: {
                                  start: {
                                    line: 102,
                                    column: 21,
                                    index: 2931,
                                  },
                                  end: {
                                    line: 102,
                                    column: 37,
                                    index: 2947,
                                  },
                                },
                                object: {
                                  type: 'Identifier',
                                  start: 2931,
                                  end: 2936,
                                  loc: {
                                    start: {
                                      line: 102,
                                      column: 21,
                                      index: 2931,
                                    },
                                    end: {
                                      line: 102,
                                      column: 26,
                                      index: 2936,
                                    },
                                    identifierName: 'state',
                                  },
                                  name: 'state',
                                },
                                computed: false,
                                property: {
                                  type: 'Identifier',
                                  start: 2937,
                                  end: 2947,
                                  loc: {
                                    start: {
                                      line: 102,
                                      column: 27,
                                      index: 2937,
                                    },
                                    end: {
                                      line: 102,
                                      column: 37,
                                      index: 2947,
                                    },
                                    identifierName: 'useContent',
                                  },
                                  name: 'useContent',
                                },
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 2948,
                                end: 2950,
                                loc: {
                                  start: {
                                    line: 102,
                                    column: 38,
                                    index: 2948,
                                  },
                                  end: {
                                    line: 102,
                                    column: 40,
                                    index: 2950,
                                  },
                                  identifierName: 'id',
                                },
                                name: 'id',
                              },
                            },
                          },
                          {
                            type: 'ObjectProperty',
                            start: 2962,
                            end: 2981,
                            loc: {
                              start: {
                                line: 103,
                                column: 10,
                                index: 2962,
                              },
                              end: {
                                line: 103,
                                column: 29,
                                index: 2981,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 2962,
                              end: 2967,
                              loc: {
                                start: {
                                  line: 103,
                                  column: 10,
                                  index: 2962,
                                },
                                end: {
                                  line: 103,
                                  column: 15,
                                  index: 2967,
                                },
                                identifierName: 'orgId',
                              },
                              name: 'orgId',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'MemberExpression',
                              start: 2969,
                              end: 2981,
                              loc: {
                                start: {
                                  line: 103,
                                  column: 17,
                                  index: 2969,
                                },
                                end: {
                                  line: 103,
                                  column: 29,
                                  index: 2981,
                                },
                              },
                              object: {
                                type: 'Identifier',
                                start: 2969,
                                end: 2974,
                                loc: {
                                  start: {
                                    line: 103,
                                    column: 17,
                                    index: 2969,
                                  },
                                  end: {
                                    line: 103,
                                    column: 22,
                                    index: 2974,
                                  },
                                  identifierName: 'props',
                                },
                                name: 'props',
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 2975,
                                end: 2981,
                                loc: {
                                  start: {
                                    line: 103,
                                    column: 23,
                                    index: 2975,
                                  },
                                  end: {
                                    line: 103,
                                    column: 29,
                                    index: 2981,
                                  },
                                  identifierName: 'apiKey',
                                },
                                name: 'apiKey',
                              },
                            },
                          },
                        ],
                        extra: {
                          trailingComma: 2981,
                        },
                      },
                    ],
                  },
                },
              ],
              directives: [],
            },
            alternate: null,
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 3015,
      end: 3264,
      loc: {
        start: {
          line: 108,
          column: 4,
          index: 3015,
        },
        end: {
          line: 116,
          column: 5,
          index: 3264,
        },
      },
      method: true,
      key: {
        type: 'Identifier',
        start: 3015,
        end: 3029,
        loc: {
          start: {
            line: 108,
            column: 4,
            index: 3015,
          },
          end: {
            line: 108,
            column: 18,
            index: 3029,
          },
          identifierName: 'evalExpression',
        },
        name: 'evalExpression',
      },
      computed: false,
      kind: 'method',
      id: null,
      generator: false,
      async: false,
      params: [
        {
          type: 'Identifier',
          start: 3030,
          end: 3048,
          loc: {
            start: {
              line: 108,
              column: 19,
              index: 3030,
            },
            end: {
              line: 108,
              column: 37,
              index: 3048,
            },
            identifierName: 'expression',
          },
          name: 'expression',
          typeAnnotation: {
            type: 'TSTypeAnnotation',
            start: 3040,
            end: 3048,
            loc: {
              start: {
                line: 108,
                column: 29,
                index: 3040,
              },
              end: {
                line: 108,
                column: 37,
                index: 3048,
              },
            },
            typeAnnotation: {
              type: 'TSStringKeyword',
              start: 3042,
              end: 3048,
              loc: {
                start: {
                  line: 108,
                  column: 31,
                  index: 3042,
                },
                end: {
                  line: 108,
                  column: 37,
                  index: 3048,
                },
              },
            },
          },
        },
      ],
      body: {
        type: 'BlockStatement',
        start: 3050,
        end: 3264,
        loc: {
          start: {
            line: 108,
            column: 39,
            index: 3050,
          },
          end: {
            line: 116,
            column: 5,
            index: 3264,
          },
        },
        body: [
          {
            type: 'ReturnStatement',
            start: 3058,
            end: 3258,
            loc: {
              start: {
                line: 109,
                column: 6,
                index: 3058,
              },
              end: {
                line: 115,
                column: 8,
                index: 3258,
              },
            },
            argument: {
              type: 'CallExpression',
              start: 3065,
              end: 3257,
              loc: {
                start: {
                  line: 109,
                  column: 13,
                  index: 3065,
                },
                end: {
                  line: 115,
                  column: 7,
                  index: 3257,
                },
              },
              callee: {
                type: 'MemberExpression',
                start: 3065,
                end: 3083,
                loc: {
                  start: {
                    line: 109,
                    column: 13,
                    index: 3065,
                  },
                  end: {
                    line: 109,
                    column: 31,
                    index: 3083,
                  },
                },
                object: {
                  type: 'Identifier',
                  start: 3065,
                  end: 3075,
                  loc: {
                    start: {
                      line: 109,
                      column: 13,
                      index: 3065,
                    },
                    end: {
                      line: 109,
                      column: 23,
                      index: 3075,
                    },
                    identifierName: 'expression',
                  },
                  name: 'expression',
                },
                computed: false,
                property: {
                  type: 'Identifier',
                  start: 3076,
                  end: 3083,
                  loc: {
                    start: {
                      line: 109,
                      column: 24,
                      index: 3076,
                    },
                    end: {
                      line: 109,
                      column: 31,
                      index: 3083,
                    },
                    identifierName: 'replace',
                  },
                  name: 'replace',
                },
              },
              arguments: [
                {
                  type: 'RegExpLiteral',
                  start: 3084,
                  end: 3098,
                  loc: {
                    start: {
                      line: 109,
                      column: 32,
                      index: 3084,
                    },
                    end: {
                      line: 109,
                      column: 46,
                      index: 3098,
                    },
                  },
                  extra: {
                    raw: '/{{([^}]+)}}/g',
                  },
                  pattern: '{{([^}]+)}}',
                  flags: 'g',
                },
                {
                  type: 'ArrowFunctionExpression',
                  start: 3100,
                  end: 3249,
                  loc: {
                    start: {
                      line: 109,
                      column: 48,
                      index: 3100,
                    },
                    end: {
                      line: 114,
                      column: 10,
                      index: 3249,
                    },
                  },
                  id: null,
                  generator: false,
                  async: false,
                  params: [
                    {
                      type: 'Identifier',
                      start: 3101,
                      end: 3107,
                      loc: {
                        start: {
                          line: 109,
                          column: 49,
                          index: 3101,
                        },
                        end: {
                          line: 109,
                          column: 55,
                          index: 3107,
                        },
                        identifierName: '_match',
                      },
                      name: '_match',
                    },
                    {
                      type: 'Identifier',
                      start: 3109,
                      end: 3114,
                      loc: {
                        start: {
                          line: 109,
                          column: 57,
                          index: 3109,
                        },
                        end: {
                          line: 109,
                          column: 62,
                          index: 3114,
                        },
                        identifierName: 'group',
                      },
                      name: 'group',
                    },
                  ],
                  body: {
                    type: 'CallExpression',
                    start: 3127,
                    end: 3249,
                    loc: {
                      start: {
                        line: 110,
                        column: 8,
                        index: 3127,
                      },
                      end: {
                        line: 114,
                        column: 10,
                        index: 3249,
                      },
                    },
                    callee: {
                      type: 'Identifier',
                      start: 3127,
                      end: 3135,
                      loc: {
                        start: {
                          line: 110,
                          column: 8,
                          index: 3127,
                        },
                        end: {
                          line: 110,
                          column: 16,
                          index: 3135,
                        },
                        identifierName: 'evaluate',
                      },
                      name: 'evaluate',
                    },
                    arguments: [
                      {
                        type: 'ObjectExpression',
                        start: 3136,
                        end: 3248,
                        loc: {
                          start: {
                            line: 110,
                            column: 17,
                            index: 3136,
                          },
                          end: {
                            line: 114,
                            column: 9,
                            index: 3248,
                          },
                        },
                        properties: [
                          {
                            type: 'ObjectProperty',
                            start: 3148,
                            end: 3159,
                            loc: {
                              start: {
                                line: 111,
                                column: 10,
                                index: 3148,
                              },
                              end: {
                                line: 111,
                                column: 21,
                                index: 3159,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 3148,
                              end: 3152,
                              loc: {
                                start: {
                                  line: 111,
                                  column: 10,
                                  index: 3148,
                                },
                                end: {
                                  line: 111,
                                  column: 14,
                                  index: 3152,
                                },
                                identifierName: 'code',
                              },
                              name: 'code',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'Identifier',
                              start: 3154,
                              end: 3159,
                              loc: {
                                start: {
                                  line: 111,
                                  column: 16,
                                  index: 3154,
                                },
                                end: {
                                  line: 111,
                                  column: 21,
                                  index: 3159,
                                },
                                identifierName: 'group',
                              },
                              name: 'group',
                            },
                          },
                          {
                            type: 'ObjectProperty',
                            start: 3171,
                            end: 3200,
                            loc: {
                              start: {
                                line: 112,
                                column: 10,
                                index: 3171,
                              },
                              end: {
                                line: 112,
                                column: 39,
                                index: 3200,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 3171,
                              end: 3178,
                              loc: {
                                start: {
                                  line: 112,
                                  column: 10,
                                  index: 3171,
                                },
                                end: {
                                  line: 112,
                                  column: 17,
                                  index: 3178,
                                },
                                identifierName: 'context',
                              },
                              name: 'context',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'MemberExpression',
                              start: 3180,
                              end: 3200,
                              loc: {
                                start: {
                                  line: 112,
                                  column: 19,
                                  index: 3180,
                                },
                                end: {
                                  line: 112,
                                  column: 39,
                                  index: 3200,
                                },
                              },
                              object: {
                                type: 'Identifier',
                                start: 3180,
                                end: 3185,
                                loc: {
                                  start: {
                                    line: 112,
                                    column: 19,
                                    index: 3180,
                                  },
                                  end: {
                                    line: 112,
                                    column: 24,
                                    index: 3185,
                                  },
                                  identifierName: 'state',
                                },
                                name: 'state',
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 3186,
                                end: 3200,
                                loc: {
                                  start: {
                                    line: 112,
                                    column: 25,
                                    index: 3186,
                                  },
                                  end: {
                                    line: 112,
                                    column: 39,
                                    index: 3200,
                                  },
                                  identifierName: 'contextContext',
                                },
                                name: 'contextContext',
                              },
                            },
                          },
                          {
                            type: 'ObjectProperty',
                            start: 3212,
                            end: 3237,
                            loc: {
                              start: {
                                line: 113,
                                column: 10,
                                index: 3212,
                              },
                              end: {
                                line: 113,
                                column: 35,
                                index: 3237,
                              },
                            },
                            method: false,
                            key: {
                              type: 'Identifier',
                              start: 3212,
                              end: 3217,
                              loc: {
                                start: {
                                  line: 113,
                                  column: 10,
                                  index: 3212,
                                },
                                end: {
                                  line: 113,
                                  column: 15,
                                  index: 3217,
                                },
                                identifierName: 'state',
                              },
                              name: 'state',
                            },
                            computed: false,
                            shorthand: false,
                            value: {
                              type: 'MemberExpression',
                              start: 3219,
                              end: 3237,
                              loc: {
                                start: {
                                  line: 113,
                                  column: 17,
                                  index: 3219,
                                },
                                end: {
                                  line: 113,
                                  column: 35,
                                  index: 3237,
                                },
                              },
                              object: {
                                type: 'Identifier',
                                start: 3219,
                                end: 3224,
                                loc: {
                                  start: {
                                    line: 113,
                                    column: 17,
                                    index: 3219,
                                  },
                                  end: {
                                    line: 113,
                                    column: 22,
                                    index: 3224,
                                  },
                                  identifierName: 'state',
                                },
                                name: 'state',
                              },
                              computed: false,
                              property: {
                                type: 'Identifier',
                                start: 3225,
                                end: 3237,
                                loc: {
                                  start: {
                                    line: 113,
                                    column: 23,
                                    index: 3225,
                                  },
                                  end: {
                                    line: 113,
                                    column: 35,
                                    index: 3237,
                                  },
                                  identifierName: 'contentState',
                                },
                                name: 'contentState',
                              },
                            },
                          },
                        ],
                        extra: {
                          trailingComma: 3237,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 3270,
      end: 3694,
      loc: {
        start: {
          line: 117,
          column: 4,
          index: 3270,
        },
        end: {
          line: 130,
          column: 5,
          index: 3694,
        },
      },
      method: true,
      key: {
        type: 'Identifier',
        start: 3270,
        end: 3283,
        loc: {
          start: {
            line: 117,
            column: 4,
            index: 3270,
          },
          end: {
            line: 117,
            column: 17,
            index: 3283,
          },
          identifierName: 'handleRequest',
        },
        name: 'handleRequest',
      },
      computed: false,
      kind: 'method',
      id: null,
      generator: false,
      async: false,
      params: [
        {
          type: 'ObjectPattern',
          start: 3284,
          end: 3326,
          loc: {
            start: {
              line: 117,
              column: 18,
              index: 3284,
            },
            end: {
              line: 117,
              column: 60,
              index: 3326,
            },
          },
          properties: [
            {
              type: 'ObjectProperty',
              start: 3286,
              end: 3289,
              loc: {
                start: {
                  line: 117,
                  column: 20,
                  index: 3286,
                },
                end: {
                  line: 117,
                  column: 23,
                  index: 3289,
                },
              },
              key: {
                type: 'Identifier',
                start: 3286,
                end: 3289,
                loc: {
                  start: {
                    line: 117,
                    column: 20,
                    index: 3286,
                  },
                  end: {
                    line: 117,
                    column: 23,
                    index: 3289,
                  },
                  identifierName: 'url',
                },
                name: 'url',
              },
              computed: false,
              method: false,
              shorthand: true,
              value: {
                type: 'Identifier',
                start: 3286,
                end: 3289,
                loc: {
                  start: {
                    line: 117,
                    column: 20,
                    index: 3286,
                  },
                  end: {
                    line: 117,
                    column: 23,
                    index: 3289,
                  },
                  identifierName: 'url',
                },
                name: 'url',
              },
              extra: {
                shorthand: true,
              },
            },
            {
              type: 'ObjectProperty',
              start: 3291,
              end: 3294,
              loc: {
                start: {
                  line: 117,
                  column: 25,
                  index: 3291,
                },
                end: {
                  line: 117,
                  column: 28,
                  index: 3294,
                },
              },
              key: {
                type: 'Identifier',
                start: 3291,
                end: 3294,
                loc: {
                  start: {
                    line: 117,
                    column: 25,
                    index: 3291,
                  },
                  end: {
                    line: 117,
                    column: 28,
                    index: 3294,
                  },
                  identifierName: 'key',
                },
                name: 'key',
              },
              computed: false,
              method: false,
              shorthand: true,
              value: {
                type: 'Identifier',
                start: 3291,
                end: 3294,
                loc: {
                  start: {
                    line: 117,
                    column: 25,
                    index: 3291,
                  },
                  end: {
                    line: 117,
                    column: 28,
                    index: 3294,
                  },
                  identifierName: 'key',
                },
                name: 'key',
              },
              extra: {
                shorthand: true,
              },
            },
          ],
          typeAnnotation: {
            type: 'TSTypeAnnotation',
            start: 3296,
            end: 3326,
            loc: {
              start: {
                line: 117,
                column: 30,
                index: 3296,
              },
              end: {
                line: 117,
                column: 60,
                index: 3326,
              },
            },
            typeAnnotation: {
              type: 'TSTypeLiteral',
              start: 3298,
              end: 3326,
              loc: {
                start: {
                  line: 117,
                  column: 32,
                  index: 3298,
                },
                end: {
                  line: 117,
                  column: 60,
                  index: 3326,
                },
              },
              members: [
                {
                  type: 'TSPropertySignature',
                  start: 3300,
                  end: 3312,
                  loc: {
                    start: {
                      line: 117,
                      column: 34,
                      index: 3300,
                    },
                    end: {
                      line: 117,
                      column: 46,
                      index: 3312,
                    },
                  },
                  key: {
                    type: 'Identifier',
                    start: 3300,
                    end: 3303,
                    loc: {
                      start: {
                        line: 117,
                        column: 34,
                        index: 3300,
                      },
                      end: {
                        line: 117,
                        column: 37,
                        index: 3303,
                      },
                      identifierName: 'key',
                    },
                    name: 'key',
                  },
                  computed: false,
                  typeAnnotation: {
                    type: 'TSTypeAnnotation',
                    start: 3303,
                    end: 3311,
                    loc: {
                      start: {
                        line: 117,
                        column: 37,
                        index: 3303,
                      },
                      end: {
                        line: 117,
                        column: 45,
                        index: 3311,
                      },
                    },
                    typeAnnotation: {
                      type: 'TSStringKeyword',
                      start: 3305,
                      end: 3311,
                      loc: {
                        start: {
                          line: 117,
                          column: 39,
                          index: 3305,
                        },
                        end: {
                          line: 117,
                          column: 45,
                          index: 3311,
                        },
                      },
                    },
                  },
                },
                {
                  type: 'TSPropertySignature',
                  start: 3313,
                  end: 3324,
                  loc: {
                    start: {
                      line: 117,
                      column: 47,
                      index: 3313,
                    },
                    end: {
                      line: 117,
                      column: 58,
                      index: 3324,
                    },
                  },
                  key: {
                    type: 'Identifier',
                    start: 3313,
                    end: 3316,
                    loc: {
                      start: {
                        line: 117,
                        column: 47,
                        index: 3313,
                      },
                      end: {
                        line: 117,
                        column: 50,
                        index: 3316,
                      },
                      identifierName: 'url',
                    },
                    name: 'url',
                  },
                  computed: false,
                  typeAnnotation: {
                    type: 'TSTypeAnnotation',
                    start: 3316,
                    end: 3324,
                    loc: {
                      start: {
                        line: 117,
                        column: 50,
                        index: 3316,
                      },
                      end: {
                        line: 117,
                        column: 58,
                        index: 3324,
                      },
                    },
                    typeAnnotation: {
                      type: 'TSStringKeyword',
                      start: 3318,
                      end: 3324,
                      loc: {
                        start: {
                          line: 117,
                          column: 52,
                          index: 3318,
                        },
                        end: {
                          line: 117,
                          column: 58,
                          index: 3324,
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
      body: {
        type: 'BlockStatement',
        start: 3328,
        end: 3694,
        loc: {
          start: {
            line: 117,
            column: 62,
            index: 3328,
          },
          end: {
            line: 130,
            column: 5,
            index: 3694,
          },
        },
        body: [
          {
            type: 'VariableDeclaration',
            start: 3336,
            end: 3662,
            loc: {
              start: {
                line: 118,
                column: 6,
                index: 3336,
              },
              end: {
                line: 128,
                column: 8,
                index: 3662,
              },
            },
            declarations: [
              {
                type: 'VariableDeclarator',
                start: 3342,
                end: 3661,
                loc: {
                  start: {
                    line: 118,
                    column: 12,
                    index: 3342,
                  },
                  end: {
                    line: 128,
                    column: 7,
                    index: 3661,
                  },
                },
                id: {
                  type: 'Identifier',
                  start: 3342,
                  end: 3358,
                  loc: {
                    start: {
                      line: 118,
                      column: 12,
                      index: 3342,
                    },
                    end: {
                      line: 118,
                      column: 28,
                      index: 3358,
                    },
                    identifierName: 'fetchAndSetState',
                  },
                  name: 'fetchAndSetState',
                },
                init: {
                  type: 'ArrowFunctionExpression',
                  start: 3361,
                  end: 3661,
                  loc: {
                    start: {
                      line: 118,
                      column: 31,
                      index: 3361,
                    },
                    end: {
                      line: 128,
                      column: 7,
                      index: 3661,
                    },
                  },
                  id: null,
                  generator: false,
                  async: true,
                  params: [],
                  body: {
                    type: 'BlockStatement',
                    start: 3373,
                    end: 3661,
                    loc: {
                      start: {
                        line: 118,
                        column: 43,
                        index: 3373,
                      },
                      end: {
                        line: 128,
                        column: 7,
                        index: 3661,
                      },
                    },
                    body: [
                      {
                        type: 'VariableDeclaration',
                        start: 3383,
                        end: 3414,
                        loc: {
                          start: {
                            line: 119,
                            column: 8,
                            index: 3383,
                          },
                          end: {
                            line: 119,
                            column: 39,
                            index: 3414,
                          },
                        },
                        declarations: [
                          {
                            type: 'VariableDeclarator',
                            start: 3389,
                            end: 3413,
                            loc: {
                              start: {
                                line: 119,
                                column: 14,
                                index: 3389,
                              },
                              end: {
                                line: 119,
                                column: 38,
                                index: 3413,
                              },
                            },
                            id: {
                              type: 'Identifier',
                              start: 3389,
                              end: 3394,
                              loc: {
                                start: {
                                  line: 119,
                                  column: 14,
                                  index: 3389,
                                },
                                end: {
                                  line: 119,
                                  column: 19,
                                  index: 3394,
                                },
                                identifierName: 'fetch',
                              },
                              name: 'fetch',
                            },
                            init: {
                              type: 'AwaitExpression',
                              start: 3397,
                              end: 3413,
                              loc: {
                                start: {
                                  line: 119,
                                  column: 22,
                                  index: 3397,
                                },
                                end: {
                                  line: 119,
                                  column: 38,
                                  index: 3413,
                                },
                              },
                              argument: {
                                type: 'CallExpression',
                                start: 3403,
                                end: 3413,
                                loc: {
                                  start: {
                                    line: 119,
                                    column: 28,
                                    index: 3403,
                                  },
                                  end: {
                                    line: 119,
                                    column: 38,
                                    index: 3413,
                                  },
                                },
                                callee: {
                                  type: 'Identifier',
                                  start: 3403,
                                  end: 3411,
                                  loc: {
                                    start: {
                                      line: 119,
                                      column: 28,
                                      index: 3403,
                                    },
                                    end: {
                                      line: 119,
                                      column: 36,
                                      index: 3411,
                                    },
                                    identifierName: 'getFetch',
                                  },
                                  name: 'getFetch',
                                },
                                arguments: [],
                              },
                            },
                          },
                        ],
                        kind: 'const',
                      },
                      {
                        type: 'VariableDeclaration',
                        start: 3423,
                        end: 3457,
                        loc: {
                          start: {
                            line: 120,
                            column: 8,
                            index: 3423,
                          },
                          end: {
                            line: 120,
                            column: 42,
                            index: 3457,
                          },
                        },
                        declarations: [
                          {
                            type: 'VariableDeclarator',
                            start: 3429,
                            end: 3456,
                            loc: {
                              start: {
                                line: 120,
                                column: 14,
                                index: 3429,
                              },
                              end: {
                                line: 120,
                                column: 41,
                                index: 3456,
                              },
                            },
                            id: {
                              type: 'Identifier',
                              start: 3429,
                              end: 3437,
                              loc: {
                                start: {
                                  line: 120,
                                  column: 14,
                                  index: 3429,
                                },
                                end: {
                                  line: 120,
                                  column: 22,
                                  index: 3437,
                                },
                                identifierName: 'response',
                              },
                              name: 'response',
                            },
                            init: {
                              type: 'AwaitExpression',
                              start: 3440,
                              end: 3456,
                              loc: {
                                start: {
                                  line: 120,
                                  column: 25,
                                  index: 3440,
                                },
                                end: {
                                  line: 120,
                                  column: 41,
                                  index: 3456,
                                },
                              },
                              argument: {
                                type: 'CallExpression',
                                start: 3446,
                                end: 3456,
                                loc: {
                                  start: {
                                    line: 120,
                                    column: 31,
                                    index: 3446,
                                  },
                                  end: {
                                    line: 120,
                                    column: 41,
                                    index: 3456,
                                  },
                                },
                                callee: {
                                  type: 'Identifier',
                                  start: 3446,
                                  end: 3451,
                                  loc: {
                                    start: {
                                      line: 120,
                                      column: 31,
                                      index: 3446,
                                    },
                                    end: {
                                      line: 120,
                                      column: 36,
                                      index: 3451,
                                    },
                                    identifierName: 'fetch',
                                  },
                                  name: 'fetch',
                                },
                                arguments: [
                                  {
                                    type: 'Identifier',
                                    start: 3452,
                                    end: 3455,
                                    loc: {
                                      start: {
                                        line: 120,
                                        column: 37,
                                        index: 3452,
                                      },
                                      end: {
                                        line: 120,
                                        column: 40,
                                        index: 3455,
                                      },
                                      identifierName: 'url',
                                    },
                                    name: 'url',
                                  },
                                ],
                              },
                            },
                          },
                        ],
                        kind: 'const',
                      },
                      {
                        type: 'VariableDeclaration',
                        start: 3466,
                        end: 3501,
                        loc: {
                          start: {
                            line: 121,
                            column: 8,
                            index: 3466,
                          },
                          end: {
                            line: 121,
                            column: 43,
                            index: 3501,
                          },
                        },
                        declarations: [
                          {
                            type: 'VariableDeclarator',
                            start: 3472,
                            end: 3500,
                            loc: {
                              start: {
                                line: 121,
                                column: 14,
                                index: 3472,
                              },
                              end: {
                                line: 121,
                                column: 42,
                                index: 3500,
                              },
                            },
                            id: {
                              type: 'Identifier',
                              start: 3472,
                              end: 3476,
                              loc: {
                                start: {
                                  line: 121,
                                  column: 14,
                                  index: 3472,
                                },
                                end: {
                                  line: 121,
                                  column: 18,
                                  index: 3476,
                                },
                                identifierName: 'json',
                              },
                              name: 'json',
                            },
                            init: {
                              type: 'AwaitExpression',
                              start: 3479,
                              end: 3500,
                              loc: {
                                start: {
                                  line: 121,
                                  column: 21,
                                  index: 3479,
                                },
                                end: {
                                  line: 121,
                                  column: 42,
                                  index: 3500,
                                },
                              },
                              argument: {
                                type: 'CallExpression',
                                start: 3485,
                                end: 3500,
                                loc: {
                                  start: {
                                    line: 121,
                                    column: 27,
                                    index: 3485,
                                  },
                                  end: {
                                    line: 121,
                                    column: 42,
                                    index: 3500,
                                  },
                                },
                                callee: {
                                  type: 'MemberExpression',
                                  start: 3485,
                                  end: 3498,
                                  loc: {
                                    start: {
                                      line: 121,
                                      column: 27,
                                      index: 3485,
                                    },
                                    end: {
                                      line: 121,
                                      column: 40,
                                      index: 3498,
                                    },
                                  },
                                  object: {
                                    type: 'Identifier',
                                    start: 3485,
                                    end: 3493,
                                    loc: {
                                      start: {
                                        line: 121,
                                        column: 27,
                                        index: 3485,
                                      },
                                      end: {
                                        line: 121,
                                        column: 35,
                                        index: 3493,
                                      },
                                      identifierName: 'response',
                                    },
                                    name: 'response',
                                  },
                                  computed: false,
                                  property: {
                                    type: 'Identifier',
                                    start: 3494,
                                    end: 3498,
                                    loc: {
                                      start: {
                                        line: 121,
                                        column: 36,
                                        index: 3494,
                                      },
                                      end: {
                                        line: 121,
                                        column: 40,
                                        index: 3498,
                                      },
                                      identifierName: 'json',
                                    },
                                    name: 'json',
                                  },
                                },
                                arguments: [],
                              },
                            },
                          },
                        ],
                        kind: 'const',
                      },
                      {
                        type: 'VariableDeclaration',
                        start: 3511,
                        end: 3605,
                        loc: {
                          start: {
                            line: 123,
                            column: 8,
                            index: 3511,
                          },
                          end: {
                            line: 126,
                            column: 10,
                            index: 3605,
                          },
                        },
                        declarations: [
                          {
                            type: 'VariableDeclarator',
                            start: 3517,
                            end: 3604,
                            loc: {
                              start: {
                                line: 123,
                                column: 14,
                                index: 3517,
                              },
                              end: {
                                line: 126,
                                column: 9,
                                index: 3604,
                              },
                            },
                            id: {
                              type: 'Identifier',
                              start: 3517,
                              end: 3533,
                              loc: {
                                start: {
                                  line: 123,
                                  column: 14,
                                  index: 3517,
                                },
                                end: {
                                  line: 123,
                                  column: 30,
                                  index: 3533,
                                },
                                identifierName: 'newOverrideState',
                              },
                              name: 'newOverrideState',
                            },
                            init: {
                              type: 'ObjectExpression',
                              start: 3536,
                              end: 3604,
                              loc: {
                                start: {
                                  line: 123,
                                  column: 33,
                                  index: 3536,
                                },
                                end: {
                                  line: 126,
                                  column: 9,
                                  index: 3604,
                                },
                              },
                              properties: [
                                {
                                  type: 'SpreadElement',
                                  start: 3548,
                                  end: 3570,
                                  loc: {
                                    start: {
                                      line: 124,
                                      column: 10,
                                      index: 3548,
                                    },
                                    end: {
                                      line: 124,
                                      column: 32,
                                      index: 3570,
                                    },
                                  },
                                  argument: {
                                    type: 'MemberExpression',
                                    start: 3551,
                                    end: 3570,
                                    loc: {
                                      start: {
                                        line: 124,
                                        column: 13,
                                        index: 3551,
                                      },
                                      end: {
                                        line: 124,
                                        column: 32,
                                        index: 3570,
                                      },
                                    },
                                    object: {
                                      type: 'Identifier',
                                      start: 3551,
                                      end: 3556,
                                      loc: {
                                        start: {
                                          line: 124,
                                          column: 13,
                                          index: 3551,
                                        },
                                        end: {
                                          line: 124,
                                          column: 18,
                                          index: 3556,
                                        },
                                        identifierName: 'state',
                                      },
                                      name: 'state',
                                    },
                                    computed: false,
                                    property: {
                                      type: 'Identifier',
                                      start: 3557,
                                      end: 3570,
                                      loc: {
                                        start: {
                                          line: 124,
                                          column: 19,
                                          index: 3557,
                                        },
                                        end: {
                                          line: 124,
                                          column: 32,
                                          index: 3570,
                                        },
                                        identifierName: 'overrideState',
                                      },
                                      name: 'overrideState',
                                    },
                                  },
                                },
                                {
                                  type: 'ObjectProperty',
                                  start: 3582,
                                  end: 3593,
                                  loc: {
                                    start: {
                                      line: 125,
                                      column: 10,
                                      index: 3582,
                                    },
                                    end: {
                                      line: 125,
                                      column: 21,
                                      index: 3593,
                                    },
                                  },
                                  method: false,
                                  computed: true,
                                  key: {
                                    type: 'Identifier',
                                    start: 3583,
                                    end: 3586,
                                    loc: {
                                      start: {
                                        line: 125,
                                        column: 11,
                                        index: 3583,
                                      },
                                      end: {
                                        line: 125,
                                        column: 14,
                                        index: 3586,
                                      },
                                      identifierName: 'key',
                                    },
                                    name: 'key',
                                  },
                                  shorthand: false,
                                  value: {
                                    type: 'Identifier',
                                    start: 3589,
                                    end: 3593,
                                    loc: {
                                      start: {
                                        line: 125,
                                        column: 17,
                                        index: 3589,
                                      },
                                      end: {
                                        line: 125,
                                        column: 21,
                                        index: 3593,
                                      },
                                      identifierName: 'json',
                                    },
                                    name: 'json',
                                  },
                                },
                              ],
                              extra: {
                                trailingComma: 3593,
                              },
                            },
                          },
                        ],
                        kind: 'const',
                      },
                      {
                        type: 'ExpressionStatement',
                        start: 3614,
                        end: 3653,
                        loc: {
                          start: {
                            line: 127,
                            column: 8,
                            index: 3614,
                          },
                          end: {
                            line: 127,
                            column: 47,
                            index: 3653,
                          },
                        },
                        expression: {
                          type: 'AssignmentExpression',
                          start: 3614,
                          end: 3652,
                          loc: {
                            start: {
                              line: 127,
                              column: 8,
                              index: 3614,
                            },
                            end: {
                              line: 127,
                              column: 46,
                              index: 3652,
                            },
                          },
                          operator: '=',
                          left: {
                            type: 'MemberExpression',
                            start: 3614,
                            end: 3633,
                            loc: {
                              start: {
                                line: 127,
                                column: 8,
                                index: 3614,
                              },
                              end: {
                                line: 127,
                                column: 27,
                                index: 3633,
                              },
                            },
                            object: {
                              type: 'Identifier',
                              start: 3614,
                              end: 3619,
                              loc: {
                                start: {
                                  line: 127,
                                  column: 8,
                                  index: 3614,
                                },
                                end: {
                                  line: 127,
                                  column: 13,
                                  index: 3619,
                                },
                                identifierName: 'state',
                              },
                              name: 'state',
                            },
                            computed: false,
                            property: {
                              type: 'Identifier',
                              start: 3620,
                              end: 3633,
                              loc: {
                                start: {
                                  line: 127,
                                  column: 14,
                                  index: 3620,
                                },
                                end: {
                                  line: 127,
                                  column: 27,
                                  index: 3633,
                                },
                                identifierName: 'overrideState',
                              },
                              name: 'overrideState',
                            },
                          },
                          right: {
                            type: 'Identifier',
                            start: 3636,
                            end: 3652,
                            loc: {
                              start: {
                                line: 127,
                                column: 30,
                                index: 3636,
                              },
                              end: {
                                line: 127,
                                column: 46,
                                index: 3652,
                              },
                              identifierName: 'newOverrideState',
                            },
                            name: 'newOverrideState',
                          },
                        },
                      },
                    ],
                    directives: [],
                  },
                },
              },
            ],
            kind: 'const',
          },
          {
            type: 'ExpressionStatement',
            start: 3669,
            end: 3688,
            loc: {
              start: {
                line: 129,
                column: 6,
                index: 3669,
              },
              end: {
                line: 129,
                column: 25,
                index: 3688,
              },
            },
            expression: {
              type: 'CallExpression',
              start: 3669,
              end: 3687,
              loc: {
                start: {
                  line: 129,
                  column: 6,
                  index: 3669,
                },
                end: {
                  line: 129,
                  column: 24,
                  index: 3687,
                },
              },
              callee: {
                type: 'Identifier',
                start: 3669,
                end: 3685,
                loc: {
                  start: {
                    line: 129,
                    column: 6,
                    index: 3669,
                  },
                  end: {
                    line: 129,
                    column: 22,
                    index: 3685,
                  },
                  identifierName: 'fetchAndSetState',
                },
                name: 'fetchAndSetState',
              },
              arguments: [],
            },
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 3700,
      end: 4051,
      loc: {
        start: {
          line: 131,
          column: 4,
          index: 3700,
        },
        end: {
          line: 140,
          column: 5,
          index: 4051,
        },
      },
      method: true,
      key: {
        type: 'Identifier',
        start: 3700,
        end: 3715,
        loc: {
          start: {
            line: 131,
            column: 4,
            index: 3700,
          },
          end: {
            line: 131,
            column: 19,
            index: 3715,
          },
          identifierName: 'runHttpRequests',
        },
        name: 'runHttpRequests',
      },
      computed: false,
      kind: 'method',
      id: null,
      generator: false,
      async: false,
      params: [],
      body: {
        type: 'BlockStatement',
        start: 3718,
        end: 4051,
        loc: {
          start: {
            line: 131,
            column: 22,
            index: 3718,
          },
          end: {
            line: 140,
            column: 5,
            index: 4051,
          },
        },
        body: [
          {
            type: 'VariableDeclaration',
            start: 3726,
            end: 3786,
            loc: {
              start: {
                line: 132,
                column: 6,
                index: 3726,
              },
              end: {
                line: 132,
                column: 66,
                index: 3786,
              },
            },
            declarations: [
              {
                type: 'VariableDeclarator',
                start: 3732,
                end: 3785,
                loc: {
                  start: {
                    line: 132,
                    column: 12,
                    index: 3732,
                  },
                  end: {
                    line: 132,
                    column: 65,
                    index: 3785,
                  },
                },
                id: {
                  type: 'Identifier',
                  start: 3732,
                  end: 3740,
                  loc: {
                    start: {
                      line: 132,
                      column: 12,
                      index: 3732,
                    },
                    end: {
                      line: 132,
                      column: 20,
                      index: 3740,
                    },
                    identifierName: 'requests',
                  },
                  name: 'requests',
                },
                init: {
                  type: 'LogicalExpression',
                  start: 3743,
                  end: 3785,
                  loc: {
                    start: {
                      line: 132,
                      column: 23,
                      index: 3743,
                    },
                    end: {
                      line: 132,
                      column: 65,
                      index: 3785,
                    },
                  },
                  left: {
                    type: 'OptionalMemberExpression',
                    start: 3743,
                    end: 3779,
                    loc: {
                      start: {
                        line: 132,
                        column: 23,
                        index: 3743,
                      },
                      end: {
                        line: 132,
                        column: 59,
                        index: 3779,
                      },
                    },
                    object: {
                      type: 'OptionalMemberExpression',
                      start: 3743,
                      end: 3765,
                      loc: {
                        start: {
                          line: 132,
                          column: 23,
                          index: 3743,
                        },
                        end: {
                          line: 132,
                          column: 45,
                          index: 3765,
                        },
                      },
                      object: {
                        type: 'MemberExpression',
                        start: 3743,
                        end: 3759,
                        loc: {
                          start: {
                            line: 132,
                            column: 23,
                            index: 3743,
                          },
                          end: {
                            line: 132,
                            column: 39,
                            index: 3759,
                          },
                        },
                        object: {
                          type: 'Identifier',
                          start: 3743,
                          end: 3748,
                          loc: {
                            start: {
                              line: 132,
                              column: 23,
                              index: 3743,
                            },
                            end: {
                              line: 132,
                              column: 28,
                              index: 3748,
                            },
                            identifierName: 'state',
                          },
                          name: 'state',
                        },
                        computed: false,
                        property: {
                          type: 'Identifier',
                          start: 3749,
                          end: 3759,
                          loc: {
                            start: {
                              line: 132,
                              column: 29,
                              index: 3749,
                            },
                            end: {
                              line: 132,
                              column: 39,
                              index: 3759,
                            },
                            identifierName: 'useContent',
                          },
                          name: 'useContent',
                        },
                      },
                      computed: false,
                      property: {
                        type: 'Identifier',
                        start: 3761,
                        end: 3765,
                        loc: {
                          start: {
                            line: 132,
                            column: 41,
                            index: 3761,
                          },
                          end: {
                            line: 132,
                            column: 45,
                            index: 3765,
                          },
                          identifierName: 'data',
                        },
                        name: 'data',
                      },
                      optional: true,
                    },
                    computed: false,
                    property: {
                      type: 'Identifier',
                      start: 3767,
                      end: 3779,
                      loc: {
                        start: {
                          line: 132,
                          column: 47,
                          index: 3767,
                        },
                        end: {
                          line: 132,
                          column: 59,
                          index: 3779,
                        },
                        identifierName: 'httpRequests',
                      },
                      name: 'httpRequests',
                    },
                    optional: true,
                  },
                  operator: '??',
                  right: {
                    type: 'ObjectExpression',
                    start: 3783,
                    end: 3785,
                    loc: {
                      start: {
                        line: 132,
                        column: 63,
                        index: 3783,
                      },
                      end: {
                        line: 132,
                        column: 65,
                        index: 3785,
                      },
                    },
                    properties: [],
                  },
                },
              },
            ],
            kind: 'const',
          },
          {
            type: 'ExpressionStatement',
            start: 3794,
            end: 4045,
            loc: {
              start: {
                line: 134,
                column: 6,
                index: 3794,
              },
              end: {
                line: 139,
                column: 9,
                index: 4045,
              },
            },
            expression: {
              type: 'CallExpression',
              start: 3794,
              end: 4044,
              loc: {
                start: {
                  line: 134,
                  column: 6,
                  index: 3794,
                },
                end: {
                  line: 139,
                  column: 8,
                  index: 4044,
                },
              },
              callee: {
                type: 'MemberExpression',
                start: 3794,
                end: 3826,
                loc: {
                  start: {
                    line: 134,
                    column: 6,
                    index: 3794,
                  },
                  end: {
                    line: 134,
                    column: 38,
                    index: 3826,
                  },
                },
                object: {
                  type: 'CallExpression',
                  start: 3794,
                  end: 3818,
                  loc: {
                    start: {
                      line: 134,
                      column: 6,
                      index: 3794,
                    },
                    end: {
                      line: 134,
                      column: 30,
                      index: 3818,
                    },
                  },
                  callee: {
                    type: 'MemberExpression',
                    start: 3794,
                    end: 3808,
                    loc: {
                      start: {
                        line: 134,
                        column: 6,
                        index: 3794,
                      },
                      end: {
                        line: 134,
                        column: 20,
                        index: 3808,
                      },
                    },
                    object: {
                      type: 'Identifier',
                      start: 3794,
                      end: 3800,
                      loc: {
                        start: {
                          line: 134,
                          column: 6,
                          index: 3794,
                        },
                        end: {
                          line: 134,
                          column: 12,
                          index: 3800,
                        },
                        identifierName: 'Object',
                      },
                      name: 'Object',
                    },
                    computed: false,
                    property: {
                      type: 'Identifier',
                      start: 3801,
                      end: 3808,
                      loc: {
                        start: {
                          line: 134,
                          column: 13,
                          index: 3801,
                        },
                        end: {
                          line: 134,
                          column: 20,
                          index: 3808,
                        },
                        identifierName: 'entries',
                      },
                      name: 'entries',
                    },
                  },
                  arguments: [
                    {
                      type: 'Identifier',
                      start: 3809,
                      end: 3817,
                      loc: {
                        start: {
                          line: 134,
                          column: 21,
                          index: 3809,
                        },
                        end: {
                          line: 134,
                          column: 29,
                          index: 3817,
                        },
                        identifierName: 'requests',
                      },
                      name: 'requests',
                    },
                  ],
                },
                computed: false,
                property: {
                  type: 'Identifier',
                  start: 3819,
                  end: 3826,
                  loc: {
                    start: {
                      line: 134,
                      column: 31,
                      index: 3819,
                    },
                    end: {
                      line: 134,
                      column: 38,
                      index: 3826,
                    },
                    identifierName: 'forEach',
                  },
                  name: 'forEach',
                },
              },
              arguments: [
                {
                  type: 'ArrowFunctionExpression',
                  start: 3827,
                  end: 4043,
                  loc: {
                    start: {
                      line: 134,
                      column: 39,
                      index: 3827,
                    },
                    end: {
                      line: 139,
                      column: 7,
                      index: 4043,
                    },
                  },
                  id: null,
                  generator: false,
                  async: false,
                  params: [
                    {
                      type: 'ArrayPattern',
                      start: 3828,
                      end: 3838,
                      loc: {
                        start: {
                          line: 134,
                          column: 40,
                          index: 3828,
                        },
                        end: {
                          line: 134,
                          column: 50,
                          index: 3838,
                        },
                      },
                      elements: [
                        {
                          type: 'Identifier',
                          start: 3829,
                          end: 3832,
                          loc: {
                            start: {
                              line: 134,
                              column: 41,
                              index: 3829,
                            },
                            end: {
                              line: 134,
                              column: 44,
                              index: 3832,
                            },
                            identifierName: 'key',
                          },
                          name: 'key',
                        },
                        {
                          type: 'Identifier',
                          start: 3834,
                          end: 3837,
                          loc: {
                            start: {
                              line: 134,
                              column: 46,
                              index: 3834,
                            },
                            end: {
                              line: 134,
                              column: 49,
                              index: 3837,
                            },
                            identifierName: 'url',
                          },
                          name: 'url',
                        },
                      ],
                    },
                  ],
                  body: {
                    type: 'BlockStatement',
                    start: 3843,
                    end: 4043,
                    loc: {
                      start: {
                        line: 134,
                        column: 55,
                        index: 3843,
                      },
                      end: {
                        line: 139,
                        column: 7,
                        index: 4043,
                      },
                    },
                    body: [
                      {
                        type: 'IfStatement',
                        start: 3853,
                        end: 4035,
                        loc: {
                          start: {
                            line: 135,
                            column: 8,
                            index: 3853,
                          },
                          end: {
                            line: 138,
                            column: 9,
                            index: 4035,
                          },
                        },
                        test: {
                          type: 'LogicalExpression',
                          start: 3857,
                          end: 3905,
                          loc: {
                            start: {
                              line: 135,
                              column: 12,
                              index: 3857,
                            },
                            end: {
                              line: 135,
                              column: 60,
                              index: 3905,
                            },
                          },
                          left: {
                            type: 'Identifier',
                            start: 3857,
                            end: 3860,
                            loc: {
                              start: {
                                line: 135,
                                column: 12,
                                index: 3857,
                              },
                              end: {
                                line: 135,
                                column: 15,
                                index: 3860,
                              },
                              identifierName: 'url',
                            },
                            name: 'url',
                          },
                          operator: '&&',
                          right: {
                            type: 'LogicalExpression',
                            start: 3865,
                            end: 3904,
                            loc: {
                              start: {
                                line: 135,
                                column: 20,
                                index: 3865,
                              },
                              end: {
                                line: 135,
                                column: 59,
                                index: 3904,
                              },
                            },
                            left: {
                              type: 'UnaryExpression',
                              start: 3865,
                              end: 3889,
                              loc: {
                                start: {
                                  line: 135,
                                  column: 20,
                                  index: 3865,
                                },
                                end: {
                                  line: 135,
                                  column: 44,
                                  index: 3889,
                                },
                              },
                              operator: '!',
                              prefix: true,
                              argument: {
                                type: 'MemberExpression',
                                start: 3866,
                                end: 3889,
                                loc: {
                                  start: {
                                    line: 135,
                                    column: 21,
                                    index: 3866,
                                  },
                                  end: {
                                    line: 135,
                                    column: 44,
                                    index: 3889,
                                  },
                                },
                                object: {
                                  type: 'MemberExpression',
                                  start: 3866,
                                  end: 3884,
                                  loc: {
                                    start: {
                                      line: 135,
                                      column: 21,
                                      index: 3866,
                                    },
                                    end: {
                                      line: 135,
                                      column: 39,
                                      index: 3884,
                                    },
                                  },
                                  object: {
                                    type: 'Identifier',
                                    start: 3866,
                                    end: 3871,
                                    loc: {
                                      start: {
                                        line: 135,
                                        column: 21,
                                        index: 3866,
                                      },
                                      end: {
                                        line: 135,
                                        column: 26,
                                        index: 3871,
                                      },
                                      identifierName: 'state',
                                    },
                                    name: 'state',
                                  },
                                  computed: false,
                                  property: {
                                    type: 'Identifier',
                                    start: 3872,
                                    end: 3884,
                                    loc: {
                                      start: {
                                        line: 135,
                                        column: 27,
                                        index: 3872,
                                      },
                                      end: {
                                        line: 135,
                                        column: 39,
                                        index: 3884,
                                      },
                                      identifierName: 'httpReqsData',
                                    },
                                    name: 'httpReqsData',
                                  },
                                },
                                computed: true,
                                property: {
                                  type: 'Identifier',
                                  start: 3885,
                                  end: 3888,
                                  loc: {
                                    start: {
                                      line: 135,
                                      column: 40,
                                      index: 3885,
                                    },
                                    end: {
                                      line: 135,
                                      column: 43,
                                      index: 3888,
                                    },
                                    identifierName: 'key',
                                  },
                                  name: 'key',
                                },
                              },
                            },
                            operator: '||',
                            right: {
                              type: 'CallExpression',
                              start: 3893,
                              end: 3904,
                              loc: {
                                start: {
                                  line: 135,
                                  column: 48,
                                  index: 3893,
                                },
                                end: {
                                  line: 135,
                                  column: 59,
                                  index: 3904,
                                },
                              },
                              callee: {
                                type: 'Identifier',
                                start: 3893,
                                end: 3902,
                                loc: {
                                  start: {
                                    line: 135,
                                    column: 48,
                                    index: 3893,
                                  },
                                  end: {
                                    line: 135,
                                    column: 57,
                                    index: 3902,
                                  },
                                  identifierName: 'isEditing',
                                },
                                name: 'isEditing',
                              },
                              arguments: [],
                            },
                            extra: {
                              parenthesized: true,
                              parenStart: 3864,
                            },
                          },
                        },
                        consequent: {
                          type: 'BlockStatement',
                          start: 3907,
                          end: 4035,
                          loc: {
                            start: {
                              line: 135,
                              column: 62,
                              index: 3907,
                            },
                            end: {
                              line: 138,
                              column: 9,
                              index: 4035,
                            },
                          },
                          body: [
                            {
                              type: 'VariableDeclaration',
                              start: 3919,
                              end: 3966,
                              loc: {
                                start: {
                                  line: 136,
                                  column: 10,
                                  index: 3919,
                                },
                                end: {
                                  line: 136,
                                  column: 57,
                                  index: 3966,
                                },
                              },
                              declarations: [
                                {
                                  type: 'VariableDeclarator',
                                  start: 3925,
                                  end: 3965,
                                  loc: {
                                    start: {
                                      line: 136,
                                      column: 16,
                                      index: 3925,
                                    },
                                    end: {
                                      line: 136,
                                      column: 56,
                                      index: 3965,
                                    },
                                  },
                                  id: {
                                    type: 'Identifier',
                                    start: 3925,
                                    end: 3937,
                                    loc: {
                                      start: {
                                        line: 136,
                                        column: 16,
                                        index: 3925,
                                      },
                                      end: {
                                        line: 136,
                                        column: 28,
                                        index: 3937,
                                      },
                                      identifierName: 'evaluatedUrl',
                                    },
                                    name: 'evaluatedUrl',
                                  },
                                  init: {
                                    type: 'CallExpression',
                                    start: 3940,
                                    end: 3965,
                                    loc: {
                                      start: {
                                        line: 136,
                                        column: 31,
                                        index: 3940,
                                      },
                                      end: {
                                        line: 136,
                                        column: 56,
                                        index: 3965,
                                      },
                                    },
                                    callee: {
                                      type: 'MemberExpression',
                                      start: 3940,
                                      end: 3960,
                                      loc: {
                                        start: {
                                          line: 136,
                                          column: 31,
                                          index: 3940,
                                        },
                                        end: {
                                          line: 136,
                                          column: 51,
                                          index: 3960,
                                        },
                                      },
                                      object: {
                                        type: 'Identifier',
                                        start: 3940,
                                        end: 3945,
                                        loc: {
                                          start: {
                                            line: 136,
                                            column: 31,
                                            index: 3940,
                                          },
                                          end: {
                                            line: 136,
                                            column: 36,
                                            index: 3945,
                                          },
                                          identifierName: 'state',
                                        },
                                        name: 'state',
                                      },
                                      computed: false,
                                      property: {
                                        type: 'Identifier',
                                        start: 3946,
                                        end: 3960,
                                        loc: {
                                          start: {
                                            line: 136,
                                            column: 37,
                                            index: 3946,
                                          },
                                          end: {
                                            line: 136,
                                            column: 51,
                                            index: 3960,
                                          },
                                          identifierName: 'evalExpression',
                                        },
                                        name: 'evalExpression',
                                      },
                                    },
                                    arguments: [
                                      {
                                        type: 'Identifier',
                                        start: 3961,
                                        end: 3964,
                                        loc: {
                                          start: {
                                            line: 136,
                                            column: 52,
                                            index: 3961,
                                          },
                                          end: {
                                            line: 136,
                                            column: 55,
                                            index: 3964,
                                          },
                                          identifierName: 'url',
                                        },
                                        name: 'url',
                                      },
                                    ],
                                  },
                                },
                              ],
                              kind: 'const',
                            },
                            {
                              type: 'ExpressionStatement',
                              start: 3977,
                              end: 4025,
                              loc: {
                                start: {
                                  line: 137,
                                  column: 10,
                                  index: 3977,
                                },
                                end: {
                                  line: 137,
                                  column: 58,
                                  index: 4025,
                                },
                              },
                              expression: {
                                type: 'CallExpression',
                                start: 3977,
                                end: 4024,
                                loc: {
                                  start: {
                                    line: 137,
                                    column: 10,
                                    index: 3977,
                                  },
                                  end: {
                                    line: 137,
                                    column: 57,
                                    index: 4024,
                                  },
                                },
                                callee: {
                                  type: 'MemberExpression',
                                  start: 3977,
                                  end: 3996,
                                  loc: {
                                    start: {
                                      line: 137,
                                      column: 10,
                                      index: 3977,
                                    },
                                    end: {
                                      line: 137,
                                      column: 29,
                                      index: 3996,
                                    },
                                  },
                                  object: {
                                    type: 'Identifier',
                                    start: 3977,
                                    end: 3982,
                                    loc: {
                                      start: {
                                        line: 137,
                                        column: 10,
                                        index: 3977,
                                      },
                                      end: {
                                        line: 137,
                                        column: 15,
                                        index: 3982,
                                      },
                                      identifierName: 'state',
                                    },
                                    name: 'state',
                                  },
                                  computed: false,
                                  property: {
                                    type: 'Identifier',
                                    start: 3983,
                                    end: 3996,
                                    loc: {
                                      start: {
                                        line: 137,
                                        column: 16,
                                        index: 3983,
                                      },
                                      end: {
                                        line: 137,
                                        column: 29,
                                        index: 3996,
                                      },
                                      identifierName: 'handleRequest',
                                    },
                                    name: 'handleRequest',
                                  },
                                },
                                arguments: [
                                  {
                                    type: 'ObjectExpression',
                                    start: 3997,
                                    end: 4023,
                                    loc: {
                                      start: {
                                        line: 137,
                                        column: 30,
                                        index: 3997,
                                      },
                                      end: {
                                        line: 137,
                                        column: 56,
                                        index: 4023,
                                      },
                                    },
                                    properties: [
                                      {
                                        type: 'ObjectProperty',
                                        start: 3999,
                                        end: 4016,
                                        loc: {
                                          start: {
                                            line: 137,
                                            column: 32,
                                            index: 3999,
                                          },
                                          end: {
                                            line: 137,
                                            column: 49,
                                            index: 4016,
                                          },
                                        },
                                        method: false,
                                        key: {
                                          type: 'Identifier',
                                          start: 3999,
                                          end: 4002,
                                          loc: {
                                            start: {
                                              line: 137,
                                              column: 32,
                                              index: 3999,
                                            },
                                            end: {
                                              line: 137,
                                              column: 35,
                                              index: 4002,
                                            },
                                            identifierName: 'url',
                                          },
                                          name: 'url',
                                        },
                                        computed: false,
                                        shorthand: false,
                                        value: {
                                          type: 'Identifier',
                                          start: 4004,
                                          end: 4016,
                                          loc: {
                                            start: {
                                              line: 137,
                                              column: 37,
                                              index: 4004,
                                            },
                                            end: {
                                              line: 137,
                                              column: 49,
                                              index: 4016,
                                            },
                                            identifierName: 'evaluatedUrl',
                                          },
                                          name: 'evaluatedUrl',
                                        },
                                      },
                                      {
                                        type: 'ObjectProperty',
                                        start: 4018,
                                        end: 4021,
                                        loc: {
                                          start: {
                                            line: 137,
                                            column: 51,
                                            index: 4018,
                                          },
                                          end: {
                                            line: 137,
                                            column: 54,
                                            index: 4021,
                                          },
                                        },
                                        method: false,
                                        key: {
                                          type: 'Identifier',
                                          start: 4018,
                                          end: 4021,
                                          loc: {
                                            start: {
                                              line: 137,
                                              column: 51,
                                              index: 4018,
                                            },
                                            end: {
                                              line: 137,
                                              column: 54,
                                              index: 4021,
                                            },
                                            identifierName: 'key',
                                          },
                                          name: 'key',
                                        },
                                        computed: false,
                                        shorthand: true,
                                        value: {
                                          type: 'Identifier',
                                          start: 4018,
                                          end: 4021,
                                          loc: {
                                            start: {
                                              line: 137,
                                              column: 51,
                                              index: 4018,
                                            },
                                            end: {
                                              line: 137,
                                              column: 54,
                                              index: 4021,
                                            },
                                            identifierName: 'key',
                                          },
                                          name: 'key',
                                        },
                                        extra: {
                                          shorthand: true,
                                        },
                                      },
                                    ],
                                  },
                                ],
                              },
                            },
                          ],
                          directives: [],
                        },
                        alternate: null,
                      },
                    ],
                    directives: [],
                  },
                },
              ],
            },
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 4057,
      end: 4460,
      loc: {
        start: {
          line: 141,
          column: 4,
          index: 4057,
        },
        end: {
          line: 157,
          column: 5,
          index: 4460,
        },
      },
      method: true,
      key: {
        type: 'Identifier',
        start: 4057,
        end: 4072,
        loc: {
          start: {
            line: 141,
            column: 4,
            index: 4057,
          },
          end: {
            line: 141,
            column: 19,
            index: 4072,
          },
          identifierName: 'emitStateUpdate',
        },
        name: 'emitStateUpdate',
      },
      computed: false,
      kind: 'method',
      id: null,
      generator: false,
      async: false,
      params: [],
      body: {
        type: 'BlockStatement',
        start: 4075,
        end: 4460,
        loc: {
          start: {
            line: 141,
            column: 22,
            index: 4075,
          },
          end: {
            line: 157,
            column: 5,
            index: 4460,
          },
        },
        body: [
          {
            type: 'IfStatement',
            start: 4083,
            end: 4454,
            loc: {
              start: {
                line: 142,
                column: 6,
                index: 4083,
              },
              end: {
                line: 156,
                column: 7,
                index: 4454,
              },
            },
            test: {
              type: 'CallExpression',
              start: 4087,
              end: 4098,
              loc: {
                start: {
                  line: 142,
                  column: 10,
                  index: 4087,
                },
                end: {
                  line: 142,
                  column: 21,
                  index: 4098,
                },
              },
              callee: {
                type: 'Identifier',
                start: 4087,
                end: 4096,
                loc: {
                  start: {
                    line: 142,
                    column: 10,
                    index: 4087,
                  },
                  end: {
                    line: 142,
                    column: 19,
                    index: 4096,
                  },
                  identifierName: 'isEditing',
                },
                name: 'isEditing',
              },
              arguments: [],
            },
            consequent: {
              type: 'BlockStatement',
              start: 4100,
              end: 4454,
              loc: {
                start: {
                  line: 142,
                  column: 23,
                  index: 4100,
                },
                end: {
                  line: 156,
                  column: 7,
                  index: 4454,
                },
              },
              body: [
                {
                  type: 'ExpressionStatement',
                  start: 4110,
                  end: 4446,
                  loc: {
                    start: {
                      line: 143,
                      column: 8,
                      index: 4110,
                    },
                    end: {
                      line: 155,
                      column: 10,
                      index: 4446,
                    },
                  },
                  expression: {
                    type: 'CallExpression',
                    start: 4110,
                    end: 4445,
                    loc: {
                      start: {
                        line: 143,
                        column: 8,
                        index: 4110,
                      },
                      end: {
                        line: 155,
                        column: 9,
                        index: 4445,
                      },
                    },
                    callee: {
                      type: 'MemberExpression',
                      start: 4110,
                      end: 4130,
                      loc: {
                        start: {
                          line: 143,
                          column: 8,
                          index: 4110,
                        },
                        end: {
                          line: 143,
                          column: 28,
                          index: 4130,
                        },
                      },
                      object: {
                        type: 'Identifier',
                        start: 4110,
                        end: 4116,
                        loc: {
                          start: {
                            line: 143,
                            column: 8,
                            index: 4110,
                          },
                          end: {
                            line: 143,
                            column: 14,
                            index: 4116,
                          },
                          identifierName: 'window',
                        },
                        name: 'window',
                      },
                      computed: false,
                      property: {
                        type: 'Identifier',
                        start: 4117,
                        end: 4130,
                        loc: {
                          start: {
                            line: 143,
                            column: 15,
                            index: 4117,
                          },
                          end: {
                            line: 143,
                            column: 28,
                            index: 4130,
                          },
                          identifierName: 'dispatchEvent',
                        },
                        name: 'dispatchEvent',
                      },
                    },
                    arguments: [
                      {
                        type: 'NewExpression',
                        start: 4142,
                        end: 4435,
                        loc: {
                          start: {
                            line: 144,
                            column: 10,
                            index: 4142,
                          },
                          end: {
                            line: 154,
                            column: 11,
                            index: 4435,
                          },
                        },
                        callee: {
                          type: 'Identifier',
                          start: 4146,
                          end: 4157,
                          loc: {
                            start: {
                              line: 144,
                              column: 14,
                              index: 4146,
                            },
                            end: {
                              line: 144,
                              column: 25,
                              index: 4157,
                            },
                            identifierName: 'CustomEvent',
                          },
                          name: 'CustomEvent',
                        },
                        typeParameters: {
                          type: 'TSTypeParameterInstantiation',
                          start: 4157,
                          end: 4186,
                          loc: {
                            start: {
                              line: 144,
                              column: 25,
                              index: 4157,
                            },
                            end: {
                              line: 144,
                              column: 54,
                              index: 4186,
                            },
                          },
                          params: [
                            {
                              type: 'TSTypeReference',
                              start: 4158,
                              end: 4185,
                              loc: {
                                start: {
                                  line: 144,
                                  column: 26,
                                  index: 4158,
                                },
                                end: {
                                  line: 144,
                                  column: 53,
                                  index: 4185,
                                },
                              },
                              typeName: {
                                type: 'Identifier',
                                start: 4158,
                                end: 4185,
                                loc: {
                                  start: {
                                    line: 144,
                                    column: 26,
                                    index: 4158,
                                  },
                                  end: {
                                    line: 144,
                                    column: 53,
                                    index: 4185,
                                  },
                                  identifierName: 'BuilderComponentStateChange',
                                },
                                name: 'BuilderComponentStateChange',
                              },
                            },
                          ],
                        },
                        arguments: [
                          {
                            type: 'StringLiteral',
                            start: 4200,
                            end: 4231,
                            loc: {
                              start: {
                                line: 145,
                                column: 12,
                                index: 4200,
                              },
                              end: {
                                line: 145,
                                column: 43,
                                index: 4231,
                              },
                            },
                            extra: {
                              rawValue: 'builder:component:stateChange',
                              raw: "'builder:component:stateChange'",
                            },
                            value: 'builder:component:stateChange',
                          },
                          {
                            type: 'ObjectExpression',
                            start: 4245,
                            end: 4423,
                            loc: {
                              start: {
                                line: 146,
                                column: 12,
                                index: 4245,
                              },
                              end: {
                                line: 153,
                                column: 13,
                                index: 4423,
                              },
                            },
                            properties: [
                              {
                                type: 'ObjectProperty',
                                start: 4261,
                                end: 4408,
                                loc: {
                                  start: {
                                    line: 147,
                                    column: 14,
                                    index: 4261,
                                  },
                                  end: {
                                    line: 152,
                                    column: 15,
                                    index: 4408,
                                  },
                                },
                                method: false,
                                key: {
                                  type: 'Identifier',
                                  start: 4261,
                                  end: 4267,
                                  loc: {
                                    start: {
                                      line: 147,
                                      column: 14,
                                      index: 4261,
                                    },
                                    end: {
                                      line: 147,
                                      column: 20,
                                      index: 4267,
                                    },
                                    identifierName: 'detail',
                                  },
                                  name: 'detail',
                                },
                                computed: false,
                                shorthand: false,
                                value: {
                                  type: 'ObjectExpression',
                                  start: 4269,
                                  end: 4408,
                                  loc: {
                                    start: {
                                      line: 147,
                                      column: 22,
                                      index: 4269,
                                    },
                                    end: {
                                      line: 152,
                                      column: 15,
                                      index: 4408,
                                    },
                                  },
                                  properties: [
                                    {
                                      type: 'ObjectProperty',
                                      start: 4287,
                                      end: 4312,
                                      loc: {
                                        start: {
                                          line: 148,
                                          column: 16,
                                          index: 4287,
                                        },
                                        end: {
                                          line: 148,
                                          column: 41,
                                          index: 4312,
                                        },
                                      },
                                      method: false,
                                      key: {
                                        type: 'Identifier',
                                        start: 4287,
                                        end: 4292,
                                        loc: {
                                          start: {
                                            line: 148,
                                            column: 16,
                                            index: 4287,
                                          },
                                          end: {
                                            line: 148,
                                            column: 21,
                                            index: 4292,
                                          },
                                          identifierName: 'state',
                                        },
                                        name: 'state',
                                      },
                                      computed: false,
                                      shorthand: false,
                                      value: {
                                        type: 'MemberExpression',
                                        start: 4294,
                                        end: 4312,
                                        loc: {
                                          start: {
                                            line: 148,
                                            column: 23,
                                            index: 4294,
                                          },
                                          end: {
                                            line: 148,
                                            column: 41,
                                            index: 4312,
                                          },
                                        },
                                        object: {
                                          type: 'Identifier',
                                          start: 4294,
                                          end: 4299,
                                          loc: {
                                            start: {
                                              line: 148,
                                              column: 23,
                                              index: 4294,
                                            },
                                            end: {
                                              line: 148,
                                              column: 28,
                                              index: 4299,
                                            },
                                            identifierName: 'state',
                                          },
                                          name: 'state',
                                        },
                                        computed: false,
                                        property: {
                                          type: 'Identifier',
                                          start: 4300,
                                          end: 4312,
                                          loc: {
                                            start: {
                                              line: 148,
                                              column: 29,
                                              index: 4300,
                                            },
                                            end: {
                                              line: 148,
                                              column: 41,
                                              index: 4312,
                                            },
                                            identifierName: 'contentState',
                                          },
                                          name: 'contentState',
                                        },
                                      },
                                    },
                                    {
                                      type: 'ObjectProperty',
                                      start: 4330,
                                      end: 4391,
                                      loc: {
                                        start: {
                                          line: 149,
                                          column: 16,
                                          index: 4330,
                                        },
                                        end: {
                                          line: 151,
                                          column: 17,
                                          index: 4391,
                                        },
                                      },
                                      method: false,
                                      key: {
                                        type: 'Identifier',
                                        start: 4330,
                                        end: 4333,
                                        loc: {
                                          start: {
                                            line: 149,
                                            column: 16,
                                            index: 4330,
                                          },
                                          end: {
                                            line: 149,
                                            column: 19,
                                            index: 4333,
                                          },
                                          identifierName: 'ref',
                                        },
                                        name: 'ref',
                                      },
                                      computed: false,
                                      shorthand: false,
                                      value: {
                                        type: 'ObjectExpression',
                                        start: 4335,
                                        end: 4391,
                                        loc: {
                                          start: {
                                            line: 149,
                                            column: 21,
                                            index: 4335,
                                          },
                                          end: {
                                            line: 151,
                                            column: 17,
                                            index: 4391,
                                          },
                                        },
                                        properties: [
                                          {
                                            type: 'ObjectProperty',
                                            start: 4355,
                                            end: 4372,
                                            loc: {
                                              start: {
                                                line: 150,
                                                column: 18,
                                                index: 4355,
                                              },
                                              end: {
                                                line: 150,
                                                column: 35,
                                                index: 4372,
                                              },
                                            },
                                            method: false,
                                            key: {
                                              type: 'Identifier',
                                              start: 4355,
                                              end: 4359,
                                              loc: {
                                                start: {
                                                  line: 150,
                                                  column: 18,
                                                  index: 4355,
                                                },
                                                end: {
                                                  line: 150,
                                                  column: 22,
                                                  index: 4359,
                                                },
                                                identifierName: 'name',
                                              },
                                              name: 'name',
                                            },
                                            computed: false,
                                            shorthand: false,
                                            value: {
                                              type: 'MemberExpression',
                                              start: 4361,
                                              end: 4372,
                                              loc: {
                                                start: {
                                                  line: 150,
                                                  column: 24,
                                                  index: 4361,
                                                },
                                                end: {
                                                  line: 150,
                                                  column: 35,
                                                  index: 4372,
                                                },
                                              },
                                              object: {
                                                type: 'Identifier',
                                                start: 4361,
                                                end: 4366,
                                                loc: {
                                                  start: {
                                                    line: 150,
                                                    column: 24,
                                                    index: 4361,
                                                  },
                                                  end: {
                                                    line: 150,
                                                    column: 29,
                                                    index: 4366,
                                                  },
                                                  identifierName: 'props',
                                                },
                                                name: 'props',
                                              },
                                              computed: false,
                                              property: {
                                                type: 'Identifier',
                                                start: 4367,
                                                end: 4372,
                                                loc: {
                                                  start: {
                                                    line: 150,
                                                    column: 30,
                                                    index: 4367,
                                                  },
                                                  end: {
                                                    line: 150,
                                                    column: 35,
                                                    index: 4372,
                                                  },
                                                  identifierName: 'model',
                                                },
                                                name: 'model',
                                              },
                                            },
                                          },
                                        ],
                                        extra: {
                                          trailingComma: 4372,
                                        },
                                      },
                                    },
                                  ],
                                  extra: {
                                    trailingComma: 4391,
                                  },
                                },
                              },
                            ],
                            extra: {
                              trailingComma: 4408,
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
              directives: [],
            },
            alternate: null,
          },
        ],
        directives: [],
      },
    },
    {
      type: 'ObjectMethod',
      start: 4466,
      end: 4682,
      loc: {
        start: {
          line: 158,
          column: 4,
          index: 4466,
        },
        end: {
          line: 164,
          column: 5,
          index: 4682,
        },
      },
      method: false,
      key: {
        type: 'Identifier',
        start: 4470,
        end: 4495,
        loc: {
          start: {
            line: 158,
            column: 8,
            index: 4470,
          },
          end: {
            line: 158,
            column: 33,
            index: 4495,
          },
          identifierName: 'shouldRenderContentStyles',
        },
        name: 'shouldRenderContentStyles',
      },
      computed: false,
      kind: 'get',
      id: null,
      generator: false,
      async: false,
      params: [],
      returnType: {
        type: 'TSTypeAnnotation',
        start: 4497,
        end: 4506,
        loc: {
          start: {
            line: 158,
            column: 35,
            index: 4497,
          },
          end: {
            line: 158,
            column: 44,
            index: 4506,
          },
        },
        typeAnnotation: {
          type: 'TSBooleanKeyword',
          start: 4499,
          end: 4506,
          loc: {
            start: {
              line: 158,
              column: 37,
              index: 4499,
            },
            end: {
              line: 158,
              column: 44,
              index: 4506,
            },
          },
        },
      },
      body: {
        type: 'BlockStatement',
        start: 4507,
        end: 4682,
        loc: {
          start: {
            line: 158,
            column: 45,
            index: 4507,
          },
          end: {
            line: 164,
            column: 5,
            index: 4682,
          },
        },
        body: [
          {
            type: 'ReturnStatement',
            start: 4515,
            end: 4676,
            loc: {
              start: {
                line: 159,
                column: 6,
                index: 4515,
              },
              end: {
                line: 163,
                column: 8,
                index: 4676,
              },
            },
            argument: {
              type: 'CallExpression',
              start: 4522,
              end: 4675,
              loc: {
                start: {
                  line: 159,
                  column: 13,
                  index: 4522,
                },
                end: {
                  line: 163,
                  column: 7,
                  index: 4675,
                },
              },
              callee: {
                type: 'Identifier',
                start: 4522,
                end: 4529,
                loc: {
                  start: {
                    line: 159,
                    column: 13,
                    index: 4522,
                  },
                  end: {
                    line: 159,
                    column: 20,
                    index: 4529,
                  },
                  identifierName: 'Boolean',
                },
                name: 'Boolean',
              },
              arguments: [
                {
                  type: 'LogicalExpression',
                  start: 4539,
                  end: 4667,
                  loc: {
                    start: {
                      line: 160,
                      column: 8,
                      index: 4539,
                    },
                    end: {
                      line: 162,
                      column: 34,
                      index: 4667,
                    },
                  },
                  left: {
                    type: 'LogicalExpression',
                    start: 4540,
                    end: 4628,
                    loc: {
                      start: {
                        line: 160,
                        column: 9,
                        index: 4540,
                      },
                      end: {
                        line: 161,
                        column: 53,
                        index: 4628,
                      },
                    },
                    left: {
                      type: 'OptionalMemberExpression',
                      start: 4540,
                      end: 4571,
                      loc: {
                        start: {
                          line: 160,
                          column: 9,
                          index: 4540,
                        },
                        end: {
                          line: 160,
                          column: 40,
                          index: 4571,
                        },
                      },
                      object: {
                        type: 'OptionalMemberExpression',
                        start: 4540,
                        end: 4562,
                        loc: {
                          start: {
                            line: 160,
                            column: 9,
                            index: 4540,
                          },
                          end: {
                            line: 160,
                            column: 31,
                            index: 4562,
                          },
                        },
                        object: {
                          type: 'MemberExpression',
                          start: 4540,
                          end: 4556,
                          loc: {
                            start: {
                              line: 160,
                              column: 9,
                              index: 4540,
                            },
                            end: {
                              line: 160,
                              column: 25,
                              index: 4556,
                            },
                          },
                          object: {
                            type: 'Identifier',
                            start: 4540,
                            end: 4545,
                            loc: {
                              start: {
                                line: 160,
                                column: 9,
                                index: 4540,
                              },
                              end: {
                                line: 160,
                                column: 14,
                                index: 4545,
                              },
                              identifierName: 'state',
                            },
                            name: 'state',
                          },
                          computed: false,
                          property: {
                            type: 'Identifier',
                            start: 4546,
                            end: 4556,
                            loc: {
                              start: {
                                line: 160,
                                column: 15,
                                index: 4546,
                              },
                              end: {
                                line: 160,
                                column: 25,
                                index: 4556,
                              },
                              identifierName: 'useContent',
                            },
                            name: 'useContent',
                          },
                        },
                        computed: false,
                        property: {
                          type: 'Identifier',
                          start: 4558,
                          end: 4562,
                          loc: {
                            start: {
                              line: 160,
                              column: 27,
                              index: 4558,
                            },
                            end: {
                              line: 160,
                              column: 31,
                              index: 4562,
                            },
                            identifierName: 'data',
                          },
                          name: 'data',
                        },
                        optional: true,
                      },
                      computed: false,
                      property: {
                        type: 'Identifier',
                        start: 4564,
                        end: 4571,
                        loc: {
                          start: {
                            line: 160,
                            column: 33,
                            index: 4564,
                          },
                          end: {
                            line: 160,
                            column: 40,
                            index: 4571,
                          },
                          identifierName: 'cssCode',
                        },
                        name: 'cssCode',
                      },
                      optional: true,
                    },
                    operator: '||',
                    right: {
                      type: 'OptionalMemberExpression',
                      start: 4585,
                      end: 4628,
                      loc: {
                        start: {
                          line: 161,
                          column: 10,
                          index: 4585,
                        },
                        end: {
                          line: 161,
                          column: 53,
                          index: 4628,
                        },
                      },
                      object: {
                        type: 'OptionalMemberExpression',
                        start: 4585,
                        end: 4620,
                        loc: {
                          start: {
                            line: 161,
                            column: 10,
                            index: 4585,
                          },
                          end: {
                            line: 161,
                            column: 45,
                            index: 4620,
                          },
                        },
                        object: {
                          type: 'OptionalMemberExpression',
                          start: 4585,
                          end: 4607,
                          loc: {
                            start: {
                              line: 161,
                              column: 10,
                              index: 4585,
                            },
                            end: {
                              line: 161,
                              column: 32,
                              index: 4607,
                            },
                          },
                          object: {
                            type: 'MemberExpression',
                            start: 4585,
                            end: 4601,
                            loc: {
                              start: {
                                line: 161,
                                column: 10,
                                index: 4585,
                              },
                              end: {
                                line: 161,
                                column: 26,
                                index: 4601,
                              },
                            },
                            object: {
                              type: 'Identifier',
                              start: 4585,
                              end: 4590,
                              loc: {
                                start: {
                                  line: 161,
                                  column: 10,
                                  index: 4585,
                                },
                                end: {
                                  line: 161,
                                  column: 15,
                                  index: 4590,
                                },
                                identifierName: 'state',
                              },
                              name: 'state',
                            },
                            computed: false,
                            property: {
                              type: 'Identifier',
                              start: 4591,
                              end: 4601,
                              loc: {
                                start: {
                                  line: 161,
                                  column: 16,
                                  index: 4591,
                                },
                                end: {
                                  line: 161,
                                  column: 26,
                                  index: 4601,
                                },
                                identifierName: 'useContent',
                              },
                              name: 'useContent',
                            },
                          },
                          computed: false,
                          property: {
                            type: 'Identifier',
                            start: 4603,
                            end: 4607,
                            loc: {
                              start: {
                                line: 161,
                                column: 28,
                                index: 4603,
                              },
                              end: {
                                line: 161,
                                column: 32,
                                index: 4607,
                              },
                              identifierName: 'data',
                            },
                            name: 'data',
                          },
                          optional: true,
                        },
                        computed: false,
                        property: {
                          type: 'Identifier',
                          start: 4609,
                          end: 4620,
                          loc: {
                            start: {
                              line: 161,
                              column: 34,
                              index: 4609,
                            },
                            end: {
                              line: 161,
                              column: 45,
                              index: 4620,
                            },
                            identifierName: 'customFonts',
                          },
                          name: 'customFonts',
                        },
                        optional: true,
                      },
                      computed: false,
                      property: {
                        type: 'Identifier',
                        start: 4622,
                        end: 4628,
                        loc: {
                          start: {
                            line: 161,
                            column: 47,
                            index: 4622,
                          },
                          end: {
                            line: 161,
                            column: 53,
                            index: 4628,
                          },
                          identifierName: 'length',
                        },
                        name: 'length',
                      },
                      optional: true,
                    },
                    extra: {
                      parenthesized: true,
                      parenStart: 4539,
                    },
                  },
                  operator: '&&',
                  right: {
                    type: 'BinaryExpression',
                    start: 4643,
                    end: 4667,
                    loc: {
                      start: {
                        line: 162,
                        column: 10,
                        index: 4643,
                      },
                      end: {
                        line: 162,
                        column: 34,
                        index: 4667,
                      },
                    },
                    left: {
                      type: 'Identifier',
                      start: 4643,
                      end: 4649,
                      loc: {
                        start: {
                          line: 162,
                          column: 10,
                          index: 4643,
                        },
                        end: {
                          line: 162,
                          column: 16,
                          index: 4649,
                        },
                        identifierName: 'TARGET',
                      },
                      name: 'TARGET',
                    },
                    operator: '!==',
                    right: {
                      type: 'StringLiteral',
                      start: 4654,
                      end: 4667,
                      loc: {
                        start: {
                          line: 162,
                          column: 21,
                          index: 4654,
                        },
                        end: {
                          line: 162,
                          column: 34,
                          index: 4667,
                        },
                      },
                      extra: {
                        rawValue: 'reactNative',
                        raw: "'reactNative'",
                      },
                      value: 'reactNative',
                    },
                  },
                },
              ],
            },
          },
        ],
        directives: [],
      },
    },
  ],
  extra: {
    trailingComma: 4682,
  },
} as any as babel.types.ObjectExpression;
