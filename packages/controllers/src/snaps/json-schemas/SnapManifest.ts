/**
 *
 * MUST be a valid SemVer version string and equal to the corresponding `package.json` field.
 *
 */
type Version = string;
/**
 *
 * MUST be a non-empty string less than or equal to 280 characters. A short description of the Snap.
 *
 */
type Description = string;
/**
 *
 * MUST be a string less than or equal to 214 characters. The Snap author's proposed name for the Snap. The Snap host application may display this name unmodified in its user interface. The proposed name SHOULD be human-readable.
 *
 */
type ProposedName = string;
type NullQu0Arl1F = null;
type StringG66CDL2Y = "git";
type StringDj4X5WuP = string;
type ObjectOfStringDj4X5WuPStringG66CDL2Y4XW4K3DM = {
  type: StringG66CDL2Y;
  url: StringDj4X5WuP;
}
/**
 *
 * MAY be omitted. If present, MUST be equal to the corresponding package.json field.
 *
 */
type Repository = NullQu0Arl1F | ObjectOfStringDj4X5WuPStringG66CDL2Y4XW4K3DM;
/**
 *
 * MUST be the Base64-encoded string representation of the SHA-256 hash of the Snap source file.
 *
 */
type StringFpP4DSlq = string;
/**
 *
 * The path to the Snap bundle file from the project root directory.
 *
 */
type FilePath = string;
/**
 *
 * The Snap's npm package name.
 *
 */
type PackageName = string;
/**
 *
 * The npm registry URL.
 *
 */
type NpmRegistry = "https://registry.npmjs.org" | "https://registry.npmjs.org/";
type Npm = {
  filePath: FilePath;
  packageName: PackageName;
  registry: NpmRegistry;
}
type SourceLocation = {
  npm: Npm;
}
/**
 *
 * Specifies some Snap metadata and where to fetch the Snap during installation.
 *
 */
type Source = {
  shasum: StringFpP4DSlq;
  location: SourceLocation;
}
/**
 *
 * MUST be a valid EIP-2255 wallet_requestPermissions parameter object, specifying the initial permissions that will be requested when the Snap is added to the host application.
 *
 */
type InitialPermissions = { [key: string]: any; }
/**
 *
 * The Snap manifest specification version targeted by the manifest.
 *
 */
type ManifestVersion = "0.1";
/**
 *
 * The Snap manifest file MUST be named `snap.manifest.json` and located in the package root directory.
 *
 */
export type SnapManifest = {
  version: Version;
  description: Description;
  proposedName: ProposedName;
  repository?: Repository;
  source: Source;
  initialPermissions: InitialPermissions;
  manifestVersion: ManifestVersion;
}
