%===============================================================================
% Utility predicates
%===============================================================================

% True if and only if VersionRange is a value that we would expect to see
% following a package in a "*dependencies" field within a `package.json`.
is_valid_version_range(VersionRange) :-
  VersionRange = 'workspace:^';
  VersionRange = 'workspace:~';
  parse_version_range(VersionRange, _, _, _, _).

% Succeeds if Number can be unified with Atom converted to a number; throws if
% not.
atom_to_number(Atom, Number) :-
  atom_chars(Atom, Chars),
  number_chars(Number, Chars).

% True if and only if Atom can be converted to a number.
is_atom_number(Atom) :-
  catch(atom_to_number(Atom, _), _, false).

% True if and only if Modifier can be unified with the leading character of the
% version range ("^" or "~" if present, or "" if not present), Major can be
% unified with the major part of the version string, Minor with the minor, and
% Patch with the patch.
parse_version_range(VersionRange, Modifier, Major, Minor, Patch) :-
  % Identify and extract the modifier (^ or ~) from the version string
  atom_chars(VersionRange, Chars),
  Chars = [PossibleModifier | CharsWithoutPossibleModifier],
  (
    (
      PossibleModifier = '^';
      PossibleModifier = '~'
    ) ->
      (
        Modifier = PossibleModifier,
        CharsWithoutModifier = CharsWithoutPossibleModifier
      ) ;
      (
        is_atom_number(PossibleModifier) ->
          (
            Modifier = '',
            CharsWithoutModifier = Chars
          ) ;
          false
      )
  ),
  atomic_list_concat(CharsWithoutModifier, '', VersionRangeWithoutModifier),
  atomic_list_concat(VersionParts, '.', VersionRangeWithoutModifier),
  % Validate version string while extracting each part
  length(VersionParts, 3),
  nth0(0, VersionParts, MajorAtom),
  nth0(1, VersionParts, MinorAtom),
  nth0(2, VersionParts, PatchAtom),
  atom_to_number(MajorAtom, Major),
  atom_to_number(MinorAtom, Minor),
  atom_to_number(PatchAtom, Patch).

% True if and only if the first SemVer version range is greater than the second
% SemVer version range. Such a range must match "^MAJOR.MINOR.PATCH",
% "~MAJOR.MINOR.PATCH", "MAJOR.MINOR.PATCH". If two ranges do not have the same
% modifier ("^" or "~"), then they cannot be compared and the first cannot be
% considered as less than the second.
%
% Borrowed from: <https://github.com/npm/node-semver/blob/a7b8722674e2eedfd89960b4155ffddd6a20ee21/classes/semver.js#L107>
npm_version_range_out_of_sync(VersionRange1, VersionRange2) :-
  parse_version_range(VersionRange1, VersionRange1Modifier, VersionRange1Major, VersionRange1Minor, VersionRange1Patch),
  parse_version_range(VersionRange2, VersionRange2Modifier, VersionRange2Major, VersionRange2Minor, VersionRange2Patch),
  VersionRange1Modifier == VersionRange2Modifier,
  (
    % 2.0.0 > 1.0.0
    % 2.0.0 > 1.1.0
    % 2.0.0 > 1.0.1
    VersionRange1Major @> VersionRange2Major ;
    (
      VersionRange1Major == VersionRange2Major ,
      (
        % 1.1.0 > 1.0.0
        % 1.1.0 > 1.0.1
        VersionRange1Minor @> VersionRange2Minor ;
        (
          VersionRange1Minor == VersionRange2Minor ,
          % 1.0.1 > 1.0.0
          VersionRange1Patch @> VersionRange2Patch
        )
      )
    )
  ).

% Slice a list from From to To.
slice(Left, From, To, Right):-
  length(LeftFrom, From),
  length([_|LeftTo], To),
  append(LeftTo, _, Left),
  append(LeftFrom, Right, LeftTo).

% True if and only if the given workspace directory is an example.
is_example(WorkspaceCwd) :-
  atomic_list_concat(Parts, '/', WorkspaceCwd),
  slice(Parts, 1, 3, RootParts),
  atomic_list_concat(RootParts, '/', RootCwd),
  RootCwd = 'examples',
  WorkspaceCwd \= 'packages/examples',
  WorkspaceCwd \= 'packages/examples/packages/invoke-snap'.

% Repeat a value a given number of times. This is useful for generating lists of
% a given length. For example, repeat('foo', 3, Result) will unify Result with
% ['foo', 'foo', 'foo'].
repeat(Value, Amount, Result) :-
  length(Result, Amount),
  maplist(=(Value), Result).

% Resolve a relative path from a workspace directory.
relative_path(WorkspaceCwd, Path, RelativePath) :-
  atomic_list_concat(Parts, '/', WorkspaceCwd),
  length(Parts, Distance),
  repeat('..', Distance, DistanceParts),
  atomic_list_concat(DistanceParts, '/', DistanceString),
  atomic_list_concat([DistanceString, Path], '/', RelativePath).

%===============================================================================
% Constraints
%===============================================================================

% All dependency ranges must be recognizable (this makes it possible to apply
% the next two rules effectively).
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, 'a range optionally starting with ^ or ~', DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, DependencyType),
  \+ is_valid_version_range(DependencyRange).

% All dependency ranges for a package must be synchronized across the monorepo
% (the least version range wins), regardless of which "*dependencies" field
% where the package appears.
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, OtherDependencyRange, DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, DependencyType),
  workspace_has_dependency(OtherWorkspaceCwd, DependencyIdent, OtherDependencyRange, OtherDependencyType),
  WorkspaceCwd \= OtherWorkspaceCwd,
  DependencyRange \= OtherDependencyRange,
  npm_version_range_out_of_sync(DependencyRange, OtherDependencyRange).

