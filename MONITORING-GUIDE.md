# Monitoring Guide for TradeHub Production

## Overview

This guide covers key metrics to monitor, alert thresholds, and troubleshooting procedures for TradeHub in production.

## Key Metrics to Monitor

### 1. API Performance

**Response Times**
- **Metric**: `X-Response-Time` header
- **Target**: < 500ms for 95th percentile
- **Warning**: > 500ms
- **Critical**: > 1000ms

**How to Monitor**:
```bash
# Check response time for listings endpoint
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com/api/listings

# curl-format.txt content:
time_total: %{time_total}s
```

**Cache Performance**
- **Metric**: `X-Cache` header (HIT/MISS)
- **Target**: > 60% cache hit rate
- **Warning**: < 40% cache hit rate

### 2. Rate Limiting

**Rate Limit Status**
- **Metric**: `X-RateLimit-Remaining` header
- **Monitor**: 429 response count
- **Alert**: If 429 responses > 5% of total requests

**How to Check**:
```bash
# Monitor rate limit headers
curl -I https://yourdomain.com/api/listings | grep RateLimit
```

### 3. Database Health

**Connection Count**
- **Target**: < 80% of max connections
- **Warning**: > 80% of max connections
- **Critical**: > 95% of max connections

**Query Performance**
- **Target**: Average query time < 100ms
- **Warning**: > 200ms
- **Critical**: > 500ms

**How to Monitor**:
1. Check health endpoint: `GET /api/health`
2. Review Supabase Dashboard > Database > Query Performance
3. Run slow query check:
   ```sql
   SELECT * FROM slow_queries;
   ```

### 4. Error Rates

**HTTP Status Codes**
- **2xx**: Should be > 95% of requests
- **4xx**: Should be < 3% (mostly 404s)
- **5xx**: Should be < 1%

**Alert Thresholds**:
- Warning: 5xx > 1% of requests
- Critical: 5xx > 5% of requests

### 5. System Resources

**Memory Usage** (Vercel Functions)
- **Target**: < 70% of allocated memory
- **Warning**: > 80%
- **Critical**: > 90%

**Function Duration** (Vercel)
- **Target**: < 5 seconds
- **Warning**: > 8 seconds
- **Critical**: Approaching timeout (10s)

## Monitoring Setup

### 1. Health Check Monitoring

Set up automated health checks using a service like:
- **UptimeRobot** (Free tier available)
- **Pingdom**
- **Better Uptime**

**Configuration**:
```
URL: https://yourdomain.com/api/health
Interval: 5 minutes
Timeout: 10 seconds
Alert on: Status code != 200 or response time > 2000ms
```

### 2. Supabase Dashboard Monitoring

**Daily Checks**:
1. Go to Supabase Dashboard > Database
2. Check "Query Performance" tab
3. Review slow queries (> 100ms)
4. Monitor connection pool usage

**Weekly Checks**:
1. Review table sizes: `SELECT * FROM table_sizes;`
2. Check for missing indexes on new queries
3. Review and optimize slow queries

### 3. Vercel Analytics (If using Vercel)

**Enable Analytics**:
1. Go to Vercel Dashboard > Your Project > Analytics
2. Enable Web Analytics
3. Monitor:
   - Page load times
   - Core Web Vitals
   - Geographic distribution

### 4. Custom Monitoring Dashboard

Create a simple monitoring page (optional):

```typescript
// app/admin/monitoring/page.tsx
export default async function MonitoringPage() {
  const health = await fetch('/api/health').then(r => r.json())
  const stats = await fetch('/api/metrics').then(r => r.json())
  
  return (
    <div>
      <h1>System Health</h1>
      <div>Database: {health.checks.database.status}</div>
      <div>Response Time: {health.checks.api.responseTime}ms</div>
      {/* Add more metrics */}
    </div>
  )
}
```

## Alert Thresholds

### Critical Alerts (Immediate Action Required)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Health endpoint down | 3 consecutive failures | Check database connection, review logs |
| Database response time | > 2000ms | Check slow queries, verify indexes |
| 5xx error rate | > 5% | Review error logs, check recent deployments |
| Database connections | > 95% of max | Increase connection pool or optimize queries |

### Warning Alerts (Action Within 1 Hour)

| Metric | Threshold | Action |
|--------|-----------|--------|
| API response time | > 1000ms | Review slow endpoints, check caching |
| Cache hit rate | < 40% | Review cache TTL settings, check cache size |
| 4xx error rate | > 10% | Check for broken links or API changes |
| Rate limit hits | > 100/hour | Review rate limits, check for abuse |

## Troubleshooting Guide

### High Response Times

**Symptoms**: `X-Response-Time` > 1000ms

**Diagnosis**:
1. Check `/api/health` for database issues
2. Review Supabase slow queries
3. Check cache hit rate

**Solutions**:
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE SELECT * FROM listings WHERE category = 'Electronics';

-- If not using index, create one
CREATE INDEX idx_listings_category ON listings(category);

-- Update statistics
ANALYZE listings;
```

### Database Connection Errors

**Symptoms**: "too many connections" errors

**Diagnosis**:
1. Check current connections in Supabase
2. Review connection pool settings

**Solutions**:
1. Increase max_connections in Supabase settings
2. Optimize queries to reduce connection time
3. Implement connection pooling (already configured)

### High Error Rates

**Symptoms**: Increased 5xx responses

**Diagnosis**:
1. Check Vercel function logs
2. Review error patterns in browser console
3. Check recent deployments

**Solutions**:
1. Rollback to previous deployment if recent change
2. Review and fix error-causing code
3. Add more error handling

### Cache Not Working

**Symptoms**: All requests show `X-Cache: MISS`

**Diagnosis**:
1. Check if cache is enabled
2. Verify cache key generation
3. Check cache size limits

**Solutions**:
```typescript
// Verify cache is working
import { apiCache } from '@/lib/cache'
console.log(apiCache.getStats())
// Should show hits and misses

// Clear cache if needed
apiCache.clear()
```

### Rate Limiting Issues

**Symptoms**: Legitimate users getting 429 errors

**Diagnosis**:
1. Check rate limit configuration
2. Review request patterns
3. Identify if specific IPs are affected

**Solutions**:
```typescript
// Adjust rate limits in lib/rate-limiter.ts
export const RATE_LIMITS = {
  PUBLIC_API: { windowMs: 60000, maxRequests: 200 }, // Increased from 100
  // ...
}
```

## Performance Optimization Checklist

When performance degrades:

1. **Check Database**
   - [ ] Run `ANALYZE` on affected tables
   - [ ] Review slow queries
   - [ ] Verify indexes are being used
   - [ ] Check connection pool usage

2. **Check Caching**
   - [ ] Verify cache hit rate
   - [ ] Check cache size
   - [ ] Review cache TTL settings
   - [ ] Clear cache if stale

3. **Check API**
   - [ ] Review recent code changes
   - [ ] Check for N+1 query problems
   - [ ] Verify pagination is working
   - [ ] Test with production data volume

4. **Check Infrastructure**
   - [ ] Review Vercel function logs
   - [ ] Check Supabase status page
   - [ ] Verify DNS resolution
   - [ ] Test from different locations

## Regular Maintenance Tasks

### Daily
- [ ] Check health endpoint status
- [ ] Review error logs for new issues
- [ ] Monitor response times

### Weekly
- [ ] Review slow queries in Supabase
- [ ] Check cache hit rates
- [ ] Review rate limit statistics
- [ ] Check for failed deployments

### Monthly
- [ ] Run `ANALYZE` on all tables
- [ ] Review and optimize slow queries
- [ ] Check table sizes and growth
- [ ] Review and adjust rate limits
- [ ] Update dependencies

### Quarterly
- [ ] Performance audit
- [ ] Security review
- [ ] Capacity planning
- [ ] Review monitoring alerts

## Useful SQL Queries

### Check Slow Queries
```sql
SELECT * FROM slow_queries;
```

### Check Table Sizes
```sql
SELECT * FROM table_sizes;
```

### Check Active Connections
```sql
SELECT COUNT(*) as active_connections
FROM pg_stat_activity
WHERE datname = current_database();
```

### Check Index Usage
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Check Database Health
```sql
SELECT check_database_health();
```

## Contact and Escalation

### For Production Issues

1. **Check Status Pages**
   - Vercel: https://www.vercel-status.com/
   - Supabase: https://status.supabase.com/

2. **Review Logs**
   - Vercel Dashboard > Functions > Logs
   - Supabase Dashboard > Logs

3. **Get Help**
   - Vercel Support: https://vercel.com/support
   - Supabase Support: https://supabase.com/support

## Monitoring Tools Recommendations

### Free Tier
- **UptimeRobot**: Uptime monitoring
- **Vercel Analytics**: Built-in analytics
- **Supabase Dashboard**: Database monitoring

### Paid (Optional)
- **Sentry**: Error tracking ($26/month)
- **Datadog**: Full stack monitoring
- **New Relic**: Application performance monitoring
- **LogRocket**: Session replay and monitoring

## Next Steps

1. Set up automated health checks
2. Configure alert notifications (email/Slack)
3. Create monitoring dashboard
4. Document incident response procedures
5. Schedule regular maintenance tasks
