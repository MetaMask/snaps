module.exports = {
  name: `plugin-workspaces-filter`,
  factory: (require) => {
    const { BaseCommand } = require('@yarnpkg/cli');
    const { Configuration, Project, StreamReport } = require('@yarnpkg/core');
    const { Command, Option, UsageError } = require('clipanion');
    const { isString, isBoolean } = require('typanion');

    class FilterListCommand extends BaseCommand {
      static paths = [['workspaces', 'filter', 'list']];

      static usage = Command.Usage({
        description: 'Filter workspaces',
        details: `
          This command will filter workspaces based on the given criteria. It's
           like \`yarn workspaces list\` but on steroids.
        `,
        examples: [
          [
            `List workspaces based on a glob pattern`,
            `yarn workspaces filter list --include "packages/*"`,
          ],
          [
            'Exclude workspaces based on a glob pattern',
            `yarn workspaces filter list --exclude "packages/*/foo"`,
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

      /**
       * List the names of the workspaces. If `--json` is set, the names will be
       * printed as a JSON array.
       *
       * @param {Workspace[]} workspaces
       * @param {Configuration} configuration
       * @returns {Promise<number>}
       */
      async list(workspaces, configuration) {
        const report = await StreamReport.start(
          {
            configuration,
            json: this.json,
            stdout: this.context.stdout,
          },
          async (report) => {
            for (const workspace of workspaces) {
              report.reportInfo(null, workspace.relativeCwd);
            }

            const result = workspaces.map((workspace) => workspace.manifest.raw.name);
            report.reportJson(result);
          },
        );

        return report.exitCode();
      }

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

        const filteredWorkspaces = workspaces.filter((workspace) => {
          return (
            (!this.include ||
              minimatch(workspace.relativeCwd, this.include)) &&
            (!this.exclude ||
              !minimatch(workspace.relativeCwd, this.exclude))
          );
        });

        return await this.list(filteredWorkspaces, configuration);
      }
    }

    class FilterRunCommand extends BaseCommand {
      static paths = [['workspaces', 'filter']];

      static usage = Command.Usage({
        description: 'Filter workspaces',
        details: `
          This command will run a command in workspaces based on the given
          criteria. It's like \`yarn workspaces foreach\` but on steroids.
        `,
        examples: [
          [
            `List workspaces based on a glob pattern`,
            `yarn workspaces filter --include "packages/*" run build`,
          ],
          [
            'Exclude workspaces based on a glob pattern',
            `yarn workspaces filter --exclude "packages/*/foo" run build`,
          ],
        ],
      });

      commandName = Option.String({
        required: true,
        description: `The name of the command to run`,
        validator: isString,
      });

      args = Option.Proxy({
        required: false,
      });

      parallel = Option.Boolean(`--parallel`, {
        default: false,
        description: `Run the commands in parallel`,
        validator: isBoolean,
      });

      topological = Option.Boolean(`--topological`, false, {
        description: `Run the commands in topological order`,
        validator: isBoolean,
      });

      include = Option.String('--include', {
        description: `List workspaces based on a glob pattern`,
        validator: isString,
      });

      exclude = Option.String('--exclude', {
        description: `Exclude workspaces based on a glob pattern`,
        validator: isString,
      });

      noPrivate = Option.Boolean(`--no-private`, false, {
        description: `Exclude private workspaces`,
        validator: isBoolean,
      });

      /**
       * Run the given command on the workspaces.
       *
       * @param workspaces - The workspaces to run the command on.
       * @param commandName - The name of the command to run.
       * @param args - The arguments to pass to the command.
       * @return {Promise<void>}
       */
      async run(workspaces, commandName, args) {
        let extraArgs = [];
        if (this.parallel) {
          extraArgs.push('--parallel');
        }

        if (this.topological) {
          extraArgs.push('--topological');
          extraArgs.push('--topological-dev');
        }

        const includes = workspaces.map((workspace) => workspace.manifest.name)
          .flatMap(({ scope, name }) => ['--include', `@${scope}/${name}`]);

        await this.cli.run(['workspaces', 'foreach', '--verbose', ...includes, ...extraArgs, commandName, ...args], this.context);
      }

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

        const filteredWorkspaces = workspaces.filter((workspace) => {
          return (
            (!this.include ||
              minimatch(workspace.relativeCwd, this.include)) &&
            (!this.exclude ||
              !minimatch(workspace.relativeCwd, this.exclude))
          );
        }).filter((workspace) => {
          return !this.noPrivate || !workspace.manifest.private;
        });

        return await this.run(filteredWorkspaces, this.commandName, this.args);
      }
    }

    return {
      commands: [FilterListCommand, FilterRunCommand],
    };
  },
};
