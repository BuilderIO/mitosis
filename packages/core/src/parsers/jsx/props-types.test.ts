import { createTypescriptProject } from '../../helpers/typescript-project';
import { findOptionalProps } from './props-types';

describe(findOptionalProps.name, () => {
  /**
   * We can piggyback on the `core` project's TS config, since we are allowed to reference `@builder.io/mitosis`
   * recursively inside of itself.
   * This avoids the need to create a mock TS project just for testing.
   */
  const tsProject = createTypescriptProject(__dirname + '/../../../tsconfig.json');

  test('types', () => {
    const code = `
    type Kaboom = {
      foo?: string
    }
    
    type Props = Kaboom & {
      normal: string;
      bar: boolean
      id?: number;
    }
    
    export default function InlinedStyles(props: Props) {
      return props;
    }
    `;
    tsProject.project.createSourceFile('src/testing.tsx', code, { overwrite: true });

    const result = findOptionalProps({ filePath: 'src/testing.tsx', ...tsProject });
    expect(result).toMatchSnapshot();
  });

  test('interfaces', () => {
    const code = `
    type Kaboom = {
      foo?: string
    }
    
    interface Props extends Kaboom {
      styles: string;
      id?: string;
    }
    
    export default function InlinedStyles(props: Props) {
      return props;
    }
    `;
    tsProject.project.createSourceFile('src/testing.tsx', code, { overwrite: true });

    const result = findOptionalProps({ filePath: 'src/testing.tsx', ...tsProject });
    expect(result).toMatchSnapshot();
  });

  test('type extending interface', () => {
    const code = `
    interface Kaboom {
      foo?: string
    }
    
    type Props = Kaboom & {
      styles: string;
      id?: string;
    }
    
    export default function InlinedStyles(props: Props) {
      return props;
    }
    `;
    tsProject.project.createSourceFile('src/testing.tsx', code, { overwrite: true });

    const result = findOptionalProps({ filePath: 'src/testing.tsx', ...tsProject });
    expect(result).toMatchSnapshot();
  });
});
