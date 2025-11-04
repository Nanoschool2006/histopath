# 🚀 Deployment Guide - Enhanced Histopathology Platform

This guide covers multiple deployment options for the enhanced histopathology platform.

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- Google Gemini API key
- Git repository access

## 🏗️ Build Configuration

The application is already configured with:
- ✅ Production-optimized Angular build
- ✅ TailwindCSS for styling
- ✅ TypeScript compilation
- ✅ Bundle optimization (680KB production build)

## 🌐 Deployment Options

### 1. Vercel (Recommended for Static Sites)

#### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nanoschool2006/histopath)

#### Manual Setup
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Environment Variables:**
- `GEMINI_API_KEY`: Your Google Gemini API key

### 2. Netlify

#### Quick Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Nanoschool2006/histopath)

#### Manual Setup
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### 3. Docker Deployment

#### Build Docker Image
```bash
docker build -t histopath-enhanced .
docker run -p 80:80 histopath-enhanced
```

#### Using Docker Compose
```bash
docker-compose up -d
```

### 4. Traditional Web Server (Apache/Nginx)

#### Build for Production
```bash
npm run build
```

#### Copy dist/ folder to web server
```bash
# Example for nginx
sudo cp -r dist/* /var/www/html/
```

### 5. GitHub Pages

#### Enable GitHub Pages
1. Go to repository Settings
2. Navigate to Pages section
3. Select source: GitHub Actions
4. The CI/CD pipeline will handle deployment

### 6. AWS S3 + CloudFront

#### Upload to S3
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

#### Configure CloudFront for SPA routing

### 7. Google Cloud Platform

#### Deploy to Cloud Run
```bash
gcloud run deploy histopath-enhanced \
  --source . \
  --platform managed \
  --region us-central1
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Google AI Integration
GEMINI_API_KEY=your-gemini-api-key

# Application Settings
NODE_ENV=production
APP_NAME=Enhanced Histopath Platform
```

### Optional Environment Variables

```bash
# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Database (if backend added)
DATABASE_URL=your-database-url

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

## 🔒 Security Considerations

### HTTPS Configuration
- Always use HTTPS in production
- Configure SSL certificates
- Update Content Security Policy

### API Key Security
- Store API keys in environment variables
- Use secret management services
- Rotate keys regularly

### Access Control
- Configure CORS properly
- Implement rate limiting
- Use security headers

## 📊 Performance Optimization

### Implemented Optimizations
- ✅ Tree shaking and code splitting
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ Lazy loading components
- ✅ Optimized bundle size (680KB)

### Additional Optimizations
- Enable CDN for static assets
- Implement service worker for offline support
- Use HTTP/2 server push
- Optimize images and fonts

## 🚦 Health Checks

### Application Health Endpoints
- `/health` - Basic health check
- `/api/health` - API health check (if backend added)

### Monitoring
- Application logs
- Error tracking (Sentry integration ready)
- Performance monitoring
- User analytics

## 🔄 CI/CD Pipeline

The repository includes GitHub Actions workflow that:
- ✅ Builds application on push
- ✅ Runs security audit
- ✅ Deploys to multiple platforms
- ✅ Creates Docker images
- ✅ Handles environment variables

## 📱 Platform-Specific Notes

### Vercel
- Automatic deployments from Git
- Built-in CDN and edge functions
- Perfect for static SPAs

### Netlify
- Form handling capabilities
- Built-in A/B testing
- Excellent for JAMstack apps

### Docker
- Consistent environment
- Easy scaling with Kubernetes
- Good for complex deployments

### Traditional Hosting
- Full server control
- Custom configurations
- Good for enterprise environments

## 🆘 Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version (20+ required)
- Verify all dependencies installed
- Check TypeScript configuration

**Runtime Errors:**
- Verify API keys are set
- Check CORS configuration
- Monitor console logs

**Performance Issues:**
- Enable gzip compression
- Configure caching headers
- Optimize image sizes

## 📞 Support

For deployment issues:
1. Check the build logs
2. Verify environment variables
3. Test locally first
4. Check platform-specific documentation

---

🎊 **Your enhanced histopathology platform is now deployment-ready across multiple platforms!**