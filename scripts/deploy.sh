#!/usr/bin/env bash
#
# Déploiement du front CJK sur le VPS (modèle systemd, en attendant la migration
# vers une image Docker immuable).
#
# Ce script existe pour empêcher la reproduction de l'incident du 2026-11-09 :
# un `git pull && npm run build` avait été lancé sans redémarrer le service. Le
# process Next.js servait alors du HTML référençant les chunks de l'ancien build
# (que `next build` venait d'effacer), d'où des HTTP 400 sur
# `_next/static/chunks/app/layout-*.js`, un `ChunkLoadError` et l'écran
# « Application error: a client-side exception has occurred ».
#
# Il garantit trois choses :
#   1. le build ne s'écrit pas par-dessus les assets servis par le process en
#      cours (construction dans .next-build, puis bascule par `mv`) ;
#   2. le service est toujours redémarré après un build réussi ;
#   3. le résultat est vérifié après redémarrage, avec rollback automatique sur
#      le build précédent si la vérification échoue.
#
# Usage :
#   sudo /home/cjk-front.io/scripts/deploy.sh
#
# Variables surchargeables : APP_DIR, SERVICE, UPSTREAM, BRANCH, EXPECTED_API.

set -euo pipefail

APP_DIR="${APP_DIR:-/home/cjk-front.io}"
SERVICE="${SERVICE:-cjk-front}"
UPSTREAM="${UPSTREAM:-http://127.0.0.1:3006}"
BRANCH="${BRANCH:-main}"
# Doit apparaître dans le build : garde-fou contre un bundle construit sans
# .env.production, qui pointerait sur http://localhost:8000 et n'afficherait
# aucune donnée.
EXPECTED_API="${EXPECTED_API:-api.cjkamenge.com}"

BUILD_DIR=".next-build"
LIVE_DIR=".next"
PREV_DIR=".next.previous"
FAILED_DIR=".next.failed"

SWAPPED=0

log()  { printf '[deploy] %s\n' "$*"; }
die()  { printf '[deploy] ERREUR: %s\n' "$*" >&2; exit 1; }

rollback() {
  local status=$?
  trap - EXIT

  if [[ "$status" -eq 0 ]]; then
    return
  fi

  if [[ "$SWAPPED" -eq 1 && -d "$PREV_DIR" ]]; then
    log "echec apres bascule, retour au build precedent"
    rm -rf "$FAILED_DIR"
    mv "$LIVE_DIR" "$FAILED_DIR"
    mv "$PREV_DIR" "$LIVE_DIR"
    systemctl restart "$SERVICE" || true
    sleep 5
    log "build fautif conserve dans $APP_DIR/$FAILED_DIR pour analyse"
  else
    log "echec avant bascule, le site tourne toujours sur le build precedent"
  fi

  log "30 dernieres lignes du service :"
  journalctl -u "$SERVICE" -n 30 --no-pager || true
  exit "$status"
}

trap rollback EXIT

command -v git >/dev/null || die "git introuvable"
command -v npm >/dev/null || die "npm introuvable"
command -v curl >/dev/null || die "curl introuvable"

cd "$APP_DIR" || die "repertoire $APP_DIR introuvable"

# --- 1. Etat du dépôt -------------------------------------------------------
# package-lock.json est réécrit par npm, et tsconfig.json par `next build`
# (il y injecte les chemins de types du distDir courant). Ces deux fichiers sont
# remis d'office à la version du dépôt. Toute autre modification locale est
# bloquante : elle serait perdue silencieusement.
for generated in package-lock.json tsconfig.json; do
  if ! git diff --quiet -- "$generated"; then
    log "$generated modifie localement, restauration depuis le depot"
    git checkout -- "$generated"
  fi
done

dirty="$(git status --porcelain --untracked-files=no)"
if [[ -n "$dirty" ]]; then
  printf '%s\n' "$dirty" >&2
  die "modifications locales non commitees, deploiement interrompu"
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"
[[ "$current_branch" == "$BRANCH" ]] \
  || die "branche courante '$current_branch', attendu '$BRANCH'"

PREV_COMMIT="$(git rev-parse --short HEAD)"
log "commit actuel : $PREV_COMMIT"

# --- 2. Récupération --------------------------------------------------------
log "recuperation de origin/$BRANCH"
git fetch --quiet origin "$BRANCH"
git merge --ff-only "origin/$BRANCH"

NEW_COMMIT="$(git rev-parse --short HEAD)"
if [[ "$NEW_COMMIT" == "$PREV_COMMIT" ]]; then
  log "deja a jour sur $NEW_COMMIT (reconstruction quand meme)"
