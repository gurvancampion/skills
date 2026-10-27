#!/usr/bin/env bash
# Upload local files to a GitLab project.
# Without --body: print one Markdown URL (/uploads/...) per file.
# With --body: replace each "(FILE)" in the body with "(URL)", like gh --attach; the body is
# written only when every file uploaded and was found in it.
set -euo pipefail

usage() {
  printf 'Usage: %s [--host HOST] [--repo GROUP/PROJECT] [--body BODY.md] FILE...\n' "$(basename "$0")"
}

host=''
repository=''
body=''
files=()

while (($# > 0)); do
  case "$1" in
    --host) host="${2:-}"; shift 2 ;;
    --repo) repository="${2:-}"; shift 2 ;;
    --body) body="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    --*) printf 'Unknown option: %s\n' "$1" >&2; usage >&2; exit 2 ;;
    *) files+=("$1"); shift ;;
  esac
done

if ((${#files[@]} == 0)); then
  usage >&2
  exit 2
fi
for file in "${files[@]}"; do
  if [[ ! -f "$file" ]]; then
    printf 'Not a file: %s\n' "$file" >&2
    exit 2
  fi
done
if [[ -n "$body" && ! -f "$body" ]]; then
  printf 'Not a file: %s\n' "$body" >&2
  exit 2
fi

for tool in curl git; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf '%s is required.\n' "$tool" >&2
    exit 127
  fi
done

if [[ -z "$host" || -z "$repository" ]]; then
  remote="$(git remote get-url origin 2>/dev/null || true)"
  # git@host:group/project.git, ssh://git@host[:port]/group/project.git, https://host/group/project.git
  remote_host="$(printf '%s' "$remote" | sed -E 's#^[a-z+]+://##; s#^[^@/]+@##; s#[:/].*##')"
  remote_path="$(printf '%s' "$remote" | sed -E 's#^(ssh://[^/]+/|[^@/]+@[^:]+:|https?://[^/]+/)##; s#\.git$##')"
  host="${host:-$remote_host}"
  repository="${repository:-$remote_path}"
fi

if [[ -z "$host" || -z "$repository" ]]; then
  printf 'Could not resolve the GitLab project. Run inside a checkout or pass --host and --repo.\n' >&2
  exit 2
fi

token="${GITLAB_TOKEN:-}"
if [[ -z "$token" ]] && command -v glab >/dev/null 2>&1; then
  token="$(glab config get token --host "$host" 2>/dev/null || true)"
fi
if [[ -z "$token" ]]; then
  printf 'GitLab authentication is required for %s. Set GITLAB_TOKEN, or run glab auth login.\n' "$host" >&2
  exit 1
fi

project="$(printf '%s' "$repository" | sed 's#/#%2F#g')"

if [[ -n "$body" ]]; then
  content="$(cat "$body"; printf x)"
  content="${content%x}"
  for file in "${files[@]}"; do
    if [[ "$content" != *"($file)"* ]]; then
      printf 'The body does not reference (%s).\n' "$file" >&2
      exit 2
    fi
  done
fi

for file in "${files[@]}"; do
  response="$(curl --silent --show-error --fail-with-body \
    --request POST \
    --header "PRIVATE-TOKEN: $token" \
    --form "file=@$file" \
    "https://$host/api/v4/projects/$project/uploads")" || {
    printf 'Upload failed: %s\n' "$file" >&2
    exit 1
  }

  url="$(printf '%s' "$response" | sed -n 's/.*"url"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
  if [[ "$url" != /uploads/* ]]; then
    printf 'GitLab did not return an upload URL for %s.\n' "$file" >&2
    exit 1
  fi

  if [[ -n "$body" ]]; then
    content="${content//"($file)"/"($url)"}"
  else
    printf '%s\n' "$url"
  fi
done

if [[ -n "$body" ]]; then
  printf '%s' "$content" > "$body"
  printf 'Replaced %d paths in %s.\n' "${#files[@]}" "$body"
fi
