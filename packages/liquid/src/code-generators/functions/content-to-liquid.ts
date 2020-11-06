import { BuilderElement, BuilderContent } from '@builder.io/sdk';
import { format } from 'prettier/standalone';
import * as parserCss from 'prettier/parser-postcss';
import * as parserHtml from 'prettier/parser-html';
import type { Options as PrettierOptions } from 'prettier';
import { blockToLiquid } from './block-to-liquid';
import { Options } from '../interfaces/options';
import { fastClone } from './fast-clone';
import CleanCSS from 'clean-css';
import * as csso from 'csso';
import { omit } from 'lodash';
import { variantsScript } from './variants-script';

function getCssFromFont(font: any) {
  // TODO: compute what font sizes are used and only load those.......
  const family = font.family + (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '');
  const name = family.split(',')[0];
  const url = font.fileUrl ? font.fileUrl : font.files && font.files.regular;
  let str = '';
  if (url && family && name) {
    str += `
@font-face {
  font-family: "${family}";
  src: local("${family}"), url('${url}') format('woff2');
  font-display: fallback;
  font-weight: 400;
}
`.trim();
  }

  if (font.files) {
    for (const weight in font.files) {
      // TODO: maybe limit number loaded
      const weightUrl = font.files[weight];
      if (weightUrl && weightUrl !== url) {
        str += `
@font-face {
  font-family: "${family}";
  src: url('${weightUrl}') format('woff2');
  font-display: fallback;
  font-weight: ${weight};
}
        `.trim();
      }
    }
  }
  return str;
}

function getFontCss(data: any) {
  // TODO: separate internal data from external
  return (
    data.customFonts &&
    data.customFonts.length &&
    data.customFonts.map((font: any) => getCssFromFont(font)).join(' ')
  );
}

function getCss(data: any) {
  // .replace(/([^\s]|$)&([^\w])/g, '$1' + '.some-selector' + '$2')
  // todo: Validate data.cssCode
  return (data.cssCode || '') + (getFontCss(data) || '');
}

export const convertTemplateLiteralsToTags = (liquid: string, options: Options = {}) => {
  return (
    liquid
      // Template interpolate tokens
      // HACK: get this into the appropriate place
      .replace(/context\.(shopify\.)?liquid\.get\(\s*"(.*?)"\s*state\)/g, '$2')
      // TODO: can have double quotes in value
      .replace(
        /{{\s*context\.(shopify\.)?liquid\.render\(("|&quot;)(.*?)("|&quot;),\s*state\)\s*}}/g,
        '$3'
      )
  );
};

const regexParse = (html: string) => {
  const cssSet = new Set();
  const newHtml = html.replace(/<style.*?>([\s\S]*?)<\/style>/g, (match, cssString) => {
    cssSet.add(cssString);
    return '';
  });
  return {
    css: Array.from(cssSet.values())
      .join(' ')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/ \S+:\s+;/g, '')
      .replace(/\s+/g, ' ')
      .trim(),

    html: newHtml,
  };
};

const prettify = (str: string, options?: PrettierOptions) => {
  try {
    return format(str, {
      ...options,
      plugins: [parserHtml, parserCss].concat((options?.plugins || []) as any[]), // TODO: how replace too
    });
  } catch (err) {
    console.warn('Could not format code', err, { code: str });
  }

  return str;
};

