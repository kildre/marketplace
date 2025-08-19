# Local Frontend Docker Deployment Guide

This guide explains how to deploy the Advana Marketplace frontend container locally using Docker Desktop. It covers prerequisites, step-by-step instructions, and tips for faster builds.

---

## Prerequisites

- **Docker Desktop** installed on your machine ([Download here](https://www.docker.com/products/docker-desktop/)).
- **Kubernetes enabled in Docker Desktop**:
  - Open Docker Desktop.
  - Go to **Settings > Kubernetes**.
  - Check **Enable Kubernetes** and apply changes. Wait for Kubernetes to finish starting (the status will show "Running").
- **Sufficient disk space and memory** for building and running containers.

---

## Structure

- `Dockerfile.local`: Builds the frontend React app and serves it with Nginx.
- `docker-compose.yml`: Defines the frontend service, ports, environment variables, and healthcheck.
- `nginx.conf.full`: Nginx configuration for serving the built app.
- `frontend/`: Source code for the React frontend.

---

## Step-by-Step Deployment

### 1. Build the Frontend Docker Image

Open a terminal in the project root (`c:\Repos\advana-marketplace`) and run:

```powershell
# Build the Docker image for the frontend. Make sure to include the period with the space at the end of the command.
$ docker build -f Dockerfile.local --no-cache -t advana-marketplace-frontend:local .
```

- **Fresh build** (first time or after major changes): _2-5 minutes_
- **Cached build** (subsequent builds with no major changes): _10-30 seconds_

### 2. Start the Frontend Container

```powershell
# Start the container and expose port 8080
$ docker compose -f docker-compose.yml up
```

- **Fresh compose** (first time): _30-60 seconds_.
- **Cached compose** (container previously started): _5-10 seconds_.

The container will:

- Build the React app.
- Serve static files via Nginx on port **8080**.
- Run a healthcheck to ensure the service is up.

### 3. Access the Frontend

Open your browser and go to:

```
http://localhost:8080
```

You should see the Advana Marketplace frontend running locally.

---

## Troubleshooting

- **Build errors**: Check the terminal output for missing dependencies or permission issues.
- **Port conflicts**: Ensure port 8080 is not in use by another process.
- **Kubernetes not running**: Make sure Kubernetes is enabled and running in Docker Desktop.
- **Healthcheck failures**: The container uses `nc` to check port 8080. If the healthcheck fails, check Nginx logs inside the container.
- **Docker build cache errors:** If you see errors about missing image layers, run `docker system prune -a` and follow the steps above to rebuild and recompose.

---

## Notes

- The container runs as a non-root user for security.
- Environment variables (see `docker-compose.yml`) can be adjusted for local development needs.
- The build process removes vulnerable packages (e.g., TIFF) for security compliance.
- For advanced configuration, edit `nginx.conf.full` or the Dockerfile as needed.

---

## Additional Resources

- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [Kubernetes in Docker Desktop](https://docs.docker.com/desktop/kubernetes/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

If you encounter issues not covered here, please reach out to Eric Fernald or check the logs for more details.
