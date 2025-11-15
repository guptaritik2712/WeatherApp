# WeatherApp - ArgoCD Deployment Guide

This guide will help you deploy the WeatherApp to your Kubernetes cluster using ArgoCD.

## Prerequisites

- Kubernetes cluster (already running)
- ArgoCD installed on the cluster
- kubectl configured to access your cluster
- Docker Hub account (guptaritik2712)
- Git repository for this project

## Project Structure

```
WeatherApp/
├── app.js
├── index.html
├── style.css
├── Dockerfile
├── docker-compose.yml
├── images/
├── k8s/
│   ├── namespace.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── argocd-application.yaml
```

## Deployment Steps

### 1. Build and Push Docker Image

```powershell
# Build the Docker image
docker build -t guptaritik2712/weather-app:latest .

# Login to Docker Hub
docker login

# Push the image to Docker Hub
docker push guptaritik2712/weather-app:latest
```

### 2. Push Code to GitHub

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Add Kubernetes manifests and ArgoCD configuration"

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/guptaritik2712/WeatherApp.git

# Push to main branch
git push -u origin main
```

### 3. Deploy using ArgoCD

```powershell
# Apply the ArgoCD Application manifest
kubectl apply -f argocd-application.yaml

# Check ArgoCD application status
kubectl get applications -n argocd

# Watch the sync status
kubectl get app weather-app -n argocd -w
```

### 4. Verify Deployment

```powershell
# Check pods in weather-app namespace
kubectl get pods -n weather-app

# Check service
kubectl get svc -n weather-app

# Get the LoadBalancer external IP
kubectl get svc weather-app-service -n weather-app
```

### 5. Access the Application

Once the LoadBalancer has an external IP, access your weather app at:
```
http://<EXTERNAL-IP>
```

## ArgoCD UI Access

To view your application in ArgoCD UI:

```powershell
# Get ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port-forward to access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access ArgoCD at: https://localhost:8080
# Username: admin
# Password: (from the command above)
```

## Configuration Details

### ArgoCD Application Spec

- **Auto-sync enabled**: Changes in Git will automatically sync to the cluster
- **Self-heal enabled**: ArgoCD will automatically revert manual changes
- **Prune enabled**: Deleted resources in Git will be removed from the cluster
- **Namespace creation**: Automatically creates the `weather-app` namespace

### Kubernetes Resources

- **Namespace**: `weather-app`
- **Deployment**: 2 replicas with resource limits
- **Service**: LoadBalancer type on port 80

## Troubleshooting

### Check ArgoCD Application Status
```powershell
kubectl describe application weather-app -n argocd
```

### View Application Logs
```powershell
kubectl logs -n weather-app -l app=weather-app
```

### Sync Manually (if needed)
```powershell
argocd app sync weather-app
```

### Delete and Redeploy
```powershell
kubectl delete -f argocd-application.yaml
kubectl apply -f argocd-application.yaml
```

## Update Strategy

To update the application:
1. Make changes to your code
2. Build and push new Docker image with a version tag
3. Update `k8s/deployment.yaml` with the new image tag
4. Commit and push to Git
5. ArgoCD will automatically sync the changes

## Notes

- The application uses the OpenWeatherMap API
- API key is embedded in `app.js` (consider using ConfigMaps/Secrets for production)
- Service type is LoadBalancer (change to NodePort or Ingress if needed)
