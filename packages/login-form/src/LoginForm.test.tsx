import React from 'react';
import { render } from '@testing-library/react';

import { LoginForm } from './LoginForm';

jest.mock('@taxi/input', () => ({ Input: 'input' }));

describe('LoginForm', () => {
  test('should match snapshot and styles', () => {
    expect(render(<LoginForm />).container).toMatchSnapshot();
  });
});
