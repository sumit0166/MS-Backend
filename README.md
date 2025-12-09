# Backend Service (MS-Backend)

A small Node.js backend service that connects to MongoDB and exposes product, IAM and health endpoints.

**Project Structure**
- **`backendServer.js`**: Application entrypoint (Express app).
- **`Dockerfile`**: Docker image definition used to build container image.
- **`bin/`**: Helper scripts for local/container execution:
  - `installDep.sh` — ensures npm dependencies from `package.json` are installed.
  - `Run.sh` — starts the Node process (`backendServer.js`).
  - `Shutdown.sh` — stops the running Node process.
- **`components/`**: Application logic and sub-folders:
  - `controllers/` — controller handlers (e.g. `auth.js`, `product.js`, `registerMs.js`, etc.).
  - `routers/` — Express route modules (`products`, `iam`, `health`, `handleMsDetails`).
  - `middleware/` — request logging and CORS (`trafficAuth.js`).
  - `modals/` — Mongoose models (`msDetails.js`, `products.js`, `users.js`).
  - `logger.js` — logging utilities.
  - `prodcuts.json` — sample product data (note: spelling preserved as in repo).
- **`configuration/`**: Runtime configuration and defaults:
  - `appConfig.json` — server port, DB defaults, CORS and logging config.
  - `defaultUser.json` — default user payload used by the app.
- **`k8s/`**: Kubernetes manifests (ConfigMap, Secret, Deployments, Services).
- **`logs/`**: Log files (as configured in `appConfig.json`).

Ignored items (per your request): `tmp/`, `old.js`, `test.js`.

**Dockerfile**
- Base image: `node:22.14.0`.
- Copies `bin`, `components`, `configuration`, `package.json` and `backendServer.js`.
- Runs `chmod 777 ./installDep.sh` and executes `./installDep.sh` during build.
- Exposes port `8082` and runs `CMD ["bash", "Run.sh"]` (the `Run.sh` script starts the app).

Build and run (example):

```bash
# Build image (adjust tag as needed)
docker build -t sumitsakpal/admin-backend:1.0.0 .

# Run container (override envs as needed)
docker run -e DB_HOST=mongo-service -e DB_USER=admin -e DB_PASSWD=admin -p 8082:8082 --name backend svc sumitsakpal/admin-backend:1.0.0
```

Note: The container's `Run.sh` expects Node available and runs `backendServer.js` from the app folder (it `cd ..` from `bin`).

**Bin scripts (local use)**
- Install dependencies:

```bash
bash bin/installDep.sh
```

- Start the server:

```bash
bash bin/Run.sh
```

- Stop the server:

```bash
bash bin/Shutdown.sh
```

`installDep.sh` and `Run.sh` both inspect `package.json` for dependencies and will attempt to `npm install` missing packages.

**Configuration**
- Primary config file: `configuration/appConfig.json` which contains keys such as:
  - `serverPort` (default 8082)
  - `dbHost`, `port` (MongoDB port), `dbName`, `dbUser`, `dbPassword`
  - `version`, `sesionTimeout`, `corsPolicy` and `logs` settings
- Environment variables override config values at runtime in `backendServer.js`:
  - `DB_HOST` -> overrides `dbHost`
  - `DB_USER` -> overrides `dbUser`
  - `DB_PASSWD` -> overrides `dbPassword`

**Kubernetes manifests** (`k8s/`)
- `configMap.yaml` — defines `DB_HOST` as `mongo-service` and a `BACKEND` URL.
- `mongo-secret.yaml` — contains base64 encoded `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` (currently set to `admin`/`admin` in base64).
- `mongo-deployment.yaml` — Deployment + Service for MongoDB. Uses secret for credentials.
- `backend-deployment.yaml` — Deployment + Service for the backend. It:
  - Uses image `sumitsakpal/admin-backend:1.0.0` (replace with your image/tag if different).
  - Reads `DB_HOST` from `app-config` ConfigMap and DB credentials from `mongo-secret`.

Apply manifests (example):

```bash
kubectl apply -f k8s/configMap.yaml
kubectl apply -f k8s/mongo-secret.yaml
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
```

Be sure to update the backend image name or push the built image to a container registry accessible by your cluster before applying.

**How the app connects to MongoDB**
- At startup `backendServer.js` constructs the MongoDB connection string from environment variables or `appConfig.json`:
  - `DB_URL = 'mongodb://' + DB_USER + ':' + DB_PASSWD + '@' + DB_HOST + ':' + port + '/' + dbName + '?authSource=admin'`
- In Kubernetes, `DB_HOST` is provided by the `app-config` ConfigMap and credentials are provided by `mongo-secret`.

**Static files / Images**
- The app exposes images on the `/images` route and serves static files from the container path `/imgs` (`app.use('/images', express.static('/imgs'))`). If you want to serve images from the host, mount a volume to `/imgs` in the container.

**Logging**
- Logging config in `appConfig.json` uses `logs/%DATE%.log` with rotation settings. Logs will be written into the `logs/` folder if the process has write access.

**Notes & Recommendations**
- Validate and rotate the credentials in `k8s/mongo-secret.yaml` if you deploy to production (do not commit real secrets).
- The `Dockerfile` runs `installDep.sh` during image build which calls `npm install` — for reproducibility you may want to `npm ci` and copy a `package-lock.json`.
- `Run.sh` uses `jq` to parse `package.json` and expects `node` to be available in the environment; the Docker image provides it but local hosts must have Node installed.

**Maintainer**
- Author: `sumit sakpal`.

---
