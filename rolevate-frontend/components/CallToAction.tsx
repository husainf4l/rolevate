import React from "react";
import Image from "next/image";
import Button from "./ui/Button";

const CallToAction = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-[#0F172A]/5 to-[#0F172A]/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* CTA Side */}
          <div className="flex-1 w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-[#00C6AD] mb-3">
              Let's Build Your Future HR Workflow — Together.
            </h2>
            <p className="text-[#334155] mb-10 text-lg">
              Book a live demo and explore how Rolevate can upgrade your hiring pipeline 
              with AI precision, tailored for banking.
            </p>
            
            <Button 
              href="/schedule-meeting" 
              variant="primary"
              aria-label="Schedule a demo"
            >
              Schedule a Demo
            </Button>
          </div>
          
          {/* Image Side */}
          <div className="flex-1 w-full relative">
            <div className="relative aspect-square max-w-md mx-auto">
              <Image
                src="/images/lailaherohr.png"
                alt="HR Director"
                fill
                className="object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#00C6AD]/20 to-transparent rounded-lg" />
            </div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#00C6AD]/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-[#14B8A6]/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
