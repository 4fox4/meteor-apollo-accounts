# Migration Meteor 3 — meteor-apollo-accounts

> **Statut global :** 🟢 Terminé — P0 ✅ P1 ✅ P2 ✅ (hors tests)  
> **Dernière mise à jour :** 2026-04-27

---

## Contexte

Ce package (`4fox4:apollo-accounts`) expose les comptes Meteor via des resolvers GraphQL.  
Il cible actuellement Meteor `2.4` et doit être mis à niveau pour Meteor `3.0`.

Changements structurants de Meteor 3 impactant ce package :
- **Suppression des Fibers** → tout le code bloquant synchrone doit être async/await
- **Suppression du package `http`** → remplacé par `fetch` natif Node.js 18+
- **Méthodes `Accounts.*` devenues async** → doivent être `await`-ées
- **`Meteor._nodeCodeMustBeInFiber()` supprimé**

---

## Tâches de migration

### P0 — Bloquant (crash garanti en Meteor 3)

- [x] **Supprimer `Meteor._nodeCodeMustBeInFiber()`**
  - `src/Mutation/createUser.js`
  - `src/Mutation/createUserWithPhone.js`

- [x] **Migrer `callMethod.js` vers async/await**
  - `src/callMethod.js`
  - Handler désormais `await`-é, fonction déclarée `async`

- [x] **Mettre à jour `api.versionsFrom` dans `package.js`**
  - Changé vers `["2.4", "3.0"]` — compatibilité duale conservée

---

### P1 — Fonctionnel (comportement incorrect sans ce fix)

- [x] **Remplacer `HTTP.get/post` par `fetch` natif**
  - `src/Mutation/oauth/loginWithGoogle.js` — `getIdentity` + `getScopes` async, `Promise.all` pour paralléliser
  - `src/Mutation/oauth/loginWithFacebook.js` — `getIdentity` async
  - `src/Mutation/oauth/loginWithLinkedIn.js` — `getAccessToken` via `URLSearchParams` + `fetch POST`, `getIdentity` async
  - `src/Mutation/oauth/resolver.js` — `await handleAuthFromAccessToken` + `await callMethod`
  - `"http@2.0.0"` retiré de `package.js`

- [x] **Ajouter `await` sur les méthodes `Accounts.*` async et tous les `callMethod`**
  - `getUserLoginMethod.js` → fonction async, `await findUserByEmail/Username`
  - `resendVerificationEmail.js` → `await sendVerificationEmail`
  - `loginWithPassword.js` → `await callMethod` + `await getUserLoginMethod`
  - `changePassword`, `resetPassword`, `verifyEmail`, `loginWithPhone`, `forgotPassword`, `resendPhoneVerification` → `await callMethod`
  - `logout.js` → `await` sur `_hashLoginToken`, `destroyToken`, `_successfulLogout`

---

### P2 — Stabilisation (APIs privées Meteor)

- [x] **Vérifier `Accounts._hashLoginToken()`**
  - Reste **synchrone** en Meteor 3 — pas de `await` nécessaire (retiré)

- [x] **Vérifier `Accounts._successfulLogout()`**
  - Devenu **async** en Meteor 3 (`forEachAsync`) — `await` ajouté ✅

- [x] **Vérifier `Accounts.destroyToken()`**
  - Devenu **async** en Meteor 3 (`updateAsync`) — `await` ajouté ✅

- [x] **Vérifier `Meteor.server.method_handlers`**
  - Toujours présent en Meteor 3, handler correctement `await`-é dans `callMethod.js` ✅

---

### P3 — Qualité (hors blocage)

- [ ] **Mettre en place une suite de tests**
  - `Package.onTest()` est vide actuellement
  - Aucun fichier `*.test.js` dans le projet

---

## Fichiers concernés — vue d'ensemble

| Fichier | Changements requis | Priorité |
|---|---|---|
| `package.js` | `versionsFrom`, retirer `http@2.0.0` | P0 + P1 |
| `src/callMethod.js` | Async/await du handler | P0 |
| `src/Mutation/createUser.js` | Supprimer `_nodeCodeMustBeInFiber` | P0 |
| `src/Mutation/createUserWithPhone.js` | Supprimer `_nodeCodeMustBeInFiber` | P0 |
| `src/Mutation/loginWithPassword.js` | `await` sur `findUserByEmail/Username` | P1 |
| `src/Mutation/resendVerificationEmail.js` | `await` sur `sendVerificationEmail` | P1 |
| `src/Mutation/logout.js` | Vérifier APIs `_` privées | P2 |
| `src/Mutation/oauth/loginWithGoogle.js` | `HTTP.get` → `fetch` | P1 |
| `src/Mutation/oauth/loginWithFacebook.js` | `HTTP.get` → `fetch` | P1 |
| `src/Mutation/oauth/loginWithLinkedIn.js` | `HTTP.post/get` → `fetch` | P1 |

---

## Décisions prises

- **`api.versionsFrom`** → `["2.4", "3.0"]` : compatibilité duale choisie pour ne pas casser les projets Meteor 2 existants.
- **`createUserWithPhone.js`** → `Accounts.createUserWithPhone` et `sendPhoneVerificationCode` traités comme async (pattern cohérent avec le reste de l'API Accounts v3).
- **LinkedIn `getAccessToken`** → corps encodé en `application/x-www-form-urlencoded` via `URLSearchParams` (le package `http` gérait ça automatiquement avec `params` sur un POST, `fetch` ne le fait pas).
- **Google** → `getIdentity` et `getScopes` parallélisés avec `Promise.all` puisqu'ils sont indépendants.
- **`Accounts._hashLoginToken()`** → synchrone en Meteor 3, `await` superflu retiré.
- **`resolver.js` ligne 27** → `await` manquant sur `getUserLoginMethod()` (security review) : le gate `"no-password"` était inatteignable car `method` était une `Promise` toujours truthy.
- **`Accounts.destroyToken()` et `_successfulLogout()`** → devenus async en Meteor 3, `await` ajouté.

---

## Notes & références

- [Guide de migration officiel Meteor 3](https://v3-migration-docs.meteor.com/)
- [Meteor 3 — suppression des Fibers](https://v3-migration-docs.meteor.com/breaking-changes/fibers-removed)
- [Meteor 3 — package `http` retiré](https://v3-migration-docs.meteor.com/breaking-changes/http-removed)
