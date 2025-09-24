import type { Locale } from '../i18n/config';

// Message types based on your JSON structure
export interface Messages {
  home: {
    title: string;
    welcomeMessage: string;
    aboutLink: string;
    contactLink: string;
  };
  hero: {
    announcement: string;
    title: string;
    subtitle: string;
    messagePlaceholder: string;
    countries: string[];
  };
  navbar: {
    home: string;
    jobs: string;
    employers: string;
    about: string;
    contact: string;
    signIn: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    rememberMe: string;
    forgotPassword: string;
    signIn: string;
    or: string;
    continueWithGoogle: string;
    noAccount: string;
    signUp: string;
  };
  registration: {
    title: string;
    subtitle: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    createAccount: string;
    creatingAccount: string;
    or: string;
    continueWithGoogle: string;
    haveAccount: string;
    signIn: string;
  };
  jobs: {
    title: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    noJobsFound: string;
    noJobsMessage: string;
    apply: string;
    applyNow: string;
    remote: string;
    loading: string;
    allTypes: string;
    fullTime: string;
    partTime: string;
    contract: string;
    anyExperience: string;
    entryLevel: string;
    midLevel: string;
    seniorLevel: string;
    anySalary: string;
  };
  footer: {
    description: string;
    address: string;
    sections: {
      company: string;
      services: string;
      support: string;
      employers: string;
    };
    company: {
      about: string;
      careers: string;
      press: string;
      blog: string;
    };
    services: {
      jobSearch: string;
      resumeBuilder: string;
      careerAdvice: string;
      employerServices: string;
    };
    support: {
      helpCenter: string;
      contactUs: string;
      privacy: string;
      terms: string;
    };
    employers: {
      postJob: string;
      talentSearch: string;
      pricing: string;
      successStories: string;
    };
    newsletter: {
      title: string;
      description: string;
      placeholder: string;
      subscribe: string;
    };
    app: {
      download: string;
    };
    copyright: {
      allRightsReserved: string;
    };
    legal: {
      privacy: string;
      terms: string;
      cookies: string;
      accessibility: string;
    };
  };
}

// Utility types
export type LocalePathParams = {
  locale: Locale;
};

export type LocalizedPageProps<T = Record<string, never>> = {
  params: Promise<LocalePathParams & T>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type LocalizedLayoutProps = {
  children: React.ReactNode;
  params: Promise<LocalePathParams>;
};

// Navigation types
export type LocalizedHref = string | {
  pathname: string;
  params?: Record<string, string>;
};

// Form validation types
export type ValidationError = {
  message: string;
  field?: string;
};

export type LocalizedValidationError = {
  en: ValidationError;
  ar: ValidationError;
};

// API response types
export type LocalizedApiResponse<T = unknown> = {
  data: T;
  message: string;
  success: boolean;
  locale: Locale;
};

// SEO types
export type LocalizedMetadata = {
  title: string;
  description: string;
  keywords?: string[];
  openGraph?: {
    title: string;
    description: string;
    images?: string[];
  };
  alternates?: {
    languages: Record<Locale, string>;
  };
};

// Translation key types for type-safe message access
export type MessageKeys = keyof Messages;
export type NestedMessageKeys<T> = T extends string
  ? never
  : T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends string
          ? K
          : `${K}.${NestedMessageKeys<T[K]>}`
        : never;
    }[keyof T]
  : never;

export type AllMessageKeys = NestedMessageKeys<Messages>;