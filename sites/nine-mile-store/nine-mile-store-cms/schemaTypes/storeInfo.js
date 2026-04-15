export default {
  name: 'storeInfo',
  type: 'document',
  title: 'Store Information',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'For internal reference only',
      initialValue: 'Store Information'
    },
    {
      name: 'storeName',
      type: 'string',
      title: 'Store Name',
      initialValue: 'Nine Mile Hardware'
    },
    {
      name: 'phone',
      type: 'string',
      title: 'Phone Number',
      initialValue: '(509)-466-9502'
    },
    {
      name: 'email',
      type: 'string',
      title: 'Email',
      initialValue: 'info@ninemilehardware.com'
    },
    {
      name: 'address',
      type: 'string',
      title: 'Street Address',
      initialValue: '12516 N Nine Mile Rd'
    },
    {
      name: 'city',
      type: 'string',
      title: 'City, State, Zip',
      initialValue: 'Nine Mile Falls, WA 99026'
    },
    {
      name: 'aboutText',
      type: 'text',
      title: 'About Store Text',
      initialValue: 'Nine Mile Hardware is a family-owned and operated business that has been serving the Nine Mile Falls community for over 25 years. We pride ourselves on personal service and quality products.'
    },
    {
      name: 'communityText',
      type: 'text',
      title: 'Community Involvement Text',
      initialValue: 'At Nine Mile Hardware, we believe in giving back to our community. We regularly participate in local events and support various charitable organizations throughout the year.'
    }
  ]
} 