import { wrap } from 'trough';
import { Plugin } from 'unified';
import { Node } from 'unist';
import { VFile } from 'vfile';

export type Fix<Tree extends Node = Node> = () => Promise<Tree> | Tree;

export type Rule<Tree extends Node = Node, Options = unknown> = (
  node: Tree,
  file: VFile,
  options: Options,
) => Promise<Fix<Tree> | void> | Fix<Tree> | undefined | void;

export enum Severity {
  Info = 0,
  Warning = 1,
  Fatal = 2,
}

// Inspired by https://github.com/remarkjs/remark-lint/tree/main/packages/unified-lint-rule
// But we also want to allow fixing and out of band info messages (file.info should not raise Warning)
export function lintRule<Tree extends Node = Node, Options = unknown>(
  meta: string | { origin: string; severity?: Severity },
  rule: Rule<Tree, Options>,
): Plugin<void[] | [Options], Tree> {
  const metaObj = typeof meta === 'string' ? { origin: meta } : meta;

  const id = metaObj.origin;
  const parts = id.split(':');
  const source: string | undefined = parts[1] ? parts[0] : undefined;
  const ruleId: string | undefined = parts[1];

  const severity = metaObj.severity ?? Severity.Warning;
  const fatal = severity === Severity.Info ? null : severity === Severity.Fatal;

  return function (config: Options) {
    return (tree, file, next) => {
      const shouldFix = file.data.shouldFix ?? false;
      let index = file.messages.length - 1;

      wrap(rule, (error, fixer: Fix<Tree> | undefined) => {
        const messages = file.messages;

        if (error) {
          try {
            file.fail(error);
          } catch {}
        }

        while (++index < messages.length) {
          Object.assign(messages[index], {
            ruleId,
            source,
            fatal: messages[index] === null ? null : fatal,
          });
        }

        if (!error && shouldFix && fixer) {
          wrap(fixer, (error, node: Tree) => {
            next(error, node);
          })();
        } else {
          next();
        }
      })(tree, file, config);
    };
  } as Plugin<any[], Tree>;
}
