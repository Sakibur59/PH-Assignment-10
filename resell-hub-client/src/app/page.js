import Footer from "@/Components/Footer";
import Banner from "@/Components/Homepage/Banner";
import FeaturedProducts from "@/Components/Homepage/FeaturedProducts";
import MarketplaceStats from "@/Components/Homepage/MarketplaceStats";
import PopularCategories from "@/Components/Homepage/PopularCategories";
import SuccessStories from "@/Components/Homepage/SuccessStories";
import SustainabilityImpact from "@/Components/Homepage/SustainabilityImpact";
import TrustedSellers from "@/Components/Homepage/TrustedSellers";


export default function Home() {
  return (
   <div>
    <Banner></Banner>
    <FeaturedProducts limit={8}></FeaturedProducts>
    <PopularCategories></PopularCategories>
    <SuccessStories></SuccessStories>
    <MarketplaceStats></MarketplaceStats>
    <SustainabilityImpact></SustainabilityImpact>
    <TrustedSellers></TrustedSellers>
    <Footer></Footer>
   </div>
  );
}
