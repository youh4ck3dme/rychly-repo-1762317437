#!/usr/bin/env bash
set -euo pipefail
F=src/pages/index.astro
cp "$F" "$F.bak.$(date +%s)"
# Svelte-style handlers → JSX
perl -i -pe 's/\bon:click=/onClick=/g; s/\bon:change=/onChange=/g; s/\bon:input=/onInput=/g; s/\bon:submit=/onSubmit=/g; s/\bon:keydown=/onKeyDown=/g; s/\bon:keyup=/onKeyUp=/g' "$F"
# class:foo={expr} → clsx
perl -0777 -i -pe 's/class:([-\w]+)\s*=\s*\{([^}]+)\}/class={clsx({ \"\$1\": (\$2) })}/g' "$F"
# object-literal class={{…}} → clsx
perl -i -pe 's/class=\{\{\s*/class={clsx({ /g; s/\}\}\}/})}/g' "$F"
# import clsx if missing
grep -q "import clsx from 'clsx'" "$F" || \
  sed -i "0,/^---$/s|---|---\nimport clsx from 'clsx';|" "$F"
echo "✅ Applied patch to $F"
