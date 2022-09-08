import traverse from 'traverse';
import { MitosisComponent } from '../types/mitosis-component';

const propsRegex = /props\s*\.\s*([a-zA-Z0-9_\$]+)/;
const allPropsMatchesRegex = new RegExp(propsRegex, 'g');

// copied from https://github.com/vuejs/core/blob/fa6556a0d56eeff1fec4f948460351ccf8f99f35/packages/compiler-core/src/validateExpression.ts
// typeof, instanceof and in are allowed
const prohibitedKeywordRE = new RegExp(
  '\\b' +
    (
      'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
      'super,throw,while,yield,delete,export,import,return,switch,default,' +
      'extends,finally,continue,debugger,function,arguments,typeof,void'
    )
      .split(',')
      .join('\\b|\\b') +
    '\\b',
);

/**
 * Get props used in the components by reference
 */
export const getProps = (json: MitosisComponent) => {
  const props = new Set<string>();
  traverse(json).forEach(function (item) {
    if (typeof item === 'string') {
      // TODO: proper babel ref matching
      const matches = item.match(allPropsMatchesRegex);
      if (matches) {
        for (const match of matches) {
          const prop = match.match(propsRegex)![1];
          if (prop.match(prohibitedKeywordRE)) {
            throw new Error(`avoid using JavaScript keyword as property name: "${prop}"`);
          }
          props.add(prop);
        }
      }
    }
  });

  return props;
};
