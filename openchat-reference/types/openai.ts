import mistralTokenizer from 'mistral-tokenizer-js';
import llama3Tokenizer from 'llama3-tokenizer-js';
import { OPENAI_API_TYPE } from '../utils/app/const';

export interface OpenAIModel {
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
}

export enum OpenAIModelID {
  // OpenChat
  OPENCHAT_3_2_MISTRAL = 'openchat_v3.2_mistral',
  OPENCHAT_3_6 = 'openchat_3.6'
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = OpenAIModelID.OPENCHAT_3_6;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  // OpenChat
  [OpenAIModelID.OPENCHAT_3_2_MISTRAL]: {
    id: OpenAIModelID.OPENCHAT_3_2_MISTRAL,
    name: 'OpenChat 3.5 (latest)',
    maxLength: 8192 * 3,
    tokenLimit: 8192,
  },

  [OpenAIModelID.OPENCHAT_3_6]: {
    id: OpenAIModelID.OPENCHAT_3_6,
    name: 'OpenChat 3.6 (latest)',
    maxLength: 8192 * 3,
    tokenLimit: 8192,
  }
};

export const OpenAITokenizers: Record<OpenAIModelID, any> = {
  [OpenAIModelID.OPENCHAT_3_2_MISTRAL]: mistralTokenizer,

  [OpenAIModelID.OPENCHAT_3_6]: llama3Tokenizer, 
};
