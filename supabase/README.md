# Serveur Sewing Companion

Hébergé dans le projet Supabase **NoobHammer40k** (`qqrmozqxzeicbxwauiqt`), sans rien partager avec cette application :
tables `sc_membres` et `sc_amities`, fonctions `sc_*` (migration `sewing_companion_amis`).

- Pas de compte Supabase Auth : chaque téléphone génère un secret aléatoire de 256 bits, le serveur n'en garde que l'empreinte SHA-256.
- Les tables ont la RLS activée sans aucune politique et aucun droit pour `anon` : on ne peut y accéder qu'à travers les fonctions
  `SECURITY DEFINER`, qui vérifient le secret à chaque appel.
- Un stock n'est lisible que par une amie acceptée, et seulement si le partage est activé.
