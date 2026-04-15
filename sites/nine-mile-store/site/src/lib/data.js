import { client } from './sanity'

export async function getNavbarData() {
  const query = `{
    "storeInfo": *[_type == "storeInfo"][0] { storeName, phone },
    "logoImage": *[_type == "siteImage" && category == "logo"][0] { title, image }
  }`
  const data = await client.fetch(query)
  return {
    storeInfo: data.storeInfo || {},
    logoImage: data.logoImage || null,
  }
}

export async function getHomepageData() {
  const query = `{
    "storeInfo": *[_type == "storeInfo"][0] {
      storeName, phone, email, address, city, communityText
    },
    "storeHours": *[_type == "storeHours"][0] {
      monday, tuesday, wednesday, thursday, friday, saturday, sunday
    },
    "services": *[_type == "service"] {
      _id, title, description, image, featured
    },
    "saleItems": *[_type == "product" && onSale == true] {
      _id, name, description, regularPrice, salePrice, image, orderRank
    } | order(orderRank asc),
    "images": *[_type == "siteImage"] {
      _id, title, category, image
    },
    "socialLinks": *[_type == "socialLink"] | order(orderRank) {
      _id, platform, url
    }
  }`

  const data = await client.fetch(query)

  return {
    storeInfo: data.storeInfo || {},
    storeHours: data.storeHours || {},
    services: data.services || [],
    saleItems: data.saleItems || [],
    heroImage: data.images?.find(img => img.category === 'hero') || null,
    blurbPhotos: data.images?.filter(img => img.category === 'interior') || [],
    socialLinks: data.socialLinks || [],
  }
}
