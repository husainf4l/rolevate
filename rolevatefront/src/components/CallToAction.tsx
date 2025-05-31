import React from "react";
import Image from "next/image";
import Button from "./ui/Button";

const CallToAction = () => {
  return (
    <section className="py-20 md:py-28 bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* CTA Side */}
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">
              Let's Build Your Future HR Workflow — Together.
            </h2>
            <p className="text-gray-300 mb-10 text-lg md:text-xl max-w-xl mx-auto md:mx-0">
              Book a live demo and explore how Rolevate can upgrade your hiring
              pipeline with AI precision, tailored for banking.
            </p>

            <Button
              href="/schedule-meeting"
              variant="primary"
              aria-label="Schedule a demo"
              className="px-10 py-4 text-lg"
            >
              Schedule a Meeting
            </Button>
          </div>

          {/* Image Side */}
          <div className="flex-1 w-full relative mt-10 md:mt-0">
            <div className="relative aspect-square max-w-md mx-auto shadow-2xl rounded-xl overflow-hidden">
              <Image
                src="/images/lailaherohr.png"
                alt="HR Director using Rolevate AI platform"
                fill
                className="object-cover rounded-xl"
                quality={95}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-transparent to-transparent rounded-xl" />
            </div>
            {/* Decorative Blobs - using theme colors */}
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl -z-10 animate-blob-slow" />
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl -z-10 animate-blob-fast" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
