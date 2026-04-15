# Nine Mile Store CMS Management Guidelines

## Directory Structure

```
nine-mile-store/
├── nine-mile-store-cms/    # Sanity CMS project
│   ├── schemaTypes/        # Content type definitions
│   ├── deskStructure.js    # Studio navigation structure
│   └── sanity.config.js    # CMS configuration
└── site/                   # Next.js website
    ├── public/             # Static files (includes favicon files)
    └── src/
        ├── lib/            # Shared utilities
        │   ├── sanity.js   # Sanity client configuration
        │   └── StoreDataContext.js  # Data fetching/sharing
        └── app/            # Website pages and components
```

## CMS Development Process

### Step 1: Making Schema Changes

When adding, removing, or modifying content types:

1. Navigate to the CMS directory first:
   ```bash
   cd nine-mile-store-cms
   ```

2. For new content types:
   - Create a new schema file in `schemaTypes/`
   - Import and add to `schemaTypes/index.js`
   - Add to `deskStructure.js` if needed

3. For removing content types:
   - Remove from `schemaTypes/index.js`
   - Remove from `deskStructure.js`
   - Delete the schema file

4. For modifying existing types:
   - Update the schema file in `schemaTypes/`
   - Test locally before deploying

### Step 2: Testing Locally

1. Start the Sanity Studio dev server from the CMS directory:
   ```bash
   cd nine-mile-store-cms
   npm run dev
   ```

2. Visit the local Studio at http://localhost:3333

3. Test all changes thoroughly:
   - Create test content items
   - Verify fields work as expected
   - Check validation rules

### Step 3: Deploying Schema Changes

1. Deploy the CMS from the CMS directory:
   ```bash
   cd nine-mile-store-cms
   npm run deploy
   ```

2. Verify changes on https://nine-mile-store.sanity.studio/

3. If experiencing errors:
   - Check browser console for errors
   - Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Verify schema file syntax

### Step 4: Updating the Website

1. Update the `StoreDataContext.js` file to match new schema:
   - Add/remove state properties
   - Modify GROQ queries
   - Update data processing logic

2. Check component usage:
   - Ensure components consuming the data are updated
   - Add fallbacks for optional content

3. Test website locally:
   ```bash
   cd site
   npm run dev
   ```

## Managing Favicons

The site's favicon is managed through the CMS and can be updated without code changes:

1. **Uploading a New Favicon**:
   - Go to the Sanity Studio > Site Favicon
   - Upload a square image (recommended 512x512px)
   - Optionally upload a separate Apple Touch Icon
   - Save and publish

2. **Generating Static Favicon Files**:
   After uploading a new favicon via the CMS, run the favicon generator:
   
   ```bash
   cd site
   node -e "require('./src/lib/FaviconGenerator.js').generateFavicons()"
   ```
   
   This will output URLs for all favicon sizes. Download each one and save to the `site/public` directory with the corresponding filename.

3. **Verifying Favicons**:
   - The dynamic favicon component will update the favicon in real-time
   - Static favicons will be used for initial page load and SEO
   - Check different devices to ensure proper display

## Troubleshooting

### CMS Not Reflecting Changes

1. Clear browser cache or use incognito mode
2. Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Log out and log back in to Sanity Studio
4. Verify the correct dataset is selected

### Invalid API Error

If you get "Command is not available outside of a Sanity project context":
- Ensure you're in the `nine-mile-store-cms` directory, not the root project

### Deployment Issues

1. Check for JavaScript errors in the console
2. Verify imports in `schemaTypes/index.js`
3. Ensure all schema files exist
4. Check for syntax errors in schema files

### Website Not Showing Updated Data

1. Verify the website is using the correct dataset in `sanity.js`
2. Check GROQ queries in `StoreDataContext.js`
3. Verify components are using `useStoreData()` hook correctly
4. Clear website cache and refresh

## Current Dataset Information

- **Project ID:** f0k2uz7k
- **Dataset:** production-new
- **API Version:** 2023-05-03

## CMS Schema Types

- product
- service
- landscapingService
- siteImage
- storeHours
- storeInfo
- socialLink
- favicon 