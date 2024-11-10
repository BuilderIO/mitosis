import { xyz } from '../meta';
import { MetaModel } from './meta-model';

export const abc: MetaModel = {
  stringValue: 'd',
  booleanValue: true,
  numberValue: 1,
  innerObject: { stringValue: 'inner', numberValue: 2, booleanValue: false },
  ...xyz,
};

const aaa: MetaModel = { stringValue: 'i', ...xyz };

export default aaa;
