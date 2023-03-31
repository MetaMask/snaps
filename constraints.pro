% Ensure all subpackage versions are the same as the root package version.
gen_enforced_field(WorkspaceCwd, 'version', Version) :-
  workspace_field('.', 'version', Version).
