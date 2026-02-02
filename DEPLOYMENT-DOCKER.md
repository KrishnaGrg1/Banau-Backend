# Docker Deployment Guide - Banau

This guide covers deploying the Banau application using Docker containers.

## 🐳 Quick Start with Docker Compose

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo>
cd banau
```

2. **Set up environment variables**
```bash
# Create .env file in root (for local development)
cp .env.example .env
```

3. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend on port 3000

4. **View logs**
```bash
docker-compose logs -f
```

5. **Stop services**
```bash
docker-compose down
```

---

## 🚀 Production Deployment

### Option 1: Docker Hub + Cloud VM (AWS EC2, DigitalOcean, etc.)

#### Step 1: Build and Push Images

```bash
# Login to Docker Hub
docker login

# Build and tag backend
docker build -t your-username/banau-backend:latest -f apps/backend/Dockerfile .
docker push your-username/banau-backend:latest

# Build and tag frontend
docker build -t your-username/banau-frontend:latest \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  -f apps/frontend/Dockerfile .
docker push your-username/banau-frontend:latest
```

#### Step 2: Deploy on Server

1. **SSH into your server**
```bash
ssh user@your-server-ip
```

2. **Install Docker and Docker Compose**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin
```

3. **Create production docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: banau
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    image: your-username/banau-backend:latest
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/banau
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      NODE_ENV: production
    ports:
      - "3001:3000"
    depends_on:
      - postgres
    restart: always

  frontend:
    image: your-username/banau-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

4. **Create .env file**
```bash
cat > .env << EOF
DB_USER=banau_user
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 48)
EOF
```

5. **Start services**
```bash
docker-compose up -d
```

---

### Option 2: AWS ECS (Elastic Container Service)

1. **Push images to ECR**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name banau-backend
aws ecr create-repository --repository-name banau-frontend

# Tag and push
docker tag banau-backend:latest your-account.dkr.ecr.us-east-1.amazonaws.com/banau-backend:latest
docker tag banau-frontend:latest your-account.dkr.ecr.us-east-1.amazonaws.com/banau-frontend:latest

docker push your-account.dkr.ecr.us-east-1.amazonaws.com/banau-backend:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/banau-frontend:latest
```

2. **Create ECS Task Definitions and Services** via AWS Console or AWS CLI

---

### Option 3: Google Cloud Run

```bash
# Setup
gcloud auth login
gcloud config set project your-project-id

# Build and deploy backend
gcloud builds submit --tag gcr.io/your-project-id/banau-backend apps/backend
gcloud run deploy banau-backend \
  --image gcr.io/your-project-id/banau-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET

# Build and deploy frontend
gcloud builds submit --tag gcr.io/your-project-id/banau-frontend apps/frontend
gcloud run deploy banau-frontend \
  --image gcr.io/your-project-id/banau-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

### Option 4: Azure Container Instances

```bash
# Login to Azure
az login

# Create resource group
az group create --name banau-rg --location eastus

# Create container registry
az acr create --resource-group banau-rg --name banauregistry --sku Basic

# Login to ACR
az acr login --name banauregistry

# Tag and push images
docker tag banau-backend:latest banauregistry.azurecr.io/banau-backend:latest
docker tag banau-frontend:latest banauregistry.azurecr.io/banau-frontend:latest

docker push banauregistry.azurecr.io/banau-backend:latest
docker push banauregistry.azurecr.io/banau-frontend:latest

# Deploy containers
az container create \
  --resource-group banau-rg \
  --name banau-backend \
  --image banauregistry.azurecr.io/banau-backend:latest \
  --dns-name-label banau-backend \
  --ports 3000 \
  --environment-variables DATABASE_URL=$DATABASE_URL JWT_SECRET=$JWT_SECRET
```

---

### Option 5: Kubernetes (K8s)

See [kubernetes/README.md](./kubernetes/README.md) for detailed Kubernetes deployment instructions.

Basic example:
```bash
# Apply configurations
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/backend.yaml
kubectl apply -f kubernetes/frontend.yaml
kubectl apply -f kubernetes/ingress.yaml
```

---

## 🗄️ Database Setup

### Using Managed Database (Recommended for Production)

Instead of running PostgreSQL in a container, use a managed service:

- **Neon** (Recommended): https://neon.tech
- **Supabase**: https://supabase.com
- **AWS RDS**: PostgreSQL instance
- **Google Cloud SQL**: PostgreSQL instance
- **Azure Database**: PostgreSQL

Update your `DATABASE_URL` environment variable to point to the managed database.

---

## 🔧 Environment Variables

### Backend
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
```

### Frontend
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 📊 Monitoring and Logs

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# With timestamps
docker-compose logs -f -t backend
```

### Container stats
```bash
docker stats
```

---

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: apps/backend/Dockerfile
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/banau-backend:latest
      
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: apps/frontend/Dockerfile
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/banau-frontend:latest
          build-args: |
            VITE_API_URL=${{ secrets.API_URL }}
```

---

## 🛠️ Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Restart service
docker-compose restart backend

# Rebuild
docker-compose up -d --build backend
```

### Database connection issues
```bash
# Check if postgres is running
docker-compose ps

# Test connection
docker-compose exec postgres psql -U postgres -d banau
```

### Clear everything and start fresh
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 🔐 Security Best Practices

1. **Never commit .env files** - Use secrets management
2. **Use strong passwords** - Generate with `openssl rand -base64 32`
3. **Update base images regularly** - `docker pull node:18-alpine`
4. **Scan for vulnerabilities** - `docker scan your-image`
5. **Use non-root users** in production Dockerfiles
6. **Limit container resources** - Set memory and CPU limits
7. **Use HTTPS** - Set up SSL/TLS with Let's Encrypt or cloud provider

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices for Node.js in Docker](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Multi-stage Docker Builds](https://docs.docker.com/build/building/multi-stage/)
