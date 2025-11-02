#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: ./sync_env_to_vercel.sh <env-file> [environment]

Synchronises the variables from <env-file> with Vercel using the Vercel CLI.
- <env-file>: Path to a dotenv style file (KEY=value per line).
- [environment]: Target environment. Use "all" (default) to upload to production, preview and development.
                 Accepts a comma separated list (e.g. "production,preview").

Requires the `vercel` CLI to be installed and authenticated. If VERCEL_TOKEN is
set it will be forwarded automatically.
USAGE
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 1 ]]; then
  echo "❌ Missing env file argument" >&2
  usage >&2
  exit 1
fi

ENV_FILE=$1
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Env file '$ENV_FILE' not found" >&2
  exit 1
fi

TARGETS_RAW=${2:-all}
if [[ -z "$TARGETS_RAW" ]]; then
  TARGETS_RAW=all
fi

case "$TARGETS_RAW" in
  all|ALL)
    ENVIRONMENTS=(production preview development)
    ;;
  prod|production)
    ENVIRONMENTS=(production)
    ;;
  preview)
    ENVIRONMENTS=(preview)
    ;;
  dev|development)
    ENVIRONMENTS=(development)
    ;;
  *)
    IFS=',' read -r -a ENVIRONMENTS <<< "$TARGETS_RAW"
    ;;
esac

if ! command -v vercel >/dev/null 2>&1; then
  echo "❌ vercel CLI not found. Install it with 'npm i -g vercel'" >&2
  exit 1
fi

TOKEN_FLAG=()
if [[ -n ${VERCEL_TOKEN:-} ]]; then
  TOKEN_FLAG=(--token "${VERCEL_TOKEN}")
fi

mapfile -t ENV_LINES < <(grep -vE '^(#|\s*$)' "$ENV_FILE")
if [[ ${#ENV_LINES[@]} -eq 0 ]]; then
  echo "⚠️  No variables detected in '$ENV_FILE'" >&2
  exit 0
fi

sanitize_value() {
  local value="$1"
  # Trim leading and trailing whitespace
  value="${value#${value%%[![:space:]]*}}"
  value="${value%${value##*[![:space:]]}}"
  # Remove surrounding quotes
  if [[ ("$value" == "\""*"\"") || ("$value" == "'"*"'") ]]; then
    value="${value:1:${#value}-2}"
  fi
  echo -n "$value"
}

sync_var() {
  local key="$1"
  local value="$2"

  if [[ -z "$key" ]]; then
    return
  fi

  for env in "${ENVIRONMENTS[@]}"; do
    env="${env//[[:space:]]/}"
    if [[ -z "$env" ]]; then
      continue
    fi

    printf '   → %s (%s)\n' "$key" "$env"
    # Remove the variable first to avoid interactive prompt when updating.
    if vercel env rm "$key" "$env" --yes "${TOKEN_FLAG[@]}" >/dev/null 2>&1; then
      printf '      (existing value removed)\n'
    fi

    if [[ -z "$value" ]]; then
      printf '      ⚠️  Skipped empty value\n'
      continue
    fi

    if ! printf '%s\n' "$value" | vercel env add "$key" "$env" "${TOKEN_FLAG[@]}" >/dev/null; then
      printf '      ❌ Failed to set %s for %s\n' "$key" "$env"
      return 1
    fi
  done

  return 0
}

printf '\n🌐 Syncing %d variables from %s\n' "${#ENV_LINES[@]}" "$ENV_FILE"

SUCCESS_COUNT=0
ERROR_COUNT=0

for line in "${ENV_LINES[@]}"; do
  key="${line%%=*}"
  value="${line#*=}"
  key="${key#${key%%[![:space:]]*}}"
  key="${key%${key##*[![:space:]]}}"
  key="${key//$'\r'/}"

  # Allow dotenv files that use the "export KEY=VALUE" syntax.
  if [[ $key =~ ^[Ee][Xx][Pp][Oo][Rr][Tt][[:space:]]+(.+) ]]; then
    key="${BASH_REMATCH[1]}"
    key="${key#${key%%[![:space:]]*}}"
    key="${key%${key##*[![:space:]]}}"
  fi
  value="${value//$'\r'/}"
  value="$(sanitize_value "$value")"

  if [[ -z "$key" ]]; then
    continue
  fi

  # Avoid leaking full secret values in logs.
  preview="${value:0:4}"
  if [[ ${#value} -gt 4 ]]; then
    preview+="***"
  fi

  printf '\n• %s = %s\n' "$key" "$preview"
  if sync_var "$key" "$value"; then
    ((SUCCESS_COUNT++))
  else
    ((ERROR_COUNT++))
    echo "   ⚠️  Error syncing $key" >&2
  fi

done

if [[ $ERROR_COUNT -eq 0 ]]; then
  printf '\n✅ Sync complete (%d variables processed)\n' "$SUCCESS_COUNT"
else
  printf '\n⚠️  Sync finished with %d success and %d errors\n' "$SUCCESS_COUNT" "$ERROR_COUNT" >&2
fi
