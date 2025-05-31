'use client';

import { usePathname } from 'next/navigation';

interface JsonLdProps {
  organizationName?: string;
  siteUrl?: string;
  title?: string;
  description?: string;
  logoUrl?: string;
}

export default function JsonLd({
  organizationName = 'Rolevate',
  siteUrl = 'https://rolevate.com',
  title = 'Rolevate AI - Banking Recruitment Platform',
  description = 'Rolevate helps banking institutions optimize their HR workflow with AI-powered recruitment solutions tailored for the banking industry.',
  logoUrl = 'https://rolevate.com/images/rolevate-logo.png',
}: JsonLdProps) {
  const pathname = usePathname();
  const currentUrl = `${siteUrl}${pathname}`;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        'name': organizationName,
        'url': siteUrl,
        'logo': {
          '@type': 'ImageObject',
          '@id': `${siteUrl}/#logo`,
          'inLanguage': 'en-US',
          'url': logoUrl,
          'contentUrl': logoUrl,
          'width': 512,
          'height': 512,
          'caption': organizationName
        },
        'image': {
          '@id': `${siteUrl}/#logo`
        },
        'parentOrganization': {
          '@type': 'Organization',
          'name': 'Roxate Ltd',
          'url': 'https://roxate.com'
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        'url': siteUrl,
        'name': organizationName,
        'description': description,
        'publisher': {
          '@id': `${siteUrl}/#organization`
        },
        'inLanguage': 'en-US'
      },
      {
        '@type': 'WebPage',
        '@id': `${currentUrl}#webpage`,
        'url': currentUrl,
        'name': title,
        'isPartOf': {
          '@id': `${siteUrl}/#website`
        },
        'about': {
          '@id': `${siteUrl}/#organization`
        },
        'description': description,
        'inLanguage': 'en-US'
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
