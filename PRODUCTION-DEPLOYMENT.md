# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run `PRODUCTION-DATABASE-OPTIMIZATION.sql` in Supabase SQL Editor
- [ ] Verify all indexes are created successfully
- [ ] Configure connection pooling in Supabase Dashboard
- [ ] Test database health endpoint: `/api/health`

### 2. Environment Variables
Ensure all required environment variables are set in production:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional but recommended
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Performance Verification
- [ ] Test rate limiting: Make 100+ requests to `/api/listings`
- [ ] Verify caching headers are present in responses
- [ ] Check pagination works correctly
- [ ] Test health check endpoint returns healthy status

### 4. Security Verification
- [ ] Verify security headers are present (check browser dev tools)
- [ ] Test RLS policies prevent unauthorized access
- [ ] Verify rate limiting blocks excessive requests
- [ ] Check error messages don't leak sensitive information

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure environment variables
   - Deploy

3. **Configure Domain** (Optional)
   - Add custom domain in Vercel dashboard
   - Update DNS records

### Option 2: Manual Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Test Production Build Locally**
   ```bash
   npm start
   ```

3. **Deploy to your hosting provider**

## Post-Deployment

### 1. Monitoring Setup

**Health Checks**
- Set up automated health checks hitting `/api/health`
- Monitor database response times
- Alert if status becomes "unhealthy"

**Key Metrics to Monitor**
- API response times (check `X-Response-Time` header)
- Error rates (4xx, 5xx responses)
- Cache hit rates (check `X-Cache` header)
- Rate limit violations (429 responses)
- Database connection count

### 2. Performance Monitoring

**Using Browser DevTools**
1. Open Network tab
2. Check for:
   - `X-Response-Time` header (should be < 500ms)
   - `X-Cache` header (HIT/MISS)
   - `X-RateLimit-Remaining` header

**Using Supabase Dashboard**
1. Go to Database > Query Performance
2. Monitor slow queries
3. Check connection pool usage

### 3. Error Tracking (Optional)

**Integrate Sentry** (Recommended)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Then update `components/ErrorBoundary.tsx` to send errors to Sentry.

## Load Testing

### Basic Load Test with curl
```bash
# Test rate limiting
for i in {1..150}; do
  curl -w "%{http_code}\n" http://localhost:3000/api/listings -o /dev/null -s
done
# Should see 429 responses after 100 requests
```

### Advanced Load Testing with Artillery
```bash
npm install -g artillery

# Create test-load.yml
artillery quick --count 100 --num 10 http://localhost:3000/api/listings
```

## Rollback Procedure

If issues occur after deployment:

1. **Immediate Rollback** (Vercel)
   - Go to Vercel Dashboard > Deployments
   - Click on previous working deployment
   - Click "Promote to Production"

2. **Database Rollback** (if needed)
   - Indexes can be dropped safely if causing issues
   - RLS policies can be reverted to previous version

## Scaling Considerations

### When to Scale

Monitor these metrics:
- **Response time > 1s**: Consider database optimization or caching
- **Rate limit hits increasing**: Adjust rate limits or add more capacity
- **Database connections maxed**: Increase connection pool size
- **Memory usage high**: Optimize queries or increase server resources

### Scaling Options

1. **Vertical Scaling**
   - Upgrade Supabase plan for more connections
   - Increase Vercel function memory/timeout

2. **Horizontal Scaling**
   - Vercel automatically scales serverless functions
   - Consider Redis for distributed caching (future enhancement)

3. **Database Optimization**
   - Add more specific indexes for slow queries
   - Use materialized views for complex aggregations
   - Consider read replicas for high read loads

## Troubleshooting

### High Response Times
1. Check `/api/health` for database issues
2. Review slow queries in Supabase dashboard
3. Verify indexes are being used (check query plans)

### Rate Limit Issues
1. Check `X-RateLimit-Remaining` headers
2. Adjust limits in `lib/rate-limiter.ts` if needed
3. Consider implementing user-based rate limiting

### Database Connection Errors
1. Check connection pool settings in Supabase
2. Verify RLS policies aren't causing deadlocks
3. Monitor active connections in Supabase dashboard

### Cache Not Working
1. Verify cache headers in responses
2. Check cache statistics: Monitor cache hit rates
3. Ensure cache TTL is appropriate for your use case

## Support

For issues or questions:
1. Check application logs in Vercel dashboard
2. Review Supabase logs for database errors
3. Test locally with production environment variables
4. Check health endpoint for system status

## Maintenance

### Regular Tasks
- **Weekly**: Review slow queries and optimize
- **Monthly**: Analyze database and update statistics
- **Quarterly**: Review and adjust rate limits based on usage
- **As needed**: Update dependencies and security patches
