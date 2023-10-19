# The name is overwritten, causing the package to get published under a
# different NPM scope than non-preview builds.
.name |= sub("@metamask/"; "\($npm_scope)/") |

# The prerelease version is overwritten, preserving the non-prerelease portion
# of the version. Technically we'd want to bump the non-prerelease portion as
# well if we wanted this to be SemVer-compliant, but it was simpler not to.
# This is just for testing, it doesn't need to strictly follow SemVer.
.version |= split("-")[0] + "-preview.\($hash)" |

# The workspace dependencies are updated to point to the exact preview build
# version, so that Yarn does not try to resolve a different version from the
# registry.

if has("devDependencies") then
  .devDependencies |= with_entries(
    if .value | startswith("workspace:") then
      .key |= sub("@metamask/"; "@metamask-previews/") |
      .value |= sub("workspace:\\^"; "workspace:*")
    else
      .
    end
  )
else
  .
end |

if has("peerDependencies") then
  .peerDependencies |= with_entries(
    if .value | startswith("workspace:") then
      .key |= sub("@metamask/"; "@metamask-previews/") |
      .value |= sub("workspace:\\^"; "workspace:*")
    else
      .
    end
  )
else
  .
end |

if has("dependencies") then
  .dependencies |= with_entries(
    if .value | startswith("workspace:") then
      .key |= sub("@metamask/"; "@metamask-previews/") |
      .value |= sub("workspace:\\^"; "workspace:*")
    else
      .
    end
  )
else
  .
end
