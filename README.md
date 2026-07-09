# Le Registre

Un endroit unique où chaque fiançailles religieuses célébrées (khitba) sont inscrites.

L'application enregistre volontairement des **fiançailles**, pas des mariages : en Belgique,
le mariage civil doit précéder toute bénédiction nuptiale religieuse (art. 21 de la
Constitution). Les fiançailles, elles, ne sont soumises à aucune restriction.

Application Expo / React Native + Supabase, **réservée aux témoins** (les personnes qui
célèbrent et enregistrent les cérémonies). Les particuliers n'ont pas accès aux données :
toute lecture et écriture nécessite un compte connecté.

## L'essentiel

Trois onglets, une action principale :

- **Enregistrer** (écran par défaut) : lui (prénom, nom, naissance), elle (idem), la date,
  le lieu — et c'est inscrit. Le témoin est déduit du compte connecté. Si l'une des deux
  personnes a déjà des **fiançailles en cours**, une alerte apparaît pendant la saisie
  (informative — le témoin reste décisionnaire).
- **Vérifier** : rechercher une personne et voir son statut — Fiancé(e) / Rupture /
  Veuf(ve) / Libre — avec le détail (avec qui, depuis quand, où).
- **Fiançailles** : le registre complet, avec clôture (rupture ou décès) en deux taps.

Une personne est identifiée par **prénom + nom + date de naissance** (contrainte unique
en base, insensible à la casse).

## Configuration Supabase (une seule fois)

1. Projet gratuit sur [supabase.com](https://supabase.com)
2. **SQL Editor** → exécuter `supabase_setup.sql`
3. **Settings → API** : coller l'URL et la clé publique dans `lib/supabase.ts`

## Lancer / déployer

```bash
npm install
npm start          # téléphone (Expo Go)
npm run web        # navigateur (localhost:8081)
npm run deploy     # publie sur GitHub Pages
```

En ligne : https://mahadliban.github.io/registre-nikah/

## Comptes

- Inscription libre pour l'instant (nom + communauté + email + mot de passe).
- Un compte de démonstration partagé est accessible depuis l'écran d'accueil
  (« Essayer avec le compte de démonstration »).

## Structure

- `App.tsx` — polices, session, navigation (welcome / login / signup / home)
- `screens/HomeScreen.tsx` — en-tête + 3 onglets segmentés
- `screens/RegisterUnionScreen.tsx` — le formulaire principal + alerte en temps réel
- `screens/SearchScreen.tsx`, `screens/UnionsScreen.tsx` — vérification et registre
- `lib/registre.ts` — accès aux données, calcul de statut
- `components/theme.ts` — design tokens (Manrope, accent émeraude)
- `supabase_setup.sql` — tables, RLS (lecture/écriture réservées aux connectés), trigger de profil

Note : en base, la table s'appelle `mariages`, les statuts `divorce`/`veuvage` et le champ
du témoin `imam` (héritage des versions précédentes) — seule l'interface utilise le
vocabulaire des fiançailles (rupture = `divorce`, décès = `veuvage`).

## Avant une vraie utilisation

- Validation des comptes témoins (aujourd'hui l'inscription est ouverte).
- RGPD : données sensibles — consentement des personnes inscrites, droit à l'effacement.
- Retirer le compte de démonstration et purger les données de test.
