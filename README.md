# NGCrops

Version simple de NGCrops: une seule page principale qui affiche une card par crop avec:
- prix actuel
- recommandation BUY/HOLD/SELL
- score de confiance
- explication courte
- graphique d'evolution des prix

L'interface est 100% en francais.

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Configuration `.env.local`

Copiez le fichier d'exemple:

```bash
cp .env.example .env.local
```

Variables requises:

```env
YOXO_API_BASE_URL=https://api.yoxo.software
YOXO_CLIENT_ID=
YOXO_CLIENT_SECRET=
```

Le client applique le flux OAuth2 Client Credentials documente par Yoxo:
- `POST https://auth.yoxo.software/oauth2/token` avec `grant_type=client_credentials`, `client_id`, `client_secret`, `scope=api_access`
- puis appel API avec `Authorization: Bearer <access_token>`

Les secrets ne doivent jamais etre hardcodes.

## Derniere date impaire

La date envoyee a l'endpoint Yoxo est calculee automatiquement avec `src/lib/date.ts`:
- si aujourd'hui est impair, on utilise aujourd'hui
- si aujourd'hui est pair, on utilise la veille impaire
- le format final est `YYYY-MM-DD`

Le client essaie ensuite plusieurs dates impaires recentes (fallback) pour trouver la derniere date impaire reellement disponible. Cela evite les erreurs 404 quand le snapshot du jour impair n'est pas encore publie.

Exemples:
- 18 -> 17
- 17 -> 17
- 1 -> 1

## Personnaliser labels et images des crops

Le mapping est dans `src/lib/crops.ts`.

Vous pouvez:
- changer le label francais d'une crop
- ajouter une image locale via `image: "/mon-image.png"`

Pour une crop non mapee, un fallback lisible est genere automatiquement.

## Structure principale

- `src/app/page.tsx` page unique
- `src/lib/yoxo.ts` client Yoxo
- `src/lib/date.ts` utilitaire date impaire
- `src/lib/market.ts` normalisation + recommandations prix-only
- `src/lib/crops.ts` labels/images des crops
- `src/types/market.ts` types metier
- `src/components/market/crop-card.tsx` card de crop
- `src/components/market/price-chart.tsx` graphique Recharts
