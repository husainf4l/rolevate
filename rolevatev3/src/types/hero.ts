export interface FullPageChatProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export interface HeroSearchFormProps {
  messagePlaceholder: string;
  countries: string[];
  locale: string;
}

export interface HeroProps {
  locale: string;
}