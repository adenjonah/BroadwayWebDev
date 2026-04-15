export default {
  name: 'storeHours',
  type: 'document',
  title: 'Store Hours',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'For internal reference only',
      initialValue: 'Store Hours'
    },
    {
      name: 'monday',
      type: 'string',
      title: 'Monday',
      initialValue: '8:00 AM - 6:00 PM'
    },
    {
      name: 'tuesday',
      type: 'string',
      title: 'Tuesday',
      initialValue: '8:00 AM - 6:00 PM'
    },
    {
      name: 'wednesday',
      type: 'string',
      title: 'Wednesday',
      initialValue: '8:00 AM - 6:00 PM'
    },
    {
      name: 'thursday',
      type: 'string',
      title: 'Thursday',
      initialValue: '8:00 AM - 6:00 PM'
    },
    {
      name: 'friday',
      type: 'string',
      title: 'Friday',
      initialValue: '8:00 AM - 6:00 PM'
    },
    {
      name: 'saturday',
      type: 'string',
      title: 'Saturday',
      initialValue: '9:00 AM - 5:00 PM'
    },
    {
      name: 'sunday',
      type: 'string',
      title: 'Sunday',
      initialValue: '10:00 AM - 4:00 PM'
    }
  ]
} 