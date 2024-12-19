import { StreamProvider } from '@metamask/providers/stream-provider';

export class SnapProvider extends StreamProvider {
  // Since only the request function is exposed to the Snap, we can initialize the provider
  // without making the metamask_getProviderState request, saving us a
  // potential network request before boot.
  initializeSync() {
    this._initializeState();
  }
}
