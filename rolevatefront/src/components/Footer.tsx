import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from './logo/logo';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-[#F8FAFC] py-12 border-t border-[#334155]/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0">
            <Logo   />
          </div>
          
          <div className="flex flex-wrap gap-8 justify-center md:justify-end">
            <Link href="/privacy-policy" className="text-[#94A3B8] hover:text-[#00C6AD] transition duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-[#94A3B8] hover:text-[#00C6AD] transition duration-300">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-[#94A3B8] hover:text-[#00C6AD] transition duration-300">
              Contact Us
            </Link>
          </div>
        </div>
        
        <div className="border-t border-[#334155]/30 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-[#94A3B8] mb-4 md:mb-0">
            <p>© 2025 Rolevate | A <a href="https://roxate.com" className="text-[#00C6AD] hover:underline" target="_blank" rel="noopener noreferrer">Roxate Ltd</a> Company</p>
            <p className="text-xs mt-1 opacity-80">Rolevate is part of the Roxate group of companies</p>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://linkedin.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#94A3B8] hover:text-[#00C6AD] transition duration-300"
              aria-label="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a 
              href="https://wa.me/123456789" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#94A3B8] hover:text-[#00C6AD] transition duration-300"
              aria-label="WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>
            <a 
              href="mailto:info@rolevate.com" 
              className="text-[#94A3B8] hover:text-[#00C6AD] transition duration-300"
              aria-label="Email"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
              </svg>
            </a>
          </div>
        </div>
        
 
      </div>
    </footer>
  );
};

export default Footer;
