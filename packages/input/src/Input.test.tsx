import * as React from 'react';
import { render } from '@testing-library/react';

import { Input } from './Input';

describe('Input', () => {
  test('should match snapshot and styles for default props', () => {
    expect(render(<Input />).asFragment()).toMatchSnapshot();
  });

  test('should match snapshot with label', () => {
    const wrapper = render(<Input id="test" label="Name" />);
    expect(wrapper.asFragment()).toMatchSnapshot();
  });
});
