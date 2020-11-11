import React, { AnchorHTMLAttributes } from 'react';
import { colors } from '../constants/colors';

export function TextLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      rel="noreferrer"
      css={{ color: colors.primary, cursor: 'pointer' }}
      {...props}
    />
  );
}
