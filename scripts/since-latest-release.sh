#!/bin/bash

red() {
  printf "\x1B[31m"
  echo -n "$@"
  printf "\x1B[0m"
}

magenta() {
  printf "\x1B[35m"
  echo -n "$@"
  printf "\x1B[0m"
}

bold() {
  printf "\x1B[1m"
  echo -n "$@"
  printf "\x1B[22m"
}

print-usage() {
  cat <<EOT
USAGE: $0 [--include-head] [-- GIT_COMMAND GIT_COMMAND_ARGS...]"

View changes for a package since its latest release.

Examples:

  yarn workspace @metamask/accounts-controller run since-latest-release
  yarn workspace @metamask/accounts-controller run since-latest-release diff
  yarn workspace @metamask/accounts-controller run since-latest-release log -p
  yarn workspace @metamask/accounts-controller run since-latest-release --include-head -- log -p

EOT
}

latest-release-commit() {
  local package_name="$1"
  git tag --sort=version:refname --list "$package_name@*" | tail -n 1
}

determine-commit-range() {
  local branch_name
  local include_head
  local git_command_name

  branch_name="$1"
  include_head="$2"
  git_command_name="$3"

  if [[ "$branch_name" =~ ^release/ && $include_head -eq 0 ]]; then
    echo "$latest_release_commit..main"
  elif [[ "$git_command_name" == "diff" ]]; then
    echo "$latest_release_commit"
  else
    echo "$latest_release_commit..HEAD"
  fi
}

main() {
  local force_head_as_final_branch_name
  local any_options_given
  local start_processing_git_command
  local package_name
  local package_directory
  local given_git_command=()
  local git_command=()
  local current_branch
  local latest_release_commit
  local commit_range

  any_options_given=0
  force_head_as_final_branch_name=0
  start_processing_git_command=0
  if [[ -f package.json ]]; then
    package_name="$(jq --raw-output '.name' < package.json)"
  fi
  package_directory="$PWD"
  magenta "$(bold "Directory:")" "$package_directory" $'\n'

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --include-head)
        any_options_given=1
        force_head_as_final_branch_name=1
        shift
        ;;
      --help | -h)
        print-usage
        exit 0
        ;;
      --)
        start_processing_git_command=1
        shift
        ;;
      -*)
        if [[ $start_processing_git_command -eq 0 ]]; then
          red "ERROR: Unknown option '$1'." $'\n'
          echo
          print-usage
          exit 1
        else
          given_git_command+=("$1")
        fi
        ;;
      *)
        if [[ $any_options_given -eq 1 ]]; then
          red "ERROR: Unknown argument '$1'. (Tip: When specifying options to this script and \`git\` at the same time, use \`--\` to divide git options.)" $'\n'
          echo
          print-usage
          exit 1
        else
          given_git_command+=("$1")
        fi
        shift
        ;;
    esac
  done

  if [[ -z "$package_name" ]]; then
    red "ERROR: Could not determine package name. Are you in a package?" $'\n'
    exit 1
  fi
  magenta "$(bold "Package:")" "$package_name" $'\n'

  if [[ ${#given_git_command[@]} -eq 0 ]]; then
    git_command=(log --oneline)
  else
    git_command=("${given_git_command[@]}")
  fi

  current_branch="$(git branch --show-current)"
  latest_release_commit="$(latest-release-commit "$package_name")"
  if [[ -z "$latest_release_commit" ]]; then
    red "ERROR: Could not determine latest release commit." $'\n'
    exit 1
  fi
  commit_range="$(determine-commit-range "$current_branch" "$force_head_as_final_branch_name" "${git_command[0]}")"
  magenta "$(bold "Commit range:")" "$commit_range" $'\n'

  echo
  git "${git_command[@]}" "$commit_range" -- "$package_directory"
}

main "$@"
