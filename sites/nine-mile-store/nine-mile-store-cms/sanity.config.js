import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './deskStructure'

// Simplified configuration without custom structure
export default defineConfig({
  name: 'default',
  title: 'Nine Mile Store CMS',
  icon: () => '🏪',

  projectId: 'f0k2uz7k',
  dataset: 'production-new',

  plugins: [
    structureTool({structure}),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
  
  document: {
    // For the favicon document, create it automatically 
    // if it doesn't exist
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem) => templateItem.templateId !== 'favicon'
        )
      }
      return prev
    },
    actions: (prev, {schemaType}) => {
      if (schemaType === 'favicon') {
        return prev.filter(({action}) => !['unpublish', 'delete', 'duplicate'].includes(action))
      }
      return prev
    },
  },
})
