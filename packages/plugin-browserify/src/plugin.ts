import { BrowserifyObject } from 'browserify';
import { Options } from './options';
import { getTransform } from './bundle';

export default function plugin(
  browserify: BrowserifyObject,
  options: Partial<Options>,
) {
  browserify.transform(getTransform, options);
}
