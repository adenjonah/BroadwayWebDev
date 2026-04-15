# Nine Mile Store - Deployment & Troubleshooting Guide

## 🚨 Critical Fixes Applied

### 1. Store Hours Issue - RESOLVED ✅
**Problem**: Hard-coded store hours override in FooterSection.js prevented CMS updates from showing on production.
**Fix**: Removed hard-coded override. Store hours now pull directly from CMS.

### 2. Hero Image Development Issue - REQUIRES SETUP ⚠️
**Problem**: Missing environment variables and CDN configuration differences.
**Fix**: Updated Sanity client configuration and created environment template.

## 📋 Environment Setup

### Required Environment Variables

Copy `site/env.template` to `site/.env.local` and fill in:

```bash
# Get this from your Sanity project settings
SANITY_API_TOKEN=your_sanity_api_token_here

# Public configuration (already set correctly)
NEXT_PUBLIC_SANITY_PROJECT_ID=f0k2uz7k
NEXT_PUBLIC_SANITY_DATASET=production-new

# Optional: For webhook security in production
SANITY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Getting Your Sanity API Token

1. Go to https://sanity.io/manage
2. Select your project (f0k2uz7k)
3. Go to Settings > API
4. Create a new token with "Editor" permissions
5. Copy the token to your `.env.local` file

## 🐛 Troubleshooting Common Issues

### Hero Image Not Showing Locally

**Symptoms**: Hero image displays on production but not locally
**Causes**:
1. Missing `SANITY_API_TOKEN` in `.env.local`
2. Network connectivity issues
3. Image not published in CMS

**Solutions**:
1. Ensure `.env.local` exists with valid `SANITY_API_TOKEN`
2. Check browser console for CORS or network errors
3. Verify image is published in Sanity Studio

### Store Hours Not Updating

**Symptoms**: Changes in CMS don't reflect on website
**Causes**:
1. ~~Hard-coded override (FIXED)~~
2. Webhook not configured
3. Cache not invalidating

**Solutions**:
1. **Problem RESOLVED** - Hard-coded override removed
2. Configure webhook in Sanity: `https://your-domain.com/api/sanity-webhook`
3. Manual cache clear: `https://your-domain.com/api/revalidate?path=/`

### Performance Issues

**Previous Problems (RESOLVED)**:
- ~~30-second polling removed~~
- ~~Excessive API calls eliminated~~
- ~~Multiple caching strategies simplified~~

## 🚀 Deployment Checklist

### Production Environment Variables (Vercel)
```bash
SANITY_API_TOKEN=your_production_token
SANITY_WEBHOOK_SECRET=your_webhook_secret
```

### Sanity Webhook Configuration
1. Go to Sanity Studio > Settings > Webhooks
2. Add webhook: `https://your-domain.com/api/sanity-webhook`
3. Select all document types
4. Add secret header: `x-sanity-webhook-secret: your_webhook_secret`

### Vercel Deployment
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

## 🔧 Architecture Improvements Made

### Before (Problems):
- Hard-coded store hours override
- Excessive client-side polling every 30 seconds
- Multiple conflicting caching strategies
- No environment configuration
- No webhook security

### After (Solutions):
- Dynamic store hours from CMS
- Single data fetch on component mount
- Proper CDN usage (prod) vs fresh data (dev)
- Environment template and configuration
- Webhook security with secret validation

## 📊 Performance Impact

### Improvements:
- **Reduced API calls**: From continuous polling to single fetch
- **Better caching**: CDN enabled in production
- **Faster local development**: No CDN delays
- **Improved UX**: Immediate data loading without polling delays

## 🔐 Security Enhancements

1. **Webhook validation**: Production webhooks now require secret
2. **Environment separation**: Different CDN usage for dev/prod
3. **Token security**: API tokens now properly configured via environment

## 📝 Maintenance Notes

### Regular Tasks:
1. Monitor webhook delivery in Sanity dashboard
2. Check Vercel function logs for errors
3. Verify environment variables are set correctly

### When Adding New Content Types:
1. Update `getPathsToRevalidate()` in `/api/sanity-webhook/route.js`
2. Add new fields to GROQ query in `StoreDataContext.js`
3. Test webhook delivery after CMS updates 