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

PROJECT_FLAG=()
if [[ -n ${VERCEL_PROJECT_ID:-} ]]; then
  PROJECT_FLAG=(--project "${VERCEL_PROJECT_ID}")
elif [[ -n ${VERCEL_PROJECT_NAME:-} ]]; then
  PROJECT_FLAG=(--project "${VERCEL_PROJECT_NAME}")
fi

trim_whitespace() {
  local str="$1"
  str="${str#${str%%[![:space:]]*}}"
  str="${str%${str##*[![:space:]]}}"
  printf '%s' "$str"
}

strip_inline_comment() {
  local input="$1"
  local result=""
  local char quote="" escaped=0

  for ((i = 0; i < ${#input}; i++)); do
    char="${input:i:1}"

    if ((escaped)); then
      result+="$char"
      escaped=0
      continue
    fi

    if [[ $char == "\\" ]]; then
      escaped=1
      result+="$char"
      continue
    fi

    if [[ $char == '"' || $char == "'" ]]; then
      if [[ -z $quote ]]; then
        quote="$char"
      elif [[ $quote == $char ]]; then
        quote=""
      fi
      result+="$char"
      continue
    fi

    if [[ $char == "#" && -z $quote ]]; then
      break
    fi

    result+="$char"
  done

  printf '%s' "$result"
}

sanitize_value() {
  local value="$1"
  value="$(trim_whitespace "$value")"

  if [[ ${#value} -ge 2 ]]; then
    local first_char="${value:0:1}"
    local last_char="${value: -1}"

    if [[ ( $first_char == '"' && $last_char == '"' ) || ( $first_char == "'" && $last_char == "'" ) ]]; then
      value="${value:1:${#value}-2}"
    fi
  fi

  printf '%s' "$value"
}

declare -a ENV_KEYS=()
declare -a ENV_VALUES=()

while IFS= read -r raw_line || [[ -n $raw_line ]]; do
  local_line="${raw_line//$'\r'/}"
  local_line="$(trim_whitespace "$local_line")"

  if [[ -z $local_line || $local_line == '#'* ]]; then
    continue
  fi

  local_line="$(strip_inline_comment "$local_line")"
  local_line="$(trim_whitespace "$local_line")"

  if [[ -z $local_line ]]; then
    continue
  fi

  if [[ $local_line =~ ^[Dd][Ee][Cc][Ll][Aa][Rr][Ee][[:space:]]+-[Xx][[:space:]]+(.*)$ ]]; then
    local_line="${BASH_REMATCH[1]}"
    local_line="$(trim_whitespace "$local_line")"
  fi

  if [[ $local_line =~ ^[Ee][Xx][Pp][Oo][Rr][Tt][[:space:]]+(.*)$ ]]; then
    local_line="${BASH_REMATCH[1]}"
    local_line="$(trim_whitespace "$local_line")"
  fi

  if [[ $local_line != *=* ]]; then
    printf '⚠️  Skipping malformed line: %s\n' "$raw_line" >&2
    continue
  fi

  key="${local_line%%=*}"
  value="${local_line#*=}"

  key="$(trim_whitespace "$key")"
  value="$(sanitize_value "$value")"

  if [[ -z $key ]]; then
    printf '⚠️  Skipping line with empty key: %s\n' "$raw_line" >&2
    continue
  fi

  ENV_KEYS+=("${key//$'\r'/}")
  ENV_VALUES+=("${value//$'\r'/}")
done < "$ENV_FILE"

if [[ ${#ENV_KEYS[@]} -eq 0 ]]; then
  echo "⚠️  No variables detected in '$ENV_FILE'" >&2
  exit 0
fi

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
    if vercel env rm "$key" "$env" --yes "${TOKEN_FLAG[@]}" "${PROJECT_FLAG[@]}" >/dev/null 2>&1; then
      printf '      (existing value removed)\n'
    fi

    if [[ -z "$value" ]]; then
      printf '      ⚠️  Skipped empty value\n'
      continue
    fi

    if ! printf '%s\n' "$value" | vercel env add "$key" "$env" "${TOKEN_FLAG[@]}" "${PROJECT_FLAG[@]}" >/dev/null; then
      printf '      ❌ Failed to set %s for %s\n' "$key" "$env"
      return 1
    fi
  done

  return 0
}

printf '\n🌐 Syncing %d variables from %s\n' "${#ENV_KEYS[@]}" "$ENV_FILE"

SUCCESS_COUNT=0
ERROR_COUNT=0

describe_value() {
  local raw="$1"

  if [[ -z $raw ]]; then
    printf '<empty>'
    return
  fi

  if [[ $raw == *$'\n'* ]]; then
    printf '<multiline (%d chars)>' "${#raw}"
    return
  fi

  printf '<%d chars>' "${#raw}"
}

for idx in "${!ENV_KEYS[@]}"; do
  key="${ENV_KEYS[$idx]}"
  value="${ENV_VALUES[$idx]}"

  printf '\n• %s %s\n' "$key" "$(describe_value "$value")"
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
