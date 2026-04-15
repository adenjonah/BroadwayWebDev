import { getHomepageData } from "../lib/data"
import HomeSection from "./components/HomeSection"
import ServicesSection from "./components/ServicesSection"
import OnSaleSection from "./components/OnSaleSection"
import AboutSection from "./components/AboutSection"
import FeedbackForm from "./components/FeedbackForm"
import FooterSection from "./components/FooterSection"

export default async function Home() {
  const data = await getHomepageData()

  return (
    <>
      <HomeSection heroImage={data.heroImage} blurbPhotos={data.blurbPhotos} />
      <ServicesSection services={data.services} />
      <OnSaleSection saleItems={data.saleItems} />
      <AboutSection
        storeInfo={data.storeInfo}
        storeHours={data.storeHours}
      />
      <FeedbackForm />
      <FooterSection
        storeInfo={data.storeInfo}
        storeHours={data.storeHours}
        socialLinks={data.socialLinks}
      />
    </>
  )
}