export function contentToLiquid(json: BuilderContent, modelName: string, options: Options = {}) {
  const content = fastClone(json);

  if (content.data && content.data.blocksString) {
    content.data.blocks = JSON.parse(content.data.blocksString);
    delete content.data.blocksString;
  }

  if (content.variations) {
    for (const key in content.variations) {
      const value = content.variations[key];
      if (value && value.data && value.data.blocksString) {
        value.data = {
          ...omit(value.data, 'blocksString'),
          blocks: JSON.parse(value.data.blocksString),
        };
      }
    }
  }
  const blocks = content.data && content.data.blocks;

  const hasTests = Object.keys(content.variations || {}).length;

  const variationsJson =
    hasTests &&
    Object.keys(content.variations || {}).map(item => ({
      id: item,
      testRatio: content.variations![item]!.testRatio,
    }));

  const wrap = options?.wrap !== false;
  const useBuilderSignature = options?.useBuilderSignature !== false;

  const innerContent = blocks
    ? blocks.map((block: BuilderElement) => blockToLiquid(block, options)).join('\n')
    : '';

  // TODO: optimize CSS to remove redundancy
  let { html, css } = regexParse(
    !wrap
      ? innerContent
      : `
  <div class="builder-component" data-name="${modelName}">

  ${Object.keys(content.variations || {})
    .map(key => {
      const value = content.variations![key]!;
      const blocks = value.data!.blocks;

      return `<template data-template-variant-id="${key}"><div
    class="builder-content"
    data-builder-content-id="${content.id}"
    data-builder-variaion-id="${key}"
    data-builder-component="${modelName}"
  >
    <div 
      builder-content-id="${content.id}"
      builder-model="${modelName}">
      ${
        blocks
          ? blocks.map((block: BuilderElement) => blockToLiquid(block, options)).join('\n')
          : ''
      }
    </div>
  </div></template>`;
    })
    .join('\n')}
  ${
    !hasTests
      ? ''
      : `<script> ${variantsScript(JSON.stringify(variationsJson), content.id!)} </script>`
  }

    <div
      class="builder-content"
      data-builder-content-id="${content.id}"
      data-builder-component="${modelName}"
      data-builder-variation-id="${content.id}"
    >
      <div 
        builder-content-id="${content.id}"
        builder-model="${modelName}">
        ${innerContent}
      </div>
    </div>
    </div>
    `.replace(/\s+/g, ' ')
  );

  css = css + getCss(json.data);

  // Optimize CSS (todo: option to not do)
  const minResult = new CleanCSS({
    level: {
      2: {
        restructureRules: true,
        mergeSemantically: true,
      },
    },
  }).minify(css);

  css = minResult.styles;

  if (css.length > 50000) {
    // Minify further CSS that is greater than 100kb
    const cssOutput = csso.minify(css, {
      restructure: true,
      forceMediaMerge: true,
    });

    css = `\n/*** Builder.io minifies CSS over 50kb ***/\n` + cssOutput.css;
  }

  // HTML > 100kb
  if (html.length > 100000) {
    // Smart whitespace stripping preserving newlines in scripts
    html =
      `\n<!-- Builder.io minifies HTML over 100kb -->\n` +
      html
        // Replace all non-script text remove whitespace
        .replace(/(^|<\/script>)[\s\S]*?<script/g, match => match.replace(/\s+/g, ' '))
        .replace(/<script[\s\S]*?<\/script>/g, match =>
          match.replace(/[ \t]{2,}/g, ' ').replace(/\n{2,}/g, '\n')
        );
  }

  if (!options.extractCss) {
    html =
      `<style type="text/css" class="builder-styles builder-api-styles">${
        css
          // Add a newlinw space between each CSS block
          .replace(/\n}/g, '\n}\n')
          // Add two spaces before each line that has content (indent into the <style> tag)
          .split('\n')
          .map(item => (item.length ? '  ' + item : item))
          .join('\n')
        // Close style tag and add html
      }\n</style>` + html;
    css = '';
  }

  const SHORTEN_IDS = true;
  if (SHORTEN_IDS) {
    // Shorten builder content further by removing builder-id="..." from content as it's only
    // needed once JS loads for things like tracking
    html = html.replace(/\s+builder-id=".+?"/g, '');
    // Shorten content even further by converting builder-id's (builder-*) which are UUIDv4
    // with dashes removed, to their first 6 characters, as similar to shortenned git hashes
    // the likelihood of collision, e.g. on the one page this will render on, is *extremely* small
    // https://stackoverflow.com/a/43666212
    // This is matching specifically for builder-id="..." and .builder-... and class="builder-block builder-..."
    html = html.replace(
      /([\s\n]builder-id="|\.|builder-block |class=")builder-([a-f0-9]{7,})([+>~"\[\s\n\.{,])/g,
      (match, group1, group2, group3) =>
        // Make sure group2 has a nuber - if not it may be something like builder-columns
        // and not builder-a4fa0ac28valk
        !/[0-9]/.test(group2) ? match : `${group1}builder-${group2.slice(0, 7)}${group3}`
    );

    // Way to force preserving full IDs when needed. Currently only CustomCode.tsx needs this
    // https://github.com/BuilderIO/builder/blob/c68ebcd/packages/react/src/blocks/CustomCode.tsx#L29:L29
    html = html.replace(/([\s\n])builder-full-id=/g, '$1builder-id=');
  }

  const dateString = new Date().toUTCString();
  html = `\n<!-- ***** Generated by Builder.io on ${dateString} ***** -->\n\n` + html;

  // TODO: option to not minify, e.g. to get code as HTML prettified
  // Only prettify small (< 80kb) content to stay within shopify's 256kb per file limit
  if (!options.skipPrettier && html.length < 80000) {
    html = prettify(html, {
      ...options.prettierOptions,
      parser: 'html',
    });
  }

  return {
    html,
    css: css || undefined,
  };
}
