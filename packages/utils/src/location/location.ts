import { HttpLocation } from './http';
import { LocalLocation } from './local';
import { NpmLocation } from './npm';

export interface SnapLocation {
  // TODO(ritave): Package.json object
  manifest(): Promise<unknown>;
  fetch(path: string): Promise<Blob>;
}

export async function detectSnapLocation(
  location: string | URL,
  versionRange: string,
): Promise<SnapLocation> {
  location = new URL(location);
  switch (location.protocol) {
    case 'npm:':
      return NpmLocation.create(location, versionRange);
    case 'local:':
      return new LocalLocation(location);
    case 'http:':
    case 'https:':
      return new HttpLocation(location);
    default:
      throw new TypeError(
        `Unrecognized "${location.protocol}" snap location protocol`,
      );
  }
}
