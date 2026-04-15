# Sanity Blogging Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read "getting started" in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- Check out the example frontend: [React/Next.js](https://github.com/sanity-io/tutorial-sanity-blog-react-next)
- [Read the blog post about this template](https://www.sanity.io/blog/build-your-own-blog-with-sanity-and-next-js?utm_source=readme)
- [Join the community Slack](https://slack.sanity.io/?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)

## Automatic Deployment via GitHub Actions

This project is configured with GitHub Actions to automatically deploy the Sanity Studio whenever changes are pushed to the `nine-mile-store-cms` directory in the main branch. The workflow is defined in `.github/workflows/deploy-sanity.yml`.

### Setting up the Deployment Token

To enable automatic deployments, you need to create a Sanity token and add it to your GitHub repository secrets:

1. Create a Sanity deploy token:
   ```bash
   # Open the Sanity project management interface in your browser
   npx --yes @sanity/cli manage
   ```

   In the Sanity management interface that opens in your browser:
   - Click on the "API" tab
   - Select "Tokens" from the menu
   - Click "Add API token"
   - Name your token (e.g., "GitHub Actions Deploy")
   - Set the permissions to "Editor" or higher
   - Click "Create token"
   - Your token will be displayed - copy it immediately as it won't be shown again

2. Copy the generated token.

3. Add the token to your GitHub repository:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Set the name as `SANITY_DEPLOY_TOKEN`
   - Paste the token value
   - Click "Add secret"

Now the GitHub Action will be able to deploy your Sanity Studio automatically whenever changes are pushed to the repo.

### Manual Deployment

You can also manually trigger the deployment workflow:
- Go to the "Actions" tab in your GitHub repository
- Select the "Deploy Sanity CMS" workflow
- Click "Run workflow"
