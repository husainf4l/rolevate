interface EnvConfig {
  API_URL: string;
}


export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rolevate.com/api';

export const env: EnvConfig = {
  API_URL,
};
