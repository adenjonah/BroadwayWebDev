import {createClient} from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create a client to fetch with
const client = createClient({
  projectId: 'f0k2uz7k',
  dataset: 'production-new',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_WRITE_TOKEN // You'll need to set this
})

const categoryMappings = {
  'powerTools': 'Power Tools',
  'handTools': 'Hand Tools',
  'constructionEquipment': 'Construction Equipment',
  'lawnGarden': 'Lawn & Garden',
  'other': 'Other'
}

// First, create the categories
async function createCategories() {
  console.log('Creating categories...')
  const createdCategories = {}
  
  for (const [value, title] of Object.entries(categoryMappings)) {
    // Check if category already exists
    const existing = await client.fetch(
      `*[_type == "category" && value.current == $value][0]`,
      { value }
    )
    
    if (existing) {
      console.log(`Category ${title} already exists`)
      createdCategories[value] = existing._id
      continue
    }

    const category = await client.create({
      _type: 'category',
      title: title,
      value: {
        _type: 'slug',
        current: value
      }
    })
    
    console.log(`Created category: ${title}`)
    createdCategories[value] = category._id
  }
  
  return createdCategories
}

// Then update all rental items
async function updateRentalItems(categoryIds) {
  console.log('Updating rental items...')
  
  // Fetch all rental items
  const rentalItems = await client.fetch(`
    *[_type == "rentalItem" && defined(category) && !defined(category._ref)]
  `)
  
  console.log(`Found ${rentalItems.length} rental items to update`)
  
  // Update each rental item
  for (const item of rentalItems) {
    const oldCategory = item.category
    const categoryId = categoryIds[oldCategory]
    
    if (!categoryId) {
      console.log(`Warning: No mapping found for category ${oldCategory} on item ${item._id}`)
      continue
    }
    
    await client
      .patch(item._id)
      .set({
        category: {
          _type: 'reference',
          _ref: categoryId
        }
      })
      .commit()
    
    console.log(`Updated rental item: ${item.name}`)
  }
}

// Run the migration
async function migrate() {
  try {
    const categoryIds = await createCategories()
    await updateRentalItems(categoryIds)
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrate() 