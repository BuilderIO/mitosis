import React, { AnchorHTMLAttributes } from 'react';
import { colors } from '../constants/colors';

export function TextLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a rel="noreferrer" css={{ color: colors.primary, cursor: 'pointer' }} {...props} />;
}
