/**
 *
 * MUST be a valid SemVer version string and equal to the corresponding `package.json` field.
 *
 */
type StringGyS0TG81 = string;
/**
 *
 * MUST be a non-empty string less than or equal to 280 characters. A short description of the Snap.
 *
 */
type StringWm7QQAOA = string;
/**
 *
 * MUST be a string less than or equal to 214 characters. The Snap author's proposed name for the Snap. The Snap host application may display this name unmodified in its user interface. The proposed name SHOULD be human-readable.
 *
 */
type StringDQmAWJyy = string;
type StringG66CDL2Y = "git";
type StringDj4X5WuP = string;
/**
 *
 * MAY be omitted. If present, MUST be equal to the corresponding package.json field.
 *
 */
type ObjectOfStringDj4X5WuPStringG66CDL2Y3ZIYi6Gi = {
  type: StringG66CDL2Y;
  url: StringDj4X5WuP;
}
/**
 *
 * MUST be the Base64-encoded string representation of the SHA-256 hash of the Snap source file.
 *
 */
type StringFpP4DSlq = string;
type StringLPjMBZv6 = "https://registry.npmjs.org";
type ObjectOfStringLPjMBZv6StringDj4X5WuPStringDj4X5WuPE7J2CtTk = {
  filePath: StringDj4X5WuP;
  packageName: StringDj4X5WuP;
  registry: StringLPjMBZv6;
}
type ObjectOfObjectOfStringLPjMBZv6StringDj4X5WuPStringDj4X5WuPE7J2CtTkQCP1AzzD = {
  npm: ObjectOfStringLPjMBZv6StringDj4X5WuPStringDj4X5WuPE7J2CtTk;
}
/**
 *
 * Specifies some Snap metadata and where to fetch the Snap during installation.
 *
 */
type ObjectOfStringFpP4DSlqObjectOfObjectOfStringLPjMBZv6StringDj4X5WuPStringDj4X5WuPE7J2CtTkQCP1AzzDSuLkg5LK = {
  shasum: StringFpP4DSlq;
  location: ObjectOfObjectOfStringLPjMBZv6StringDj4X5WuPStringDj4X5WuPE7J2CtTkQCP1AzzD;
}
/**
 *
 * MUST be a valid EIP-2255 wallet_requestPermissions parameter object, specifying the initial permissions that will be requested when the Snap is added to the host application.
 *
 */
type ObjectQRnToOuM = { [key: string]: any; }
/**
 *
 * The Snap manifest specification version targeted by the manifest.
 *
 */
type StringTCP6FiaI = "0.1";
/**
 *
 * The Snap manifest file MUST be named `snap.manifest.json` and located in the package root directory.
 *
 */
export type SnapManifest = {
  version: StringGyS0TG81;
  description: StringWm7QQAOA | null
  proposedName: StringDQmAWJyy;
  repository: ObjectOfStringDj4X5WuPStringG66CDL2Y3ZIYi6Gi | null
  source: ObjectOfStringFpP4DSlqObjectOfObjectOfStringLPjMBZv6StringDj4X5WuPStringDj4X5WuPE7J2CtTkQCP1AzzDSuLkg5LK;
  initialPermissions: ObjectQRnToOuM;
  manifestVersion: StringTCP6FiaI;
}
