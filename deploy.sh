#!/usr/bin/env bash
set -euo pipefail

# --------- Nastavenia (bezpečné defaulty) ----------
# Ak používaš chránené API, zadaj token cez env pri volaní:
#   API_AUTH_TOKEN=xxxx ./deploy.sh
API_BASE_PATH_CHAT="/api/chat"
API_BASE_PATH_ANALYZE="/api/hair/analyze"

# Timeout pre curl testy (sekundy)
CURL_TIMEOUT=15

# --------- Helpery ----------
say()  { printf "\033[1;34m[info]\033[0m %s\n" "$*"; }
ok()   { printf "\033[1;32m[ok]\033[0m %s\n"   "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
err()  { printf "\033[1;31m[err]\033[0m %s\n"  "$*" >&2; }

trap 'err "zlyhanie: pozri posledné logy vyššie. nič sa nenasadilo na produkciu."' ERR

# --------- Predbežné kontroly ----------
if ! command -v vercel >/dev/null 2>&1; then
  err "Vercel CLI nie je nainštalované. nainštaluj: npm i -g vercel"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  err "Pracovný strom nie je čistý. Urob commit/stash pred deployom."
  exit 1
fi

say "Kontrolujem vercel login…"
vercel whoami >/dev/null || { err "Nie si prihlásený. Spusti: vercel login"; exit 1; }

say "Kontrolujem link projektu…"
vercel link --yes >/dev/null

# (nepovinné) stiahni env do lokálneho .env, ak chceš použiť hodnoty pri smoke testoch
say "Sťahujem env do .env (development snapshot) – iba lokálne použitie na testy…"
vercel env pull .env >/dev/null || warn "env pull zlyhal (nevadí)."

# --------- Build lokálne (fail = stop) ----------
say "Lokálny build…"
npm ci --ignore-scripts || npm install
npm run build

ok "Lokálny build úspešný."

# --------- Preview deploy ----------
say "Nasadzujem PREVIEW (žiadna produkcia)…"
PREVIEW_URL="$(vercel --confirm | tail -n1 | awk '{print $NF}')"
if [[ -z "${PREVIEW_URL}" ]]; then
  err "Neviem zistiť PREVIEW URL."
  exit 1
fi
ok "Preview: ${PREVIEW_URL}"

# --------- Smoke testy proti preview ----------
say "Smoke testy proti preview…"

auth_header=()
if [[ -n "${API_AUTH_TOKEN:-}" ]]; then
  auth_header=(-H "Authorization: Bearer ${API_AUTH_TOKEN}")
  say "Používam Bearer auth pre testy."
else
  warn "API_AUTH_TOKEN nie je nastavený – testujem ako verejné API."
fi

# chat
say "Test: POST ${PREVIEW_URL}${API_BASE_PATH_CHAT}"
curl -fsS --max-time $CURL_TIMEOUT -X POST \
  -H 'Content-Type: application/json' \
  "${auth_header[@]}" \
  -d '{"message":"Ahoj!"}' \
  "${PREVIEW_URL}${API_BASE_PATH_CHAT}" | head -c 300 >/dev/null
ok "chat OK"

# analyze
say "Test: POST ${PREVIEW_URL}${API_BASE_PATH_ANALYZE}"
curl -fsS --max-time $CURL_TIMEOUT -X POST \
  -H 'Content-Type: application/json' \
  "${auth_header[@]}" \
  -d '{"imageUrl":"https://picsum.photos/seed/hair/600"}' \
  "${PREVIEW_URL}${API_BASE_PATH_ANALYZE}" | head -c 300 >/dev/null
ok "analyze OK"

# --------- Potvrdenie pred produkciou ----------
read -r -p $'\033[1;33mChceš pokračovať na PRODUKČNÝ deploy? [y/N] \033[0m' yn
case "${yn:-N}" in
  [Yy]*) ;;
  *) warn "Produkciu preskakujem. Koniec."; exit 0;;
esac

# --------- Produkčný deploy ----------
say "Nasadzujem PRODUKCIU…"
PROD_URL_LINE="$(vercel --prod --confirm | grep -Eo 'https://[^ ]+\.vercel\.app' | tail -n1 || true)"
if [[ -z "${PROD_URL_LINE}" ]]; then
  err "Neviem zistiť produkčnú URL z výstupu."
  exit 1
fi
PROD_URL="${PROD_URL_LINE}"
ok "Produktion: ${PROD_URL}"

# --------- Produkčný health-check ----------
say "Produkčný health-check…"
curl -fsS --max-time $CURL_TIMEOUT "${PROD_URL}" >/dev/null || { err "Root stránka nedostupná"; exit 1; }

# (voliteľné) rýchle API testy aj na produkcii
say "Produkčný smoke test: chat"
curl -fsS --max-time $CURL_TIMEOUT -X POST \
  -H 'Content-Type: application/json' \
  "${auth_header[@]}" \
  -d '{"message":"Ahoj!"}' \
  "${PROD_URL}${API_BASE_PATH_CHAT}" | head -c 200 >/dev/null && ok "chat (prod) OK"

say "Produkčný smoke test: analyze"
curl -fsS --max-time $CURL_TIMEOUT -X POST \
  -H 'Content-Type: application/json' \
  "${auth_header[@]}" \
  -d '{"imageUrl":"https://picsum.photos/seed/hair/600"}' \
  "${PROD_URL}${API_BASE_PATH_ANALYZE}" | head -c 200 >/dev/null && ok "analyze (prod) OK"

ok "✅ Hotovo. Preview: ${PREVIEW_URL}  |  Prod: ${PROD_URL}"
