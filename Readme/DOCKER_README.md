# Financial Advisor - Docker Setup

This directory contains all the necessary Docker files to run the Financial Advisor application in a containerized environment.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 1. Environment Setup
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your actual values
nano .env
```

### 2. Production Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 3. Development Setup
```bash
# Start development environment with hot reloading
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

## 📁 File Structure

```
docker/
├── Dockerfile.client          # Production React client
├── Dockerfile.client.dev      # Development React client
├── Dockerfile.server          # Production Node.js server
├── Dockerfile.server.dev      # Development Node.js server
├── docker-compose.yml         # Production services
├── docker-compose.dev.yml     # Development services
├── nginx.conf                 # Nginx reverse proxy config
├── mongo-init.js              # MongoDB initialization script
├── env.example                # Environment variables template
└── README.md                  # This file
```

## 🔧 Services

### Production Services
- **MongoDB**: Database (port 27017)
- **Server**: Node.js API server (port 8080)
- **Client**: React frontend (port 3000)
- **Nginx**: Reverse proxy (port 80/443)

### Development Services
- **MongoDB**: Database (port 27017)
- **Server**: Node.js API server with hot reload (port 8080)
- **Client**: React frontend with hot reload (port 3000)

## 🌐 Access Points

### Production
- Frontend: http://localhost:80 (via Nginx)
- Backend API: http://localhost:8080
- MongoDB: localhost:27017

### Development
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MongoDB: localhost:27017

## 🔐 Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Required variables
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🛠️ Useful Commands

### Container Management
```bash
# View running containers
docker ps

# View logs for specific service
docker-compose logs server
docker-compose logs client
docker-compose logs mongodb

# Restart a specific service
docker-compose restart server

# Rebuild and restart services
docker-compose up -d --build
```

### Database Management
```bash
# Access MongoDB shell
docker exec -it financial-advisor-mongodb mongosh

# Backup database
docker exec financial-advisor-mongodb mongodump --out /data/backup

# Restore database
docker exec financial-advisor-mongodb mongorestore /data/backup
```

### Development Commands
```bash
# Install new npm packages in client
docker exec -it financial-advisor-client-dev npm install package-name

# Install new npm packages in server
docker exec -it financial-advisor-server-dev npm install package-name

# Run tests in client
docker exec -it financial-advisor-client-dev npm test

# Run tests in server
docker exec -it financial-advisor-server-dev npm test
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **MongoDB connection issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Build failures**
   ```bash
   # Clean up Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Health Checks
```bash
# Check if all services are healthy
curl http://localhost/health

# Check individual services
curl http://localhost:3000
curl http://localhost:8080/health
```

## 📝 Notes

- The development setup includes hot reloading for both client and server
- MongoDB data is persisted in Docker volumes
- Upload files are stored in a separate volume
- Nginx provides SSL termination and load balancing (configure SSL certificates for production)
- All services are connected through a custom Docker network

## 🚀 Production Deployment

For production deployment, consider:

1. Using a proper domain name
2. Setting up SSL certificates
3. Configuring environment variables securely
4. Setting up monitoring and logging
5. Using a production-grade MongoDB setup
6. Implementing proper backup strategies

## 📞 Support

If you encounter any issues, check the logs first:
```bash
docker-compose logs -f
```

For more detailed debugging, you can access the containers directly:
```bash
docker exec -it financial-advisor-server bash
docker exec -it financial-advisor-client sh
```
