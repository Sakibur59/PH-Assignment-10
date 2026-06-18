import Footer from "@/Components/Footer";
import Banner from "@/Components/Homepage/Banner";
import FeaturedProducts from "@/Components/Homepage/FeaturedProducts";


export default function Home() {
  return (
   <div>
    <Banner></Banner>
    <FeaturedProducts limit={8}></FeaturedProducts>
    <Footer></Footer>
   </div>
  );
}
