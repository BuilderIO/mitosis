import { component } from '../constants/components';

export const Symbol = component({
  name: 'Symbol',
  component: (block, options, context) => {
    const {
      options: {
        symbol: { inline, content, entry, data, dynamic, model },
      },
    } = block.component!;
    if (!content) {
      console.warn('Symbol is missing content', block);
      return '';
    }

    // TODO: take into account jsCode etc. e.g. make this a separate components
    // that is references here instead

    const symbolName = `Symbol${++context.symbolCount}`;

    if (options.format === 'react') {
      let code = contentToJsx(content, { ...options, symbol: true, name: symbolName }, context);
      context.prependCode = context.prependCode + '\n' + code;

      // TODO: context={context}
      return `<div className="builder-symbol${inline ? ' builder-inline-symbol' : ''}">
        <${symbolName} context={context} />
      </div>`;

      // TODO: use when SDK updated
      // return `<BuilderPage entry="${entry}" model="${model}" data={${JSON.stringify(
      //   data || {}
      // )}} content={${JSON.stringify({
      //   ...content,
      //   data: {
      //     ...content?.data,
      //     blocksJs: innerContent,
      //     blocks: undefined,
      //   },
      // })}} />`;
    }

    const innerContent =
      content?.data?.blocks?.map((item: any) => blockToJsx(item, options, context)).join('\n') ||
      '';

    return `
    {(() => {
      const [state, setState] = createState(${JSON.stringify(content?.data?.state || {})});

      return (<div className="builder-symbol${inline ? ' builder-inline-symbol' : ''}">
        ${innerContent}
      </div>)
    })()}
    `;
  },
});

import { blockToJsx, contentToJsx } from '../../builder-to-jsx';
