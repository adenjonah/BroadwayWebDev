// Function to generate hyphenated slugs
const slugify = (input) => 
  input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens

export default {
  name: 'rentalItem',
  title: 'Rental Item',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: slugify,
        isUnique: (slug, { document }) => {
          return slug === slugify(document?.name || '')
        }
      },  
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'additionalImages',
      title: 'Additional Images',
      type: 'array',
      of: [
        { 
          type: 'image',
          options: {
            hotspot: true
          }
        },
        {
          type: 'siteImage'
        }
      ],
      description: 'Add more images of the rental item (optional)'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: Rule => Rule.required()
    },
    {
      name: 'specifications',
      title: 'Specifications',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Add key specifications or features'
    },
    {
      name: 'dailyRate',
      title: 'Daily Rate',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'weeklyRate',
      title: 'Weekly Rate',
      type: 'number',
      validation: Rule => Rule.min(0)
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image.image',
      subtitle: 'category'
    },
    prepare({ title, media, subtitle }) {
      return {
        title,
        subtitle: subtitle ? `Category: ${subtitle}` : 'No category',
        media
      }
    }
  }
} 