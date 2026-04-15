// deskStructure.js

import {
  FaStore,
  FaImages,
  FaBoxes,
  FaTools,
  FaLeaf,
  FaTag,
  FaClock,
  FaShareAlt
} from 'react-icons/fa'

// List all document types
const hiddenDocTypes = listItem => 
  ![
    'storeInfo', 
    'siteImage', 
    'service', 
    'product', 
    'closeoutItem', 
    'storeHours', 
    'socialLink',
    'serviceCategory'
  ].includes(listItem.getId())

// Build the structure
export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      // Regular document types
      S.documentTypeListItem('product'),
      S.documentTypeListItem('service'),
      S.documentTypeListItem('serviceCategory'),
      
      // Site Images with categories
      S.listItem()
        .title('Site Images')
        .icon(FaImages)
        .child(
          S.list()
            .title('Site Images')
            .items([
              S.listItem()
                .title('All Images')
                .child(
                  S.documentTypeList('siteImage')
                    .title('All Images')
                ),
              S.listItem()
                .title('Logo')
                .child(
                  S.documentTypeList('siteImage')
                    .title('Logo')
                    .filter('_type == "siteImage" && category == "logo"')
                ),
              S.listItem()
                .title('Hero Image')
                .child(
                  S.documentTypeList('siteImage')
                    .title('Hero Image')
                    .filter('_type == "siteImage" && category == "hero"')
                ),
              S.listItem()
                .title('Interior Images')
                .child(
                  S.documentTypeList('siteImage')
                    .title('Interior Images')
                    .filter('_type == "siteImage" && category == "interior"')
                ),
              S.listItem()
                .title('Other Images')
                .child(
                  S.documentTypeList('siteImage')
                    .title('Other Images')
                    .filter('_type == "siteImage" && category == "other"')
                ),
            ])
        ),
      
      S.documentTypeListItem('socialLink'),
      
      // Singleton document types
      S.listItem()
        .title('Store Information')
        .child(
          S.editor()
            .id('storeInfo')
            .schemaType('storeInfo')
            .documentId('storeInfo')
        ),
      S.listItem()
        .title('Store Hours')
        .child(
          S.editor()
            .id('storeHours')
            .schemaType('storeHours')
            .documentId('storeHours')
        ),
      S.listItem()
        .title('Site Favicon')
        .child(
          S.editor()
            .id('favicon')
            .schemaType('favicon')
            .documentId('favicon')
        ),
      
      // Social Links
      S.listItem()
        .title('Social Links')
        .icon(FaShareAlt)
        .child(
          S.documentTypeList('socialLink')
            .title('Social Links')
        ),
      
      // Filter out the rest
      ...S.documentTypeListItems().filter(hiddenDocTypes)
    ]) 