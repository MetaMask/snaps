import type {
  AcceptRequest,
  HasApprovalRequest,
} from '@metamask/approval-controller';
import type {
  ControllerGetStateAction,
  ControllerStateChangeEvent,
} from '@metamask/base-controller/next';
import { BaseController } from '@metamask/base-controller/next';
import type { Messenger } from '@metamask/messenger';
import type { TestOrigin } from '@metamask/phishing-controller';
import type {
  InterfaceState,
  SnapId,
  ComponentOrElement,
  InterfaceContext,
  FungibleAssetMetadata,
} from '@metamask/snaps-sdk';
import { ContentType } from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { InternalAccount } from '@metamask/snaps-utils';
import {
  getJsonSizeUnsafe,
  snapOwnsAccount,
  validateJsxElements,
} from '@metamask/snaps-utils';
import type {
  CaipAccountId,
  CaipAssetType,
  CaipChainId,
  Json,
} from '@metamask/utils';
import { assert, hasProperty, parseCaipAccountId } from '@metamask/utils';
import { castDraft } from 'immer';
import { nanoid } from 'nanoid';

import {
  constructState,
  getJsxInterface,
  isMatchingChainId,
  validateInterfaceContext,
} from './utils';
import type { GetSnap } from '../snaps';

const MAX_UI_CONTENT_SIZE = 10_000_000; // 10 mb

const controllerName = 'SnapInterfaceController';

export type CreateInterface = {
  type: `${typeof controllerName}:createInterface`;
  handler: SnapInterfaceController['createInterface'];
};

export type GetInterface = {
  type: `${typeof controllerName}:getInterface`;
  handler: SnapInterfaceController['getInterface'];
};

export type UpdateInterface = {
  type: `${typeof controllerName}:updateInterface`;
  handler: SnapInterfaceController['updateInterface'];
};

export type DeleteInterface = {
  type: `${typeof controllerName}:deleteInterface`;
  handler: SnapInterfaceController['deleteInterface'];
};

export type UpdateInterfaceState = {
  type: `${typeof controllerName}:updateInterfaceState`;
  handler: SnapInterfaceController['updateInterfaceState'];
};

export type ResolveInterface = {
  type: `${typeof controllerName}:resolveInterface`;
  handler: SnapInterfaceController['resolveInterface'];
};

type AccountsControllerGetAccountByAddressAction = {
  type: `AccountsController:getAccountByAddress`;
  handler: (address: string) => InternalAccount | undefined;
};

type AccountsControllerGetSelectedMultichainAccountAction = {
  type: `AccountsController:getSelectedMultichainAccount`;
  handler: () => InternalAccount;
};

type AccountsControllerListMultichainAccountsAction = {
  type: `AccountsController:listMultichainAccounts`;
  handler: (chainId?: CaipChainId) => InternalAccount[];
};

export type SnapInterfaceControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  SnapInterfaceControllerState
>;

type MultichainAssetsControllerGetStateAction = ControllerGetStateAction<
  'MultichainAssetsController',
  {
    assetsMetadata: {
      [asset: CaipAssetType]: FungibleAssetMetadata;
    };
    accountsAssets: { [account: string]: CaipAssetType[] };
  }
>;

export type SnapInterfaceControllerAllowedActions =
  | TestOrigin
  | HasApprovalRequest
  | AcceptRequest
  | GetSnap
  | MultichainAssetsControllerGetStateAction
  | AccountsControllerGetSelectedMultichainAccountAction
  | AccountsControllerGetAccountByAddressAction
  | AccountsControllerListMultichainAccountsAction;

export type SnapInterfaceControllerActions =
  | CreateInterface
  | GetInterface
  | UpdateInterface
  | DeleteInterface
  | UpdateInterfaceState
  | ResolveInterface
  | SnapInterfaceControllerGetStateAction;

export type SnapInterfaceControllerStateChangeEvent =
  ControllerStateChangeEvent<
    typeof controllerName,
    SnapInterfaceControllerState
  >;

