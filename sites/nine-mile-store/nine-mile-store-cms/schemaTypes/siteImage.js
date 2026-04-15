export default {
  name: 'siteImage',
  type: 'document',
  title: 'Site Images',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Image Title'
    },
    {
      name: 'description',
      type: 'text',
      title: 'Description'
    },
    {
      name: 'image',
      type: 'image',
      title: 'Image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Logo', value: 'logo'},
          {title: 'Hero', value: 'hero'},
          {title: 'Blurb Photo', value: 'blurbPhoto'},
          {title: 'Other', value: 'other'},
        ]
      }
    }
  ]
} 