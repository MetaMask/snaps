import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import { Json } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { nanoid } from 'nanoid';

export interface ResourceBase {
  readonly id: string;
  readonly fromDomain: string;
}

export type ResourceRequestHandler<T extends Record<string, Json>> = (
  fromDomain: string,
  method: string,
  arg?: string | Partial<T>,
) => string | T | null;

const fromDomainKey = 'fromDomain';
type RequiredFieldsType = readonly string[] & [typeof fromDomainKey];

const name = 'ExternalResourceController';
const storageKey = 'externalDomainResources';

export type Resources<ResourceType extends Record<string, Json>> = Record<
  string,
  ResourceType & ResourceBase
>;

type ResourceControllerState<ResourceType extends Record<string, Json>> = {
  [storageKey]: Resources<ResourceType>;
};

interface ExternalResourceControllerArgs<
  RequiredFields extends readonly string[],
  ResourceType extends Record<RequiredFieldsType[number], Json>
> {
  messenger: RestrictedControllerMessenger<
    typeof name,
    any,
    any,
    string,
    string
  >;
  requiredFields: RequiredFields;
  state?: ResourceControllerState<ResourceType>;
}

const getUnauthorizedMessage = (id: string) =>
  `Not authorized to access resource with id "${id}".`;

/**
 * A class intended to describe a particular resource that is managed by plugins.
 * Example resources are assets.
 *
 * These are things that MetaMask treats as first-class objects with distinct properties within its own UI.
 */
export class ExternalResourceController<
  RequiredFields extends readonly string[],
  ResourceType extends Record<RequiredFields[number], Json>
> extends BaseController<typeof name, ResourceControllerState<ResourceType>> {
  private readonly requiredFields: readonly string[];

  public readonly storageKey = storageKey;

  constructor({
    requiredFields,
    state = { [storageKey]: {} },
    messenger,
  }: ExternalResourceControllerArgs<RequiredFields, ResourceType>) {
    super({
      name,
      messenger,
      metadata: {
        [storageKey]: { persist: true, anonymous: true },
      },
      state: state as any,
    });
    this.requiredFields = requiredFields;
    this.storageKey = storageKey;
  }

  getResources(): Resources<ResourceType> {
    return {
      ...(this.state[this.storageKey] as Resources<ResourceType>),
    };
  }

  private setResources(resources: Resources<ResourceType>): void {
    this.update({
      [this.storageKey]: resources,
    } as any);
  }

  clearResources(): void {
    this.setResources({});
  }

  deleteResourcesFor(fromDomain: string): void {
    const resources = this.getResources();
    const newResources = Object.entries(resources).reduce(
      (acc, [id, resource]) => {
        if (resource.fromDomain !== fromDomain) {
          acc[id] = resource;
        }
        return acc;
      },
      {} as Resources<ResourceType>,
    );
    this.setResources(newResources);
  }

  getResource(
    fromDomain: string,
    id: string,
  ): (ResourceType & ResourceBase) | null {
    const resource = this.getResources()[id];
    if (resource && resource.fromDomain !== fromDomain) {
      throw ethErrors.provider.unauthorized({
        message: getUnauthorizedMessage(id),
      });
    }
    return resource ? { ...resource } : null;
  }

  getAllResources(fromDomain: string) {
    return Object.values(this.getResources()).filter((resource) => {
      return resource.fromDomain === fromDomain;
    });
  }

  addResource(
    fromDomain: string,
    resource: ResourceType & { id?: string },
  ): string {
    const newResource = this.processNewResource(fromDomain, resource);
    const { id } = newResource;
    const resources = this.getResources();

    if (resources[id]) {
      throw new Error(`Resource with id "${id}" already exists.`);
    } else {
      resources[id] = newResource;
      this.setResources(resources);
    }

    return newResource.id;
  }

  updateResource(
    fromDomain: string,
    resource: Partial<ResourceType> & { id: string },
  ): string {
    const { id } = resource;
    const resources = this.getResources();
    const existingResource = resources[id];
    if (!existingResource) {
      throw ethErrors.rpc.resourceNotFound({
        message: `Resource with id "${id}" not found.`,
      });
    } else if (existingResource.fromDomain !== fromDomain) {
      throw ethErrors.provider.unauthorized({
        message: getUnauthorizedMessage(id),
      });
    }

    resources[id] = this.processNewResource(fromDomain, {
      ...resources[id],
      ...resource,
    });
    this.setResources(resources);

    return id;
  }

  processNewResource(
    fromDomain: string,
    resource: Partial<ResourceType> & { id?: string },
  ): ResourceType & ResourceBase {
    this.requiredFields.forEach((requiredField) => {
      if (!(requiredField in resource)) {
        throw ethErrors.rpc.invalidParams(
          `Resource from "${fromDomain}" missing required field: ${requiredField}`,
        );
      }
    });

    return {
      ...resource,
      fromDomain,
      id: resource.id || nanoid(),
    } as ResourceType & ResourceBase;
  }

  deleteResource(fromDomain: string, id: string): null {
    const resources = this.getResources();
    const existingResource = resources[id];
    if (!existingResource) {
      throw ethErrors.rpc.invalidParams({
        message: `Resource with id "${id}" not found.`,
      });
    } else if (existingResource.fromDomain !== fromDomain) {
      throw ethErrors.provider.unauthorized({
        message: getUnauthorizedMessage(id),
      });
    }

    delete resources[id];
    this.setResources(resources);
    return null;
  }

  handleRpcRequest(fromDomain: string, method: string, arg: any) {
    if (!fromDomain || typeof fromDomain !== 'string') {
      throw new Error('Invalid fromDomain.');
    }

    switch (method) {
      case 'get':
        return this.getResource(fromDomain, arg);
      case 'getAll':
        return this.getAllResources(fromDomain);
      case 'add':
        return this.addResource(fromDomain, arg);
      case 'update':
        return this.updateResource(fromDomain, arg);
      case 'delete':
        return this.deleteResource(fromDomain, arg);
      default:
        throw ethErrors.rpc.methodNotFound({
          message: `Not an asset method: ${method}`,
        });
    }
  }
}
