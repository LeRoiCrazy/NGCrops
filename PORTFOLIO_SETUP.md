# Portfolio de Silos - Guide de Configuration

Cette feature ajoute un système de gestion de portfolio avec authentification Discord, permettant aux utilisateurs de tracker leurs achats de silos de céréales et d'estimer leurs profits/pertes.

## Prérequis

### Variables d'environnement Discord OAuth

Avant de commencer, tu dois configurer une application Discord Developer:

1. Visite [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique sur "New Application"
3. Donne-lui un nom (ex: "NGCrops")
4. Von à l'onglet "OAuth2"
5. Copie ton **Client ID** et **Client Secret**
6. Dans "Redirect URLs", ajoute: `http://localhost:3000/api/auth/callback/discord`

### Configuration `.env.local`

```
# Existing variables...
MONGODB_URI=<your_mongodb_connection_string>
MONGODB_DB_NAME=ngcrops

# Discord OAuth (new)
DISCORD_CLIENT_ID=<your_discord_client_id>
DISCORD_CLIENT_SECRET=<your_discord_client_secret>
AUTH_SECRET=<generate_with: openssl rand -hex 32>
AUTH_URL=http://localhost:3000
```

Pour générer `AUTH_SECRET`:
```bash
openssl rand -hex 32
```

## Architecture

### Collections MongoDB

Trois collections sont créées automatiquement:

1. **users** - Utilisateurs Discord
   - discordId (string, unique)
   - email (string)
   - name (string)
   - avatar (string, optional)
   - createdAt / updatedAt (Date)

2. **silos** - Silos ouverts (achetés mais non vendus)
   - _id (UUID)
   - userId (ObjectId)
   - cropName (string) - "Blé", "Maïs", "Orge", "Soja", "Riz", "Avoine"
   - quantité (number)
   - prixAchat (number)
   - dateAchat (Date)
   - status (string) - "OPEN" ou "CLOSED"
   - createdAt / updatedAt (Date)

3. **trades** - Historique des silos vendus
   - _id (UUID)
   - siloId (string)
   - userId (ObjectId)
   - cropName, quantité, prixAchat (numérique data)
   - prixVente (number)
   - montantBrut, taxeServeur (20%), montantNet
   - bénéfice (après taxes)
   - dateAchat / dateVente (Date)
   - createdAt (Date)

### Routes

#### Authentification
- `GET /auth/signin` - Page de connexion Discord
- `GET/POST /api/auth/*` - Handlers NextAuth

#### Portfolio
- `GET /portfolio` - Page portfolio protégée (require auth)
  - Liste des silos ouverts avec prix actuels du marché
  - Tableau d'historique des trades
  - Formulaire d'ajout de silo (modal)

#### API Portfolio
- `POST /api/portfolio/silos` - Ajouter un silo
  ```json
  {
    "cropName": "Blé",
    "quantité": 100,
    "prixAchat": 250.50,
    "dateAchat": "2026-04-16"
  }
  ```
  
- `POST /api/portfolio/silos/[id]/sell` - Vendre un silo
  ```json
  {
    "prixVente": 265.00
  }
  ```

## Calculs

### Prix actuel
Le prix actuel provient du dernier snapshot du marché MongoDB. Fallback au prix d'achat si aucun snapshot.

### Taxes serveur (20%)
- Montant brut = Prix vente × Quantité
- Taxe = Montant brut × 0.20
- Montant reçu = Montant brut - Taxe = Montant brut × 0.80

### Bénéfice/Perte
- Montant investi = Prix achat × Quantité
- Bénéfice net = Montant reçu - Montant investi
- Pourcentage = (Bénéfice net / Montant investi) × 100

### Couleurs des badges
- **Vert (Émeraude)**: Bénéfice net > 0
- **Rouge**: Bénéfice net < 0

## Flux utilisateur

1. **Connexion**
   - Utilisateur visite `/auth/signin`
   - Clique "Continuer avec Discord"
   - Autorise l'appli
   - Redirected vers `/portfolio`

2. **Ajouter un silo**
   - Click "Ajouter un silo"
   - Remplir le formulaire (céréale, quantité, prix, date d'achat optionnelle)
   - Submit → API POST /api/portfolio/silos
   - Liste se rafraîchit

3. **Vendre un silo**
   - Click "Vendre" dans le tableau
   - Modal de confirmation montrant:
     - Prix de vente (current market price)
     - Taxe serveur
     - Montant net à recevoir
     - Bénéfice/perte estimé
   - Confirm → API POST /api/portfolio/silos/[id]/sell
   - Silo passe en "CLOSED"
   - Entrée apparaît dans l'historique

## Déploiement sur Vercel

### Variables d'environnement

Sur Vercel, ajoute les mêmes variables dans "Settings > Environment Variables":
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `AUTH_SECRET` (génère une nouvelle avec openssl rand -hex 32)
- `AUTH_URL=https://yourdomain.vercel.app` (remplace yourdomain)

### Redirect URL Discord

Mets à jour la Discord app pour ajouter le Redirect URL Vercel:
- `https://yourdomain.vercel.app/api/auth/callback/discord`

## Limitations actuelles

- Un seul silo par crop par jour (UUID unique)
- Pas de cascade delete si utilisateur supprimé (OK pour MVP)
- Prix du marché = dernier snapshot (pas de fetch live au moment de la vente)
- Quantité = nombre de silos (pas de fractional units)

## Next steps possibles

- [ ] Ajouter des notifications Discord lors de recommandations BUY/SELL
- [ ] Mettre en place l'historique long terme des prix de vente
- [ ] Permettre fractional silos
- [ ] Ajouter statistiques d'utilisateur (ROI, moyenne gains, etc.)
- [ ] Dark mode improvements
