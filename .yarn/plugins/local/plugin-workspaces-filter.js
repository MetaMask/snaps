module.exports = {
  name: `plugin-workspaces-filter`,
  factory: (require) => {
    const { BaseCommand } = require('@yarnpkg/cli');
    const { Configuration, Project, StreamReport } = require('@yarnpkg/core');
    const { Command, Option, UsageError } = require('clipanion');
    const { isString, isBoolean } = require('typanion');

    class FilterCommand extends BaseCommand {
      static paths = [['workspaces', 'filter']];

      static usage = Command.Usage({
        description: 'Filter workspaces',
        details: `
          This command will filter workspaces based on the given criteria. It's
           like \`yarn workspaces list\` but on steroids.
        `,
        examples: [
          [
            `List workspaces based on a glob pattern`,
            `yarn workspaces filter --include "packages/*"`,
          ],
          [
            'Exclude workspaces based on a glob pattern',
            `yarn workspaces filter --exclude "packages/*/foo"`,
          ],
        ],
      });

      include = Option.String('--include', {
        description: `List workspaces based on a glob pattern`,
        validator: isString,
      });

      exclude = Option.String('--exclude', {
        description: `Exclude workspaces based on a glob pattern`,
        validator: isString,
      });

      json = Option.Boolean(`--json`, false, {
        description: `Format the output as a JSON array`,
        validator: isBoolean,
      });

      async execute() {
        // Note: We have to import `minimatch` here, because Yarn will always
        // load the plugin, even if the command is not used, and `minimatch`
        // may not be installed.
        const { minimatch } = await import('minimatch');

        const configuration = await Configuration.find(
          this.context.cwd,
          this.context.plugins,
        );
        const { project } = await Project.find(configuration, this.context.cwd);
        const { workspaces } = project;

        if (!this.include && !this.exclude) {
          throw new UsageError(
            `This command requires at least one of --include or --exclude to be specified.`,
          );
        }

        const report = await StreamReport.start(
          {
            configuration,
            json: this.json,
            stdout: this.context.stdout,
          },
          async (report) => {
            const filteredWorkspaces = workspaces.filter((workspace) => {
              return (
                (!this.include ||
                  minimatch(workspace.relativeCwd, this.include)) &&
                (!this.exclude ||
                  !minimatch(workspace.relativeCwd, this.exclude))
              );
            });

            for (const workspace of filteredWorkspaces) {
              report.reportInfo(null, workspace.relativeCwd);
            }

            const result = filteredWorkspaces.map((workspace) => workspace.manifest.raw.name);
            report.reportJson(result);
          },
        );

        return report.exitCode();
      }
    }

    return {
      commands: [FilterCommand],
    };
  },
};
