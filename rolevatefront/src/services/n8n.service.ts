// N8N Service for AI Processing
export interface N8NJobData {
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  description: string;
  requirements: string[];
  benefits: string[];
}

export interface N8NResponse {
  success: boolean;
  data?: {
    extractedData: Partial<N8NJobData>;
    nextQuestion: string;
    confidence: number;
    suggestions?: string[];
  };
  error?: string;
}

export interface N8NProcessRequest {
  userMessage: string;
  currentStep: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  extractedData: Partial<N8NJobData>;
}

class N8NService {
  private chatWebhookUrl: string;
  private webhookToken: string;

  constructor() {
    // Your specific n8n chat webhook URL
    this.chatWebhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL || 'https://n8n.widd.ai/webhook/5b51e858-a304-4e94-bd6d-f2157345f2b2/chat';
    this.webhookToken = process.env.NEXT_PUBLIC_N8N_WEBHOOK_TOKEN || '';
  }

  async processJobMessage(request: N8NProcessRequest): Promise<N8NResponse> {
    console.log('🚀 Sending to n8n webhook:', this.chatWebhookUrl);
    console.log('📤 Request payload:', JSON.stringify(request, null, 2));
    
    const response = await fetch(this.chatWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.webhookToken && { 'Authorization': `Bearer ${this.webhookToken}` }),
      },
      body: JSON.stringify(request),
    });

    console.log('📡 n8n response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ n8n API error:', response.status, response.statusText, errorText);
      throw new Error(`N8N API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📥 n8n response data:', JSON.stringify(data, null, 2));
    return data;
  }

  async validateJobData(jobData: N8NJobData): Promise<{
    isValid: boolean;
    suggestions: string[];
    score: number;
  }> {
    try {
      // For now, using the same chat webhook with validation type
      const response = await fetch(this.chatWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.webhookToken && { 'Authorization': `Bearer ${this.webhookToken}` }),
        },
        body: JSON.stringify({
          type: 'validate',
          jobData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Validation API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Job validation error:', error);
      
      // Fallback validation
      return {
        isValid: true,
        suggestions: [],
        score: 0.8,
      };
    }
  }

  async enhanceJobDescription(description: string, title: string, department: string): Promise<string> {
    try {
      const response = await fetch(this.chatWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.webhookToken && { 'Authorization': `Bearer ${this.webhookToken}` }),
        },
        body: JSON.stringify({
          type: 'enhance',
          description,
          title,
          department,
        }),
      });

      if (!response.ok) {
        throw new Error(`Enhancement API error: ${response.status}`);
      }

      const data = await response.json();
      return data.enhancedDescription || description;
    } catch (error) {
      console.error('Job enhancement error:', error);
      return description;
    }
  }
}

export const n8nService = new N8NService();
