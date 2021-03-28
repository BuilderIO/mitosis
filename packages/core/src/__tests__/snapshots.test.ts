import fs from 'fs';
import path from 'path';
import { parseJsx } from '../parsers/jsx';
import { builderContentToJsxLiteComponent } from '../parsers/builder';
import { componentToBuilder } from '../generators/builder';
import { componentToJsxLite } from '../generators/jsx-lite';
import { componentToHtml } from '../generators/html';
import { componentToLiquid } from '../generators/liquid';
import { componentToReact } from '../generators/react';
import { componentToSolid } from '../generators/solid';
import { componentToVue } from '../generators/vue';
import { TestDataLoader, TestData } from './loaders/test-data-loader';

describe('Snapshot tests', () => {
  const dataLoader = new TestDataLoader({ subdirectories: true });
  const testCases = dataLoader.load(path.resolve(__dirname, './data'));

  describe('Builder', () => {
    testCases.forEach((data: TestData) => {
      test(data.name, () => {
        const jsx = fs.readFileSync(data.file, 'utf8');
        const json = parseJsx(jsx);
        const builderJson = componentToBuilder(json);
        expect(builderJson).toMatchSnapshot();

        const backToJsxLite = builderContentToJsxLiteComponent(builderJson);
        const jsxLite = componentToJsxLite(backToJsxLite);
        expect(jsxLite).toMatchSnapshot();
      });
    });
  });

  describe('Html', () => {
    testCases.forEach((data: TestData) => {
      test(data.name, () => {
        const jsx = fs.readFileSync(data.file, 'utf8');
        const json = parseJsx(jsx);
        const output = componentToHtml(json);

        expect(output).toMatchSnapshot();
      });
    });
  });

  describe('Liquid', () => {
    testCases.forEach((data: TestData) => {
      test(data.name, () => {
        const jsx = fs.readFileSync(data.file, 'utf8');
        const json = parseJsx(jsx);
        const output = componentToLiquid(json);

        expect(output).toMatchSnapshot();
      });
    });
  });

  describe('React', () => {
    testCases.forEach((data: TestData) => {
      test(data.name, () => {
        const jsx = fs.readFileSync(data.file, 'utf8');
        const json = parseJsx(jsx);
        const output = componentToReact(json);

        expect(output).toMatchSnapshot();
      });
    });
  });

  describe('Solid', () => {
    testCases.forEach((data: TestData) => {
      test(data.name, () => {
        const jsx = fs.readFileSync(data.file, 'utf8');
        const json = parseJsx(jsx);
        const output = componentToSolid(json);

        expect(output).toMatchSnapshot();
      });
    });
  });

  describe('Vue', () => {
    testCases.forEach((data: TestData) => {
      test(data.name, () => {
        const jsx = fs.readFileSync(data.file, 'utf8');
        const json = parseJsx(jsx);
        const output = componentToVue(json);

        expect(output).toMatchSnapshot();
      });
    });
  });
});
