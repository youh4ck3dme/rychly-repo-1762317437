#!/bin/zsh
# Pridanie SSH kľúča do GitHub účtu a test spojenia
echo "Skopírujte nasledujúci verejný kľúč a pridajte ho do GitHub účtu youh4ck3dme:"
echo ""
cat ~/.ssh/id_ed25519.pub
echo ""
echo "Po pridaní kľúča do GitHubu stlačte Enter na pokračovanie..."
read
ssh -T git@github.com
echo "Ak vyššie vidíte 'Hi youh4ck3dme!', môžete pokračovať s push:"
echo "git push -u origin main"
echo "Hotovo."
