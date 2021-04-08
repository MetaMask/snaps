import { ObservableStore } from '@metamask/obs-store';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { ethErrors } from 'eth-rpc-errors';
import { nanoid } from 'nanoid';

export interface ResourceBase {
  readonly id: string;
  readonly fromDomain: string;
}

export type Resources<ResourceType extends ResourceBase> = Record<
  string,
  ResourceType
>;

export type ResourceRequestHandler<T extends Record<string, unknown>> = (
  fromDomain: string,
  method: string,
  arg?: string | Partial<T>,
) => string | T | null;

const alwaysRequiredFields = ['fromDomain'];
type RequiredFieldsType = readonly string[] & typeof alwaysRequiredFields;

const computeState = <
  StorageKey extends string,
  ResourceType extends Record<string, unknown>
>(
  storageKey: StorageKey,
  initialResources: Resources<ResourceType & ResourceBase>,
) => {
  return { [storageKey]: initialResources };
};

interface ExternalResourceControllerArgs<
  StorageKey extends string,
  RequiredFields extends readonly string[],
  ResourceType extends Record<RequiredFieldsType[number], unknown>
> {
  storageKey: StorageKey;
  requiredFields: RequiredFields;
  initialResources: Resources<ResourceType & ResourceBase>;
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
  StorageKey extends string,
  RequiredFields extends readonly string[],
  ResourceType extends Record<RequiredFields[number], unknown>
> extends SafeEventEmitter {
  private readonly requiredFields: readonly string[];

  private readonly storageKey: StorageKey;

  private readonly store: ObservableStore<ReturnType<typeof computeState>>;

  constructor({
    storageKey,
    requiredFields,
    initialResources,
  }: ExternalResourceControllerArgs<StorageKey, RequiredFields, ResourceType>) {
    super();
    this.requiredFields = requiredFields;
    this.storageKey = storageKey;

    this.store = new ObservableStore(
      computeState(storageKey, initialResources),
    );
  }

  getResources(): Resources<ResourceType & ResourceBase> {
    return {
      ...(this.store.getState()[this.storageKey] as Resources<
        ResourceType & ResourceBase
      >),
    };
  }

  private setResources(
    resources: Resources<ResourceType & ResourceBase>,
  ): void {
    this.store.updateState({
      [this.storageKey]: resources,
    });
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
      {} as Resources<ResourceType & ResourceBase>,
    );
    this.setResources(newResources);
  }

  get(fromDomain: string, id: string): (ResourceType & ResourceBase) | null {
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

  add(fromDomain: string, resource: ResourceType & { id?: string }): string {
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

  update(
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

  delete(fromDomain: string, id: string): null {
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
        return this.get(fromDomain, arg);
      case 'getAll':
        return this.getAllResources(fromDomain);
      case 'add':
        return this.add(fromDomain, arg);
      case 'update':
        return this.update(fromDomain, arg);
      case 'delete':
        return this.delete(fromDomain, arg);
      default:
        throw ethErrors.rpc.methodNotFound({
          message: `Not an asset method: ${method}`,
        });
    }
  }
}
