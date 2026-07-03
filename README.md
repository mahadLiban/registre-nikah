# Registre des Mariages Religieux

Application mobile (Expo / React Native, comme parking-riverain-bxl) permettant aux imams
de plusieurs mosquées d'enregistrer les mariages religieux (nikah) qu'ils célèbrent, et de
vérifier si une personne est déjà mariée religieusement avant une nouvelle union.
Le registre est partagé entre tous les imams via Supabase.

Le design suit le handoff « Registre des Mariages Religieux » (`design_handoff_registre_mariages`) :
navigation latérale sombre (barre horizontale en haut sous 860 px de largeur), titres en
Source Serif 4, corps en IBM Plex Sans, badges de statut à 4 états et alertes de conflit
en temps réel.

## Configuration Supabase (à faire une seule fois)

1. Créez un projet gratuit sur [supabase.com](https://supabase.com).
2. Dans le projet : **SQL Editor** → collez le contenu de `supabase_setup.sql` → **Run**.
3. Dans **Settings → API**, copiez l'« URL » et la clé « anon / publishable ».
4. Collez ces deux valeurs dans `lib/supabase.ts` (constantes `SUPABASE_URL` et `SUPABASE_ANON_KEY`).

Tant que ce n'est pas fait, l'écran d'accueil affiche un avertissement.

## Lancer l'application

```bash
npm install
npm start        # QR code pour téléphone (Expo Go)
npm run web      # version navigateur sur http://localhost:8081
```

## Écrans (après connexion imam)

- **Tableau de bord** : 4 cartes statistiques (mariages, unions actives, divorces,
  mosquées partenaires), boutons d'action et liste des 5 mariages récents.
- **Vérifier une personne** : recherche par nom, badge de statut calculé à partir de
  TOUS les mariages de la personne — Marié(e) / Divorcé(e) / Veuf(ve) / Célibataire —
  avec le détail (conjoint, date, mosquée, imam ou date de fin d'union).
- **Nouveau mariage** : 3 sections (époux, épouse, cérémonie). La mosquée officiante se
  choisit dans la liste et l'imam est déduit automatiquement. **Alerte de conflit en
  temps réel** : dès que prénom + nom correspondent à une union active, une bannière
  ambre apparaît — informative, elle n'empêche pas l'enregistrement (l'imam décide).
- **Nouveau divorce / veuvage** : sélection d'une union active, type (divorce/veuvage),
  date de fin.
- **Mosquées & imams** : cartes des mosquées partenaires (avec nombre de mariages) et
  formulaire d'ajout.

Une personne est identifiée par **prénom + nom + date de naissance** (insensible à la
casse, contrainte unique en base) — deux homonymes avec des dates de naissance
différentes sont bien distingués, conformément à la recommandation du handoff.

## Structure

- `App.tsx` — chargement des polices, session, navigation (welcome / login / signup / home)
- `screens/HomeScreen.tsx` — barre latérale (ou barre supérieure mobile) + 5 vues
- `screens/` — DashboardScreen, SearchScreen, NewMarriageScreen, EndUnionScreen, MosquesScreen, WelcomeScreen, AuthScreen
- `components/theme.ts` — design tokens du handoff (couleurs OKLCH converties en hex, polices)
- `components/Select.tsx`, `components/StatutBadge.tsx` — équivalents RN du select et des badges du prototype
- `lib/supabase.ts` — client Supabase ; `lib/registre.ts` — accès aux données et calcul de statut
- `supabase_setup.sql` — tables (profiles, mosquees, personnes, mariages), RLS, trigger de profil

## À prévoir avant un vrai déploiement

- Conformité RGPD : les données religieuses et matrimoniales sont des données sensibles
  (consentement des personnes enregistrées, droit à l'effacement, registre de traitement).
- Validation des comptes imams (aujourd'hui n'importe qui peut s'inscrire) —
  par exemple une approbation manuelle dans Supabase avant activation.
- Confirmation d'email Supabase (désactivée par défaut sur les nouveaux projets, à vérifier).
