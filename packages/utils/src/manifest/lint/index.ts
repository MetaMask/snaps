import { VFile } from 'vfile';
import processor from './processor';
import reporter from './reporter';

export function lint(
  vfile: VFile,
  opts: { fix?: boolean; sourceCode?: string } = {},
): Promise<VFile> {
  vfile.data.shouldFix = opts.fix ?? false;
  vfile.data.sourceCode = opts.sourceCode;
  return processor.process(vfile);
}

export { reporter };
