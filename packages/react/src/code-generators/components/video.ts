import { BuilderElement } from '@builder.io/sdk';
import { style } from '../functions/style';
import { component } from '../constants/components';

export const Video = component({
  name: 'Video',
  component: (block, jsxOptions, context) => {
    const { options } = block.component!;

    return `
      <div ${style({ position: 'relative' }, jsxOptions)}>
        <video
          poster={${options.poster}}
          loop={${options.loop}}
          muted={${options.muted}}
          controls={${options.controls}}
          autoPlay={${options.autoPlay}}
          ${style(
            {
              objectFit: options.backgroundSize || 'cover',
              objectPosition: options.backgroundPosition || 'center',
              ...(options.aspectRatio && {
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: '0',
                left: '0',
              }),
            },
            jsxOptions
          )}>
          <source type="video/mp4" src="${options.video}" />
        </video>

      ${
        options.aspectRatio
          ? `<div
          className="builder-video-sizer"
          ${style(
            {
              width: '100%',
              paddingTop: options.aspectRatio * 100 + '%',
              pointerEvents: 'none',
              fontSize: '0',
            },
            jsxOptions
          )}></div>`
          : ''
      }
      ${
        block.children && block.children.length
          ? `
        <div
          ${style(
            {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            },
            jsxOptions
          )}
        >
          ${block.children
            .map((block: BuilderElement, index: number) => blockToJsx(block, jsxOptions, context))
            .join('\n')}
        </div>`
          : ''
      }
      </div>
`;
  },
});

import { blockToJsx } from '../../builder-to-jsx';