else
  log "mise a jour : $PREV_COMMIT -> $NEW_COMMIT"
fi

# --- 3. Dépendances ---------------------------------------------------------
if [[ ! -d node_modules ]] \
  || ! git diff --quiet "$PREV_COMMIT" HEAD -- package.json package-lock.json; then
  log "dependances modifiees, npm ci"
  npm ci
else
  log "dependances inchangees, npm ci ignore"
fi

# --- 4. Build hors ligne de service ----------------------------------------
log "build dans $BUILD_DIR (le site continue de tourner sur $LIVE_DIR)"
rm -rf "$BUILD_DIR"
# Reprise du cache webpack du build precedent : `next build` vide son repertoire
# de sortie mais preserve `cache/`. Sans cette copie, chaque deploiement repart
# d'un build a froid, nettement plus lent.
if [[ -d "$LIVE_DIR/cache" ]]; then
  log "reprise du cache de build precedent"
  mkdir -p "$BUILD_DIR"
  cp -a "$LIVE_DIR/cache" "$BUILD_DIR/cache"
fi
NEXT_DIST_DIR="$BUILD_DIR" npm run build

# --- 5. Contrôles avant bascule --------------------------------------------
[[ -f "$BUILD_DIR/BUILD_ID" ]] || die "$BUILD_DIR/BUILD_ID absent, build incomplet"

shopt -s nullglob
layout_chunks=("$BUILD_DIR"/static/chunks/app/layout-*.js)
shopt -u nullglob
[[ "${#layout_chunks[@]}" -gt 0 ]] \
  || die "aucun chunk static/chunks/app/layout-*.js, build incomplet"

if ! grep -rqs --binary-files=text "$EXPECTED_API" "$BUILD_DIR/server" "$BUILD_DIR/static"; then
  die "'$EXPECTED_API' absent du build : NEXT_PUBLIC_API_BASE_URL n'a pas ete pris en compte (verifier $APP_DIR/.env.production)"
fi

log "build valide : BUILD_ID=$(cat "$BUILD_DIR/BUILD_ID")"

# --- 6. Bascule + redémarrage ----------------------------------------------
log "bascule de $BUILD_DIR vers $LIVE_DIR"
rm -rf "$PREV_DIR"
if [[ -d "$LIVE_DIR" ]]; then
  mv "$LIVE_DIR" "$PREV_DIR"
fi
mv "$BUILD_DIR" "$LIVE_DIR"
SWAPPED=1

log "redemarrage de $SERVICE"
systemctl restart "$SERVICE"

# --- 7. Vérifications après redémarrage ------------------------------------
log "attente de la reponse de $UPSTREAM"
ready=0
for _ in $(seq 1 30); do
  if [[ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$UPSTREAM/")" == "200" ]]; then
    ready=1
    break
  fi
  sleep 2
done
[[ "$ready" -eq 1 ]] || die "$UPSTREAM/ ne repond pas 200 apres 60s"

# Le coeur du garde-fou : le HTML servi doit référencer des chunks qui existent
# réellement sur le disque. C'est exactement ce qui était faux pendant l'incident.
home_html="$(curl -s --max-time 15 "$UPSTREAM/")"
served_chunks="$(printf '%s' "$home_html" \
  | grep -oE '_next/static/chunks/app/[^"]+\.js' | sort -u || true)"
[[ -n "$served_chunks" ]] || die "aucun chunk app/ reference dans le HTML servi"

while IFS= read -r chunk; do
  [[ -f "$LIVE_DIR/${chunk#_next/}" ]] \
    || die "le serveur reference $chunk, absent du build en place (process desynchronise)"
done <<< "$served_chunks"
log "chunks servis coherents avec le build en place"

# /about doit répondre 200 avec un corps : cette route renvoyait un 304 vide.
about_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$UPSTREAM/about")"
about_size="$(curl -s -o /dev/null -w '%{size_download}' --max-time 15 "$UPSTREAM/about")"
[[ "$about_code" == "200" ]] || die "/about renvoie $about_code (attendu 200)"
[[ "$about_size" -gt 1000 ]] || die "/about renvoie un corps de $about_size octets"
log "/about : $about_code, $about_size octets"

for route in / /activities /blog /news /gallery /admin; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$UPSTREAM$route")"
  [[ "$code" == "200" ]] || die "$route renvoie $code (attendu 200)"
  log "  $route -> $code"
done

trap - EXIT
log "deploiement termine sur $NEW_COMMIT"
log "build precedent conserve dans $APP_DIR/$PREV_DIR"
log "rollback manuel : git reset --hard $PREV_COMMIT puis relancer ce script"
