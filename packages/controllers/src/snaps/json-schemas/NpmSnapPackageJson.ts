type Version = string;
type PackageName = string;
type Private = boolean;
type Main = string;
type StringHVOT0U1Z = "public";
type StringXp6NyS6W = "https://registry.npmjs.org" | "https://registry.npmjs.org/";
type PublishConfig = {
  access: StringHVOT0U1Z;
  registry: StringXp6NyS6W;
  [k: string]: any;
}
type StringG66CDL2Y = "git";
type StringDj4X5WuP = string;
type Repository = {
  type: StringG66CDL2Y;
  url: StringDj4X5WuP;
}
export type NpmSnapPackageJson = {
  version: Version;
  name: PackageName;
  private?: Private;
  main?: Main;
  publishConfig?: PublishConfig;
  repository?: Repository;
  [k: string]: any;
}