% If a dependency is listed under "dependencies", it should not be listed under
% "devDependencies". We match on the same dependency range so that if a
% dependency is listed under both lists, their versions are synchronized and
% then this constraint will apply and remove the "right" duplicate.
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, null, DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, 'dependencies'),
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, DependencyType),
  DependencyType == 'devDependencies'.

% Dependencies may not have side effects.
gen_enforced_field(WorkspaceCwd, 'sideEffects', 'false') :-
  \+ workspace_field(WorkspaceCwd, 'private', true),
  WorkspaceCwd \= '.'.

% The type definitions entrypoint for the dependency must be `./dist/types/index.d.ts`.
gen_enforced_field(WorkspaceCwd, 'types', './dist/types/index.d.ts') :-
  \+ is_example(WorkspaceCwd),
  \+ workspace_field(WorkspaceCwd, 'private', true),
  WorkspaceCwd \= '.'.

% The entrypoint for the dependency must be `./dist/cjs/index.js`.
gen_enforced_field(WorkspaceCwd, 'main', './dist/cjs/index.js') :-
  \+ is_example(WorkspaceCwd),
  \+ workspace_field(WorkspaceCwd, 'private', true),
  WorkspaceCwd \= '.'.

% The module entrypoint for the dependency must be `./dist/esm/index.js`.
gen_enforced_field(WorkspaceCwd, 'module', './dist/esm/index.js') :-
  \+ is_example(WorkspaceCwd),
  \+ workspace_field(WorkspaceCwd, 'private', true),
  WorkspaceCwd \= '.'.

% Dependencies must have preview scripts.
gen_enforced_field(WorkspaceCwd, 'scripts.prepare-manifest:preview', PrepareManifestScript) :-
  \+ workspace_field(WorkspaceCwd, 'private', true),
  relative_path(WorkspaceCwd, 'scripts/prepare-preview-manifest.sh', PrepareManifestScript),
  WorkspaceCwd \= '.'.
gen_enforced_field(WorkspaceCwd, 'scripts.publish:preview', 'yarn npm publish --tag preview') :-
  \+ workspace_field(WorkspaceCwd, 'private', true),
  WorkspaceCwd \= '.'.

gen_enforced_field(WorkspaceCwd, 'publishConfig.access', 'public') :-
  \+ workspace_field(WorkspaceCwd, 'private', true),
  WorkspaceCwd \= '.'.
gen_enforced_field(WorkspaceCwd, 'publishConfig.registry', 'https://registry.npmjs.org/') :-
  \+ workspace_field(WorkspaceCwd, 'private', true),
  WorkspaceCwd \= '.'.

% The "changelog:validate" script for each published package must run a common
% script with the name of the package as an argument.
gen_enforced_field(WorkspaceCwd, 'scripts.lint:changelog', ChangelogValidationScript) :-
  \+ workspace_field(WorkspaceCwd, 'private', true),
  workspace_field(WorkspaceCwd, 'name', WorkspacePackageName),
  relative_path(WorkspaceCwd, 'scripts/validate-changelog.sh', BaseChangelogValidationScript),
  atomic_list_concat([BaseChangelogValidationScript, ' ', WorkspacePackageName], ChangelogValidationScript).

% Ensure all examples have the same scripts.
gen_enforced_field(WorkspaceCwd, 'scripts.build', 'mm-snap build') :-
  is_example(WorkspaceCwd),
  WorkspaceCwd \= 'packages/examples/packages/wasm',
  WorkspaceCwd \= 'packages/examples/packages/browserify-plugin',
  WorkspaceCwd \= 'packages/examples/packages/rollup-plugin',
  WorkspaceCwd \= 'packages/examples/packages/webpack-plugin'.
gen_enforced_field(WorkspaceCwd, 'scripts.build:clean', 'yarn clean && yarn build') :-
  is_example(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'scripts.start', 'mm-snap watch') :-
  is_example(WorkspaceCwd),
  WorkspaceCwd \= 'packages/examples/packages/wasm',
  WorkspaceCwd \= 'packages/examples/packages/browserify-plugin',
  WorkspaceCwd \= 'packages/examples/packages/rollup-plugin',
  WorkspaceCwd \= 'packages/examples/packages/webpack-plugin'.
gen_enforced_field(WorkspaceCwd, 'scripts.clean', 'rimraf "dist"') :-
  is_example(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'scripts.test', 'yarn test:e2e') :-
  is_example(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'scripts.test:e2e', 'jest') :-
  is_example(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'scripts.lint', 'yarn lint:eslint && yarn lint:misc --check && yarn lint:changelog') :-
  is_example(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'scripts.lint:ci', 'yarn lint') :-
  is_example(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'scripts.lint:fix', 'yarn lint:eslint --fix && yarn lint:misc --write') :-
  is_example(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'scripts.lint:eslint', 'eslint . --cache --ext js,ts,jsx,tsx') :-
  is_example(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'scripts.lint:misc', LintMiscScript) :-
  is_example(WorkspaceCwd),
  relative_path(WorkspaceCwd, '.gitignore', GitIgnorePath),
  atomic_list_concat(['prettier --no-error-on-unmatched-pattern --loglevel warn "**/*.json" "**/*.md" "**/*.html" "!CHANGELOG.md" "!snap.manifest.json" --ignore-path ', GitIgnorePath], LintMiscScript).

% Ensure all examples have the same `main` and `types` fields.
gen_enforced_field(WorkspaceCwd, 'main', './dist/bundle.js') :-
  is_example(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'types', null) :-
  is_example(WorkspaceCwd).

% Ensure all examples have the same license.
gen_enforced_field(WorkspaceCwd, 'license', '(MIT-0 OR Apache-2.0)') :-
  is_example(WorkspaceCwd).
