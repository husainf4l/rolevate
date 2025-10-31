import React from "react";
import Logo from "./Logo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

const footerLinks = [
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Data Deletion", href: "/data-deletion" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200/60 bg-white/80 backdrop-blur-sm pt-8 pb-6 mt-12">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-6">
          {/* Logo and Description */}
          <div className="flex-1 min-w-[200px] mb-6 md:mb-0">
            <Logo size={70} />
            <p className="text-gray-500 text-sm max-w-xs mb-4 mt-3 leading-relaxed">
              AI-powered recruitment platform for the Middle East. Elevate your
              hiring and career with intelligent automation.
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://www.linkedin.com/company/rolevate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/rolevate?igsh=dnUzNXVwOXp3Zno4&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Link Sections */}
          <div className="flex flex-1 flex-wrap gap-8 md:gap-12 justify-start md:justify-end">
            {footerLinks.map((section) => (
              <div key={section.title} className="min-w-[120px]">
                <div className="text-xs font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                  {section.title}
                </div>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-gray-600 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200/50">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">
              &copy; {new Date().getFullYear()} Rolevate. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}