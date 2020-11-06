import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { LoginForm } from './LoginForm';

storiesOf('LoginForm', module).add('default', () => {
  const onClick = action('logIn clicked');
  return <LoginForm onClick={onClick} />;
});