type OtherNotification = { type: string; [key: string]: unknown };

export type ExpandedView = {
  title: string;
  interfaceId: string;
  footerLink?: { href: string; text: string };
};

type NormalSnapNotificationData = { message: string; origin: string };

type ExpandedSnapNotificationData = {
  message: string;
  origin: string;
  detailedView: ExpandedView;
};

type SnapNotification = {
  type: 'snap';
  data: NormalSnapNotificationData | ExpandedSnapNotificationData;
  readDate: string | null;
};

type Notification = OtherNotification | SnapNotification;

type NotificationListUpdatedEvent = {
  type: 'NotificationServicesController:notificationsListUpdated';
  payload: [Notification[]];
};

export type SnapInterfaceControllerEvents =
  | SnapInterfaceControllerStateChangeEvent
  | NotificationListUpdatedEvent;

export type SnapInterfaceControllerMessenger = Messenger<
  typeof controllerName,
  SnapInterfaceControllerActions | SnapInterfaceControllerAllowedActions,
  SnapInterfaceControllerEvents
>;

export type StoredInterface = {
  snapId: SnapId;
  content: JSXElement;
  state: InterfaceState;
  context: InterfaceContext | null;
  contentType: ContentType | null;
};

export type SnapInterfaceControllerState = {
  interfaces: Record<string, StoredInterface>;
};

export type SnapInterfaceControllerArgs = {
  messenger: SnapInterfaceControllerMessenger;
  state?: SnapInterfaceControllerState;
};

/**
 * Use this controller to manage snaps UI interfaces using RPC method hooks.
 */
export class SnapInterfaceController extends BaseController<
  typeof controllerName,
  SnapInterfaceControllerState,
  SnapInterfaceControllerMessenger
