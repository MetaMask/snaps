import { getGetSnapImplementation } from './get-snap';

describe('getGetSnapImplementation', () => {
  it('returns a method that returns a Snap', () => {
    const getSnap = getGetSnapImplementation(false);
    const snap = getSnap();

    expect(snap.preinstalled).toBe(false);
    expect(snap).toMatchInlineSnapshot(`
      {
        "blocked": false,
        "enabled": true,
        "id": "npm:@metamask/snaps-simulation",
        "initialPermissions": {},
        "manifest": {
          "description": "A test Snap for simulation purposes.",
          "initialPermissions": {},
          "manifestVersion": "0.1",
          "proposedName": "Test Snap",
          "repository": {
            "type": "git",
            "url": "https://github.com/MetaMask/snaps.git",
          },
          "source": {
            "location": {
              "npm": {
                "filePath": "dist/index.js",
                "packageName": "@metamask/snaps-simulation",
                "registry": "https://registry.npmjs.org",
              },
            },
            "shasum": "unused",
          },
          "version": "0.1.0",
        },
        "preinstalled": false,
        "status": "running",
        "version": "0.1.0",
        "versionHistory": [],
      }
    `);
  });

  it('returns a method that returns a preinstalled Snap', () => {
    const getSnap = getGetSnapImplementation(true);
    const snap = getSnap();

    expect(snap.preinstalled).toBe(true);
  });

  it('returns a method that returns a preinstalled Snap by default', () => {
    const getSnap = getGetSnapImplementation();
    const snap = getSnap();

    expect(snap.preinstalled).toBe(true);
  });
});
