// @ts-check

/**
 * Run an array of tasks in sequence.
 *
 * @param tasks {Array<Function>} - An array of functions that return a promise
 * that resolves to an exit code.
 * @returns {Promise<number>} - The exit code of the first task that returns a
 * non-zero exit code, or 0 if all tasks return 0.
 */
async function sequence(tasks) {
  for (const task of tasks) {
    const exitCode = await task();

    if (exitCode !== 0) {
      return exitCode;
    }
  }

  return 0;
}

/**
 * Run a lifecycle script.
 *
 * @param {import('@yarnpkg/core').Workspace} workspace - The workspace to run
 * the script in.
 * @param {string} scriptName - The name of the script to run.
 * @param {Function} require - The require function to use.
 */
function getLifecycleTask(workspace, scriptName, require) {
  const { scriptUtils } = require('@yarnpkg/core');

  return async () => {
    if (scriptUtils.hasWorkspaceScript(workspace, scriptName)) {
      return scriptUtils.executeWorkspaceScript(workspace, scriptName, [], {
        cwd: workspace.cwd,
      });
    }

    return 0;
  };
}

/**
 * A Yarn plugin that calls lifecycle scripts before and after running a script.
 * The scripts are expected to be named `${scriptName}:pre` and
 * `${scriptName}:post`.
 *
 * @type {import('@yarnpkg/core').PluginConfiguration}
 */
module.exports = {
  name: 'plugin-lifecycle-scripts',
  factory: (require) => {
    return {
      default: {
        hooks: {
          wrapScriptExecution: async (script, project, locator, scriptName) => {
            return async () => {
              const workspace = project.getWorkspaceByLocator(locator);
              return await sequence([
                getLifecycleTask(workspace, `${scriptName}:pre`, require),
                script,
                getLifecycleTask(workspace, `${scriptName}:post`, require),
              ])
            };
          }
        }
      }
    }
  }
};
