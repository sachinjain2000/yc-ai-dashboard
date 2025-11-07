# Docker Deployment Guide

This guide explains how to build and deploy the YC AI Dashboard using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)

## Quick Start

### Using Docker Compose (Recommended)

The easiest way to run the application:

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the container
- Expose the application on port 3000
- Enable automatic restart

Access the dashboard at: `http://localhost:3000`

To stop the application:

```bash
docker-compose down
```

### Using Docker CLI

#### Build the Image

```bash
docker build -t yc-ai-dashboard .
```

#### Run the Container

```bash
docker run -d \
  --name yc-ai-dashboard \
  -p 3000:3000 \
  -e NODE_ENV=production \
  yc-ai-dashboard
```

#### Stop the Container

```bash
docker stop yc-ai-dashboard
docker rm yc-ai-dashboard
```

## Dockerfile Architecture

The Dockerfile follows **multi-stage build** best practices:

### Stage 1: Builder
- Uses `node:22-alpine` as base image for minimal size
- Installs pnpm package manager
- Installs all dependencies (including dev dependencies)
- Builds the application

### Stage 2: Production
- Uses `node:22-alpine` for the final image
- Copies only production dependencies
- Copies built artifacts from builder stage
- Results in a smaller, optimized production image

## Best Practices Implemented

1. **Multi-stage builds**: Separates build and runtime environments
2. **Layer caching**: Optimized layer order for faster rebuilds
3. **Minimal base image**: Uses Alpine Linux for smaller image size
4. **.dockerignore**: Excludes unnecessary files from build context
5. **Production dependencies only**: Final image contains only runtime dependencies
6. **Health checks**: Docker Compose includes health monitoring
7. **Restart policy**: Automatic container restart on failure

## Environment Variables

The following environment variables can be configured:

- `NODE_ENV`: Set to `production` for production deployments
- `PORT`: Application port (default: 3000)

Example with custom environment variables:

```bash
docker run -d \
  --name yc-ai-dashboard \
  -p 8080:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  yc-ai-dashboard
```

## Monitoring and Logs

### View Container Logs

```bash
docker logs yc-ai-dashboard
```

### Follow Logs in Real-time

```bash
docker logs -f yc-ai-dashboard
```

### Check Container Status

```bash
docker ps
```

### Check Health Status

```bash
docker inspect --format='{{json .State.Health}}' yc-ai-dashboard
```

## Troubleshooting

### Container won't start

Check logs for errors:
```bash
docker logs yc-ai-dashboard
```

### Port already in use

Change the host port in docker-compose.yml or use a different port:
```bash
docker run -d -p 8080:3000 yc-ai-dashboard
```

### Build fails

Ensure you have enough disk space and memory:
```bash
docker system df
docker system prune
```

## Production Deployment

For production deployments, consider:

1. **Use a reverse proxy** (nginx, Traefik) for SSL/TLS termination
2. **Set up monitoring** (Prometheus, Grafana)
3. **Configure log aggregation** (ELK stack, Loki)
4. **Use orchestration** (Kubernetes, Docker Swarm) for scaling
5. **Implement CI/CD** for automated deployments

## Security Considerations

1. Run container as non-root user (already implemented with node user)
2. Scan images for vulnerabilities regularly
3. Keep base images updated
4. Use secrets management for sensitive data
5. Limit container resources (CPU, memory)

## Performance Optimization

The current setup includes:
- Minimal Alpine-based images
- Multi-stage builds to reduce image size
- Production-only dependencies in final image
- Optimized layer caching for faster builds

Expected image size: ~200-300MB (compared to 1GB+ without optimization)

## Support

For issues or questions, please refer to the main README.md or open an issue in the repository.

