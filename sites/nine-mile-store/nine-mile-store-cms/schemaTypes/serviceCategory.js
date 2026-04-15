export default {
  name: 'serviceCategory',
  title: 'Service Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Category Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A short description of this service category'
    },
    {
      name: 'image',
      title: 'Category Image',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Image representing this service category',
      validation: Rule => Rule.required()
    },
    {
      name: 'overlayText',
      title: 'Overlay Text',
      type: 'string',
      description: 'Text to display over the image (optional)'
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image'
    }
  }
} 