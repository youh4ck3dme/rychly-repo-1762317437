# Nastavenie SSH pre správneho GitHub používateľa

cat <<EOF > ~/.ssh/config
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
EOF

echo "SSH config bol nastavený. Skúste príkaz: ssh -T git@github.com"