> {
  constructor({ messenger, state }: SnapInterfaceControllerArgs) {
    super({
      messenger,
      metadata: {
        interfaces: {
          persist: (interfaces: Record<string, StoredInterface>) => {
            return Object.entries(interfaces).reduce<
              Record<string, StoredInterface>
            >((persistedInterfaces, [id, snapInterface]) => {
              switch (snapInterface.contentType) {
                case ContentType.Notification:
                  persistedInterfaces[id] = snapInterface;
                  return persistedInterfaces;
                default:
                  return persistedInterfaces;
              }
            }, {});
          },
          anonymous: false,
        },
      },
      name: controllerName,
      state: { interfaces: {}, ...state },
    });

    this.messenger.subscribe(
      'NotificationServicesController:notificationsListUpdated',
      this.#onNotificationsListUpdated.bind(this),
    );

    this.#registerMessageHandlers();
  }

  /**
   * Constructor helper for registering this controller's messaging system
   * actions.
   */
  #registerMessageHandlers() {
    this.messenger.registerActionHandler(
      `${controllerName}:createInterface`,
      this.createInterface.bind(this),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:getInterface`,
      this.getInterface.bind(this),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:updateInterface`,
      this.updateInterface.bind(this),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:deleteInterface`,
      this.deleteInterface.bind(this),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:updateInterfaceState`,
      this.updateInterfaceState.bind(this),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:resolveInterface`,
      this.resolveInterface.bind(this),
    );
  }

  /**
   * Create an interface in the controller state with the associated data.
   *
   * @param snapId - The snap id that created the interface.
   * @param content - The interface content.
   * @param context - An optional interface context object.
   * @param contentType - The type of content.
   * @returns The newly interface id.
   */
  async createInterface(
    snapId: SnapId,
    content: ComponentOrElement,
    context?: InterfaceContext,
    contentType?: ContentType,
  ) {
    const element = getJsxInterface(content);
    await this.#validateContent(element);
    validateInterfaceContext(context);

    const id = nanoid();
    const componentState = constructState({}, element, {
      getAssetsState: this.#getAssetsState.bind(this),
      getAccountByAddress: this.#getAccountByAddress.bind(this),
      getSelectedAccount: this.#getSelectedAccount.bind(this),
      listAccounts: this.#listAccounts.bind(this),
      snapOwnsAccount: (account: InternalAccount) =>
        snapOwnsAccount(snapId, account),
    });

    this.update((draftState) => {
      // @ts-expect-error - TS2589: Type instantiation is excessively deep and
      // possibly infinite.
      draftState.interfaces[id] = {
        snapId,
        content: castDraft(element),
        state: componentState,
        context: context ?? null,
        contentType: contentType ?? null,
      };
    });

    return id;
  }

  /**
   * Get the data of a given interface id.
   *
   * @param snapId - The snap id requesting the interface data.
   * @param id - The interface id.
   * @returns The interface state.
   */
  getInterface(snapId: SnapId, id: string) {
    this.#validateArgs(snapId, id);

    return this.state.interfaces[id];
  }

  /**
   * Update the interface with the given content.
   *
   * @param snapId - The snap id requesting the update.
   * @param id - The interface id.
   * @param content - The new content.
   * @param context - An optional interface context object.
   */
  async updateInterface(
    snapId: SnapId,
    id: string,
    content: ComponentOrElement,
    context?: InterfaceContext,
  ) {
    this.#validateArgs(snapId, id);
    const element = getJsxInterface(content);
    await this.#validateContent(element);
    validateInterfaceContext(context);

    const oldState = this.state.interfaces[id].state;
    const newState = constructState(oldState, element, {
      getAssetsState: this.#getAssetsState.bind(this),
      getAccountByAddress: this.#getAccountByAddress.bind(this),
      getSelectedAccount: this.#getSelectedAccount.bind(this),
      listAccounts: this.#listAccounts.bind(this),
      snapOwnsAccount: (account: InternalAccount) =>
        snapOwnsAccount(snapId, account),
    });

    this.update((draftState) => {
      draftState.interfaces[id].state = newState;
      draftState.interfaces[id].content = castDraft(element);
      if (context) {
        draftState.interfaces[id].context = context;
      }
    });
  }

  /**
   * Delete an interface from state.
   *
   * @param id - The interface id.
   */
  deleteInterface(id: string) {
    this.update((draftState) => {
      delete draftState.interfaces[id];
    });
  }

  /**
   * Update the interface state.
   *
   * @param id - The interface id.
   * @param state - The new state.
   */
  updateInterfaceState(id: string, state: InterfaceState) {
    this.update((draftState) => {
      draftState.interfaces[id].state = state;
    });
  }

  /**
   * Resolve the promise of a given interface approval request.
   * The approval needs to have the same ID as the interface.
   *
   * @param snapId - The snap id.
   * @param id - The interface id.
   * @param value - The value to resolve the promise with.
   */
  async resolveInterface(snapId: SnapId, id: string, value: Json) {
    this.#validateArgs(snapId, id);
    this.#validateApproval(id);

    await this.#acceptApprovalRequest(id, value);

    this.deleteInterface(id);
  }

  /**
   * Utility function to validate the args passed to the other methods.
   *
   * @param snapId - The snap id.
   * @param id - The interface id.
   */
  #validateArgs(snapId: SnapId, id: string) {
    const existingInterface = this.state.interfaces[id];

    assert(
      existingInterface !== undefined,
      `Interface with id '${id}' not found.`,
    );
    assert(
      existingInterface.snapId === snapId,
      `Interface not created by ${snapId}.`,
    );
  }

  /**
   * Utility function to validate that the approval request exists.
   *
   * @param id - The interface id.
   */
  #validateApproval(id: string) {
    assert(
      this.#hasApprovalRequest(id),
      `Approval request with id '${id}' not found.`,
    );
  }

  /**
   * Check an origin against the phishing list.
   *
   * @param origin - The origin to check.
   * @returns True if the origin is on the phishing list, otherwise false.
   */
  #checkPhishingList(origin: string) {
    return this.messenger.call('PhishingController:testOrigin', origin).result;
  }

  /**
   * Check if an approval request exists for a given interface by looking up
   * if the ApprovalController has a request with the given interface ID.
   *
   * @param id - The interface id.
   * @returns True if an approval request exists, otherwise false.
   */
  #hasApprovalRequest(id: string) {
    return this.messenger.call('ApprovalController:hasRequest', {
      id,
    });
  }

  /**
   * Accept an approval request for a given interface.
   *
   * @param id - The interface id.
   * @param value - The value to resolve the promise with.
   */
  async #acceptApprovalRequest(id: string, value: Json) {
    await this.messenger.call('ApprovalController:acceptRequest', id, value);
  }

  /**
   * Get the selected account in the client.
   *
   * @returns The selected account.
   */
  #getSelectedAccount() {
    return this.messenger.call(
      'AccountsController:getSelectedMultichainAccount',
    );
  }

  /**
   * Get a list of accounts for the given chain IDs.
   *
   * @param chainIds - The chain IDs to get the accounts for.
   * @returns The list of accounts.
   */
  #listAccounts(chainIds?: CaipChainId[]) {
    const accounts = this.messenger.call(
      'AccountsController:listMultichainAccounts',
    );

    if (!chainIds || chainIds.length === 0) {
      return accounts;
    }

    return accounts.filter((account) =>
      account.scopes.some((scope) => isMatchingChainId(scope, chainIds)),
    );
  }

  /**
   * Get an account by its address.
   *
   * @param address - The account address.
   * @returns The account or undefined if not found.
   */
  #getAccountByAddress(address: CaipAccountId) {
    const { address: parsedAddress } = parseCaipAccountId(address);

    return this.messenger.call(
      'AccountsController:getAccountByAddress',
      parsedAddress,
    );
  }

  /**
   * Get the MultichainAssetsController state.
   *
   * @returns The MultichainAssetsController state.
   */
  #getAssetsState() {
    return this.messenger.call('MultichainAssetsController:getState');
  }

  /**
   * Get a snap by its id.
   *
   * @param id - The snap id.
   * @returns The snap.
   */
  #getSnap(id: string) {
    return this.messenger.call('SnapController:get', id);
  }

  /**
   * Utility function to validate the components of an interface.
   * Throws if something is invalid.
   *
   * @param element - The JSX element to verify.
   */
  async #validateContent(element: JSXElement) {
    // We assume the validity of this JSON to be validated by the caller.
    // E.g., in the RPC method implementation.
    const size = getJsonSizeUnsafe(element);
    assert(
      size <= MAX_UI_CONTENT_SIZE,
      `A Snap UI may not be larger than ${MAX_UI_CONTENT_SIZE / 1000000} MB.`,
    );

    validateJsxElements(element, {
      isOnPhishingList: this.#checkPhishingList.bind(this),
      getSnap: this.#getSnap.bind(this),
      getAccountByAddress: this.#getAccountByAddress.bind(this),
    });
  }

  #onNotificationsListUpdated(notificationsList: Notification[]) {
    const snapNotificationsWithInterface = notificationsList.filter(
      (notification) => {
        return (
          notification.type === 'snap' &&
          hasProperty((notification as SnapNotification).data, 'detailedView')
        );
      },
    );

    const interfaceIdSet = new Set(
      snapNotificationsWithInterface.map(
        (notification) =>
          (
            (notification as SnapNotification)
              .data as ExpandedSnapNotificationData
          ).detailedView.interfaceId,
      ),
    );

    this.update((state) => {
      Object.entries(state.interfaces).forEach(([id, snapInterface]) => {
        if (
          snapInterface.contentType === ContentType.Notification &&
          !interfaceIdSet.has(id)
        ) {
          delete state.interfaces[id];
        }
      });
    });
  }
}
