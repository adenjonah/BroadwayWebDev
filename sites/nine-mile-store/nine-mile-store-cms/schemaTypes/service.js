export default {
  name: 'service',
  type: 'document',
  title: 'Services',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Service Title'
    },
    {
      name: 'description',
      type: 'text',
      title: 'Description'
    },
    {
      name: 'image',
      type: 'image',
      title: 'Service Image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'featured',
      type: 'boolean',
      title: 'Featured Service',
      initialValue: false
    }
  ]
} 