export default {
  name: 'favicon',
  title: 'Site Favicon',
  type: 'document',
  // Limit to a single document
  __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Title for internal reference',
      initialValue: 'Site Favicon',
      readOnly: true,
    },
    {
      name: 'favicon',
      title: 'Favicon Image',
      type: 'image',
      description: 'Upload a square image (recommended size: 512x512px). This will be used to generate favicons for the website.',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'appleTouchIcon',
      title: 'Apple Touch Icon',
      type: 'image',
      description: 'Optional. Upload a square image for Apple devices (recommended size: 180x180px).',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'additionalInfo',
      title: 'Additional Information',
      type: 'string',
      initialValue: 'After uploading a new favicon, you may need to clear your browser cache to see the changes.',
      readOnly: true,
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'favicon'
    }
  }
} 