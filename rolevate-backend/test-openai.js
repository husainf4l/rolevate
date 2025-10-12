import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 10,
    });
    console.log('OpenAI response:', completion.choices[0]?.message?.content);
    console.log('✅ OpenAI API is working');
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
  }
}

testOpenAI();