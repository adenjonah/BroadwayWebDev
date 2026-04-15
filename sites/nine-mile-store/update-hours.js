const sanityClient = require('@sanity/client');

// Create a write client
const client = sanityClient({
  projectId: 'f0k2uz7k',
  dataset: 'production-new',
  token: '', // You would need to add your token here, but for security we'll leave it blank
  apiVersion: '2022-06-01',
  useCdn: false
});

async function updateStoreHours() {
  try {
    // First, let's check what's currently there
    const currentDoc = await client.getDocument('d1988352-55fb-4eac-bc17-f6186b5ff21b');
    console.log('Current store hours:', currentDoc);
    
    if (!client.config().token) {
      console.log('\n⚠️ No token provided. To update the document, you need to:');
      console.log('1. Get a write token from your Sanity project');
      console.log('2. Add it to this script');
      console.log('3. Run the script again\n');
      return;
    }

    // Update the document
    const result = await client
      .patch('d1988352-55fb-4eac-bc17-f6186b5ff21b')
      .set({
        monday: '7:00 AM - 6:00 PM',
        tuesday: '7:00 AM - 6:00 PM'
      })
      .commit();
    
    console.log('Successfully updated store hours:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateStoreHours(); 