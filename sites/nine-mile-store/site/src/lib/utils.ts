export const formatCurrency = (amount: number | null | undefined): string => {
  // Handle null, undefined, or invalid numbers
  if (amount === null || amount === undefined || isNaN(amount) || typeof amount !== 'number') {
    return '$0.00'
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  } catch (error) {
    console.warn('Error formatting currency:', error)
    return `$${amount.toFixed(2)}`
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
}

export function slugify(text: string): string {
  return generateSlug(text)
} 