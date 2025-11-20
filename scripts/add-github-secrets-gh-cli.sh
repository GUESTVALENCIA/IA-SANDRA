#!/bin/bash
# Script para añadir secrets usando GitHub CLI

gh secret set VERCEL_TOKEN --body "rTbbeIXzN70ZvXbG6L9Avj5d" --repo GUESTVALENCIA/IA-SANDRA
gh secret set VERCEL_ORG_ID --body "team_w9AY6yfr55sc9UzBFkS8OyY8" --repo GUESTVALENCIA/IA-SANDRA
gh secret set VERCEL_PROJECT_ID --body "prj_HNCaiegvbQcqBHrV8kZwttlKrDPe" --repo GUESTVALENCIA/IA-SANDRA

echo "✅ Secrets añadidos correctamente"

