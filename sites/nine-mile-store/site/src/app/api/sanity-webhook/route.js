import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the secret from the request
    const { isValidSignature, body } = await validateRequest(request);
    
    // Validate the webhook secret
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
    }
    
    // Determine which paths to revalidate based on the updated document type
    const paths = getPathsToRevalidate(body);
    
    // Revalidate all affected paths
    for (const path of paths) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Revalidation successful',
      revalidatedPaths: paths
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Helper function to validate the webhook signature
async function validateRequest(request) {
  const body = await request.json();
  
  // Check for webhook secret in production
  if (process.env.NODE_ENV === 'production' && process.env.SANITY_WEBHOOK_SECRET) {
    const providedSecret = request.headers.get('x-sanity-webhook-secret');
    if (!providedSecret || providedSecret !== process.env.SANITY_WEBHOOK_SECRET) {
      return {
        isValidSignature: false,
        body
      };
    }
  }
  
  return {
    isValidSignature: true,
    body
  };
}

// Helper function to determine which paths to revalidate based on document type
function getPathsToRevalidate(body) {
  // Default - revalidate homepage
  const paths = ['/'];
  
  // Check the document type and add specific paths to revalidate
  if (body && body._type) {
    switch (body._type) {
      case 'product':
        paths.push('/#on-sale');
        break;
      case 'service':
        paths.push('/#services');
        break;
      case 'closeoutItem':
        paths.push('/#on-sale');
        break;
      case 'rentalItem':
        paths.push('/rentals');
        // Also revalidate the specific rental item page if we have the slug
        if (body.slug && body.slug.current) {
          paths.push(`/rentals/${body.slug.current}`);
        }
        break;
      case 'storeHours':
      case 'storeInfo':
        paths.push('/#about');
        break;
      case 'siteImage':
        paths.push('/#home');
        paths.push('/#about');
        break;
      default:
        // Revalidate everything if we're not sure
        paths.push('/#services');
        paths.push('/#on-sale');
        paths.push('/#about');
    }
  }
  
  return paths;
} 