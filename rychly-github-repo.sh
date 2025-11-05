#!/bin/zsh
# Skript na rýchle vytvorenie nového repozitára cez GitHub CLI a push projektu

# Nastav názov repozitára
REPO_NAME="rychly-repo-$(date +%s)"

# Vytvor repozitár cez GitHub CLI (gh)
echo "Vytváram nový repozitár: $REPO_NAME"
gh repo create "$REPO_NAME" --public --confirm

echo "Nastavujem remote origin..."
git remote set-url origin git@github.com:$(gh api user | grep '"login"' | cut -d '"' -f4)/$REPO_NAME.git

echo "Pushujem projekt na GitHub..."
git push -u origin main

echo "Repozitár je pripravený: https://github.com/$(gh api user | grep '"login"' | cut -d '"' -f4)/$REPO_NAME"
