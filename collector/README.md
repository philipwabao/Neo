# Maze data collector

A tiny, zero-dependency Node server that receives **consented** maze gameplay
runs from the site and appends them to a JSONL file you can use for training.

## Run it

```bash
# from the repo root
COLLECTOR_TOKEN=$(openssl rand -hex 24) npm run collector
# -> maze collector listening on :8787  (data -> .../collector/data/maze-runs.jsonl, 0 rows)
```

Then point the site at it. Create `.env` in the repo root:

```
VITE_MAZE_COLLECTOR=http://localhost:8787/collect
```

and restart `npm run dev`. From then on, every time a player presses **Agree**
on the in-game data notice and solves a maze, the run is POSTed to the collector
and written to the JSONL file. Players who press **Disagree** send nothing.

## Endpoints

| Method | Path       | Auth            | Purpose                                            |
| ------ | ---------- | --------------- | -------------------------------------------------- |
| POST   | `/collect` | none (CORS)     | Receive one run. Validates + appends. Returns 204. |
| GET    | `/health`  | none            | `{ ok: true, count }`.                             |
| GET    | `/stats`   | Bearer token    | `{ count }`.                                       |
| GET    | `/runs`    | Bearer token    | The full dataset as NDJSON (one run per line).     |

Read endpoints require `Authorization: Bearer $COLLECTOR_TOKEN`:

```bash
curl -s localhost:8787/runs -H "Authorization: Bearer $COLLECTOR_TOKEN" > maze-runs.jsonl
```

## What a stored row looks like

```json
{"level":3,"size":13,"moves":58,"bumps":4,"ms":21034,"startedAt":1749430000000,
 "path":"sseen...","dts":[420,310,...],"maze":"3a1c...","sid":"a1b2-...","serverTs":1749430021034}
```

No name, no email, no IP, nothing that identifies a person: only the maze
layout (`maze`, hex-encoded walls), the move sequence (`path`), per-move timing
(`dts`), wrong turns (`bumps`), and a random per-visit `sid` for grouping.

## Configuration

| Env               | Default                          | Notes                                          |
| ----------------- | -------------------------------- | ---------------------------------------------- |
| `PORT`            | `8787`                           |                                                |
| `DATA_FILE`       | `collector/data/maze-runs.jsonl` | Append-only JSONL.                             |
| `CORS_ORIGIN`     | `*`                              | **Set to your site origin in production.**     |
| `COLLECTOR_TOKEN` | _(unset)_                        | **Required** for `/runs` + `/stats`.           |
| `MAX_BODY_BYTES`  | `65536`                          | Per-request body cap.                          |
| `MAX_FILE_BYTES`  | `524288000`                      | Stop accepting (507) once the dataset hits this size. |
| `RATE_MAX`        | `240`                            | Requests per IP per minute (fixed window).     |

## Hardening it's built with

- Every field is validated and range-checked; unknown fields are dropped.
- Body size cap, per-IP rate limit, method/path allowlist.
- Read endpoints are token-gated; the dataset is never public.
- The client IP is used for rate limiting but **never stored**.

## Deploying

The server is plain Node with no dependencies, so it runs anywhere Node runs
(a VM, a container, Render/Fly/Railway, etc.). Put it behind HTTPS, set a strong
`COLLECTOR_TOKEN`, set `CORS_ORIGIN` to your exact site origin, and for serious
volume swap the JSONL append for a queue or database in `/collect`. If it runs
behind a proxy/CDN, configure rate limiting on the proxy too (this server keys
on the socket address, not `X-Forwarded-For`).

## Deploy on AWS (EC2 + Caddy)

A single small EC2 instance is the simplest fit: it has a persistent disk for
the JSONL file, and Caddy gives free automatic HTTPS. You need a domain you
control (e.g. a `collector.` subdomain of your site) because the browser will
not let an HTTPS site POST to a plain-HTTP collector.

**1. DNS.** Add an `A` record `collector.neognathae.com` -> (the instance's
Elastic IP from step 2).

**2. Launch the instance.** Amazon Linux 2023, `t3.micro` (or Lightsail, same
steps inside the box). Allocate an **Elastic IP** and associate it (stable IP).
Security group inbound: `22` from your IP only, `80` and `443` from anywhere.

**3. Install Node + Caddy, fetch the code** (SSH in):

