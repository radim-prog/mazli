# mazli — Mazlíkův týden

Rodinný týdenní plánovač aktivit pro Mazlinka. Next.js 16 + better-sqlite3, standalone output.

## Stack

- Next.js 16 (App Router, standalone output)
- TypeScript + Tailwind CSS v4
- better-sqlite3 (SQLite, file at `SQLITE_PATH`)
- Node.js 20

## Tříkrokový workflow (dev → staging → produkce)

### Větve

| Větev   | Účel                        | URL                              |
|---------|-----------------------------|----------------------------------|
| main    | Produkce                    | https://mazli.zajcon.cz          |
| staging | Staging (testování)         | https://mazli-staging.zajcon.cz  |

### 1. Dev (lokálně)

```bash
npm install
SQLITE_PATH=./mazli.db npm run dev
```

### 2. Staging

Push do větve `staging` spustí CI (typecheck + lint + build).
Deploy na server:

```bash
ssh root@116.202.174.252 deploy-mazli-staging
```

Staging URL: https://mazli-staging.zajcon.cz (port 3013, noindex)

### 3. Produkce

Merge `staging` → `main` + deploy:

```bash
ssh root@116.202.174.252 deploy-mazli-prod
```

Produkce URL: https://mazli.zajcon.cz (port 3008)

## Server

- Host: 116.202.174.252
- Repo na serveru (staging): `/root/Projects/mazli-staging`
- Repo na serveru (prod): `/root/Projects/mazli`
- Systemd (staging): `mazli-staging.service` (port 3013)
- Systemd (prod): `mazli.service` (port 3008)
- Data volume (staging): `/root/Projects/mazli-staging/data/mazli.db`
- Data volume (prod): `/root/Projects/mazli/data/mazli.db`

## Env proměnné

| Proměnná    | Popis                          | Příklad                     |
|-------------|--------------------------------|-----------------------------|
| SQLITE_PATH | Cesta k SQLite databázi        | /root/Projects/mazli/data/mazli.db |
| PORT        | Port pro Next.js server        | 3008 (prod), 3013 (staging) |
| HOSTNAME    | Bind adresa                    | 0.0.0.0                     |

## Rollback

```bash
ssh root@116.202.174.252 "cd /root/Projects/mazli-staging && git log --oneline -5"
ssh root@116.202.174.252 "cd /root/Projects/mazli-staging && git checkout <commit> && deploy-mazli-staging"
```
