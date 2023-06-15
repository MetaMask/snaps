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

%===============================================================================
% Constraints
%===============================================================================

% Ensure all subpackage versions are the same as the root package version.
gen_enforced_field(WorkspaceCwd, 'version', Version) :-
  workspace_field('.', 'version', Version).

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