```bash
sudo dnf install -y nodejs git caddy        # Node 18+, fine for this server
sudo useradd --system --home /opt/neo maze
sudo git clone https://github.com/philipwabao/Neo.git /opt/neo
sudo mkdir -p /var/lib/maze && sudo chown maze:maze /var/lib/maze
```

**4. Secret + service.** Put the token in a root-only env file, then install the
unit:

```bash
echo "COLLECTOR_TOKEN=$(openssl rand -hex 24)" | sudo tee /etc/maze-collector.env
sudo chmod 600 /etc/maze-collector.env
sudo cp /opt/neo/collector/deploy/maze-collector.service /etc/systemd/system/
# check node's path matches the unit's ExecStart:
which node    # if not /usr/bin/node, edit ExecStart in the unit
sudo systemctl daemon-reload && sudo systemctl enable --now maze-collector
sudo systemctl status maze-collector      # should be "active (running)"
```

**5. HTTPS.** Point Caddy at it (auto-fetches the cert):

```bash
sudo cp /opt/neo/collector/deploy/Caddyfile /etc/caddy/Caddyfile
# edit the domain in /etc/caddy/Caddyfile to your real subdomain
sudo systemctl enable --now caddy && sudo systemctl reload caddy
curl https://collector.neognathae.com/health     # {"ok":true,"count":0}
```

**6. Point the site at it.** In the frontend's `.env`, set
`VITE_MAZE_COLLECTOR=https://collector.neognathae.com/collect`, then rebuild and
redeploy. Consented solves now flow to the instance.

**7. Get your data** (from your laptop, any time):

```bash
TOKEN=$(ssh ec2 'sudo cat /etc/maze-collector.env' | cut -d= -f2)   # or paste it
curl https://collector.neognathae.com/runs -H "Authorization: Bearer $TOKEN" > maze-runs.jsonl
```

**Durability.** The data lives on the instance's EBS disk (survives reboots, but
not termination). For a backup, cron a nightly sync to S3:

```bash
# crontab on the instance (needs an IAM role with s3:PutObject)
0 3 * * * aws s3 cp /var/lib/maze/maze-runs.jsonl s3://your-bucket/maze/$(date +\%F).jsonl
```

**Updating the collector** later: `cd /opt/neo && sudo git pull && sudo systemctl restart maze-collector`.

> Prefer fully serverless/AWS-native (no instance to manage)? That path is
> Lambda + API Gateway + DynamoDB or S3 instead of the JSONL file - it needs a
> small rewrite of `/collect`. Ask and it can be built.

## Connect the frontend (AWS Amplify)

Amplify hosts the static site; it does **not** run the collector (deploy that on
EC2, above). To make the site send consented runs to your collector, give
Amplify the collector URL as a **build-time** env var. Vite bakes `VITE_`
variables into the bundle when it builds, so this is set once in the console and
takes effect on the next deploy:

1. Amplify console -> your app -> **Hosting -> Environment variables** -> add
   `VITE_MAZE_COLLECTOR = https://collector.neognathae.com/collect`
2. **Redeploy** (Redeploy this version, or push a commit).

Vite picks up `VITE_`-prefixed vars from the build environment automatically. If
it ever fails to bake in (a known Amplify quirk for some setups), make it
explicit in **App settings -> Build settings** by writing it to `.env` before the
build:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - echo "VITE_MAZE_COLLECTOR=$VITE_MAZE_COLLECTOR" > .env
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files: ['**/*']
  cache:
    paths: ['node_modules/**/*']
```

**CORS.** Set the collector's `CORS_ORIGIN` to your Amplify site origin (your
custom domain like `https://neognathae.com`, or the default
`https://<branch>.<appid>.amplifyapp.com`). Because the browser sends runs as a
CORS "simple request", collection works even if `CORS_ORIGIN` is left at `*` or
mismatched - setting it is hygiene, not required for data to flow.

**Verify:** open the live site, play the maze, press **Agree**, solve a level,
then `curl https://collector.neognathae.com/health` (the `count` should rise),
or watch the `POST /collect` in the browser Network tab.

> SPA note (unrelated to the collector): this site uses path routing
> (`/kestrel`, `/maze`...). On Amplify add a rewrite rule -- source
> `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff2?|json)$)([^.]+$)/>`,
> target `/index.html`, type `200 (Rewrite)` -- so refreshing a deep link
> doesn't 404.
