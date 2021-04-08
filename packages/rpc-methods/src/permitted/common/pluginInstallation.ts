import { ethErrors } from 'eth-rpc-errors';
import { PLUGIN_PREFIX, InstallPluginsResult } from '@mm-snap/controllers';
import { IRequestedPermissions } from 'rpc-cap/dist/src/@types';
import { isPlainObject } from '../../utils';

export { InstallPluginsResult } from '@mm-snap/controllers';

export type InstallPluginsHook = (
  requestedPlugins: IRequestedPermissions,
) => Promise<InstallPluginsResult>;

// preprocess requested permissions to support 'wallet_plugin' syntactic sugar
export function preprocessRequestPermissions(
  requestedPermissions: IRequestedPermissions,
): IRequestedPermissions {
  if (!isPlainObject(requestedPermissions)) {
    throw ethErrors.rpc.invalidRequest({ data: { requestedPermissions } });
  }

  // passthrough if 'wallet_plugin' is not requested
  if (!requestedPermissions.wallet_plugin) {
    return requestedPermissions;
  }

  // rewrite permissions request parameter by destructuring plugins into
  // proper permissions prefixed with 'wallet_plugin_'
  return Object.keys(requestedPermissions).reduce(
    (newRequestedPermissions, permName) => {
      if (permName === 'wallet_plugin') {
        if (!isPlainObject(requestedPermissions[permName])) {
          throw ethErrors.rpc.invalidParams({
            message: `Invalid params to 'wallet_requestPermissions'`,
            data: { requestedPermissions },
          });
        }

        const requestedPlugins = requestedPermissions[
          permName
        ] as IRequestedPermissions;

        // destructure 'wallet_plugin' object
        Object.keys(requestedPlugins).forEach((pluginName) => {
          const pluginKey = PLUGIN_PREFIX + pluginName;

          // disallow requesting a plugin X under 'wallet_plugins' and
          // directly as 'wallet_plugin_X'
          if (requestedPermissions[pluginKey]) {
            throw ethErrors.rpc.invalidParams({
              message: `Plugin '${pluginName}' requested both as direct permission and under 'wallet_plugin'. We recommend using 'wallet_plugin' only.`,
              data: { requestedPermissions },
            });
          }

          newRequestedPermissions[pluginKey] = requestedPlugins[pluginName];
        });
      } else {
        // otherwise, leave things as we found them
        newRequestedPermissions[permName] = requestedPermissions[permName];
      }

      return newRequestedPermissions;
    },
    {} as IRequestedPermissions,
  );
}

/**
 * Typechecks the requested plugins and passes them to the permissions
 * controller for installation.
 */
export async function handleInstallPlugins(
  requestedPlugins: IRequestedPermissions,
  installPlugins: InstallPluginsHook,
): Promise<InstallPluginsResult> {
  if (!isPlainObject(requestedPlugins)) {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid plugin installation params.`,
      data: { requestedPlugins },
    });
  } else if (Object.keys(requestedPlugins).length === 0) {
    throw ethErrors.rpc.invalidParams({
      message: `Must specify at least one plugin to install.`,
      data: { requestedPlugins },
    });
  }

  // installPlugins is bound to the origin
  return await installPlugins(requestedPlugins);
}
