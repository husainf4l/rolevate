import Image from "next/image";
import Hero from "../components/Hero";
import WhatIsRolevate from "../components/WhatIsRolevate";
import HowItWorks from "../components/HowItWorks";
import ProblemVsSolution from "@/components/ProblemVsSolution";
import BankIndustryFocus from "@/components/BankIndustryFocus";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <WhatIsRolevate />
      <HowItWorks />
      <ProblemVsSolution />
      <BankIndustryFocus />
      <CallToAction />
    </div>
  );
}
