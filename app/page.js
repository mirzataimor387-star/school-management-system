import Hero from "@/components/ui/Hero";
import About from "@/components/ui/About";
import Admissions from "@/components/ui/Admissions";
import Facilities from "@/components//ui/Facilities";
import Classes from "@/components//ui/Classes";


export default function LandingPage() {
  return (
    <>
      <Hero />
      <Classes />
      <Admissions />
      <Facilities />
      <About />
    </>
  );
}
