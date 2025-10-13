import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { CvParsingService } from './src/services/cv-parsing.service';

// Load environment variables
dotenv.config();

async function testLocalCV() {
  console.log('🧪 Testing CV Processing with Local PDF File...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const cvPath = './CV Sahar Remawe -2025.pdf';

  try {
    // Read the PDF file
    console.log('📄 Reading local PDF file:', cvPath);
    const fileBuffer = fs.readFileSync(cvPath);
    console.log('✅ File loaded, size:', fileBuffer.length, 'bytes');

    // Create CV parsing service
    const cvService = new CvParsingService();
    
    // We need to test the PDF extraction directly
    console.log('\n🔍 Testing PDF text extraction...');
    
    // Use reflection to call private method for testing
    const extractFromPDF = (cvService as any).extractFromPDF.bind(cvService);
    const extractedText = await extractFromPDF(fileBuffer);
    
    console.log('✅ PDF text extracted successfully!');
    console.log('📊 Text length:', extractedText.length, 'characters');
    console.log('\n📄 First 500 characters of extracted text:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(extractedText.substring(0, 500));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Now test full candidate info extraction
    console.log('🤖 Extracting candidate information with AI...\n');
    
    // Create a mock method to test with buffer
    const extractTextFromBuffer = (cvService as any).extractTextFromBuffer.bind(cvService);
    const cvText = await extractTextFromBuffer(fileBuffer, 'test.pdf');
    
    console.log('✅ Text extraction complete, length:', cvText.length);
    
    // Build the AI prompt manually to extract candidate info
    const OpenAI = require('openai').default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `You are a world-class AI CV parser. Extract candidate information from this CV text.

CV Text:
${cvText}

Return ONLY a valid JSON object with:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string or null",
  "currentJobTitle": "string or null",
  "currentCompany": "string or null",
  "totalExperience": number or null,
  "skills": ["skill1", "skill2"] or null,
  "education": "string or null",
  "summary": "string or null"
}`;

    console.log('🤖 Sending to OpenAI GPT-4o...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI CV parser. Extract structured data with high precision and return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.05,
      top_p: 0.1,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
    console.log('✅ AI response received\n');
    
    // Parse JSON
    let jsonStr = aiResponse.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const candidateInfo = JSON.parse(jsonStr);
    
    console.log('✨ EXTRACTED CANDIDATE INFORMATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Name: ${candidateInfo.firstName} ${candidateInfo.lastName}`);
    console.log(`📧 Email: ${candidateInfo.email}`);
    console.log(`📞 Phone: ${candidateInfo.phone || 'Not found'}`);
    console.log(`💼 Current Job: ${candidateInfo.currentJobTitle || 'Not specified'}`);
    console.log(`🏢 Current Company: ${candidateInfo.currentCompany || 'Not specified'}`);
    console.log(`📅 Experience: ${candidateInfo.totalExperience ? candidateInfo.totalExperience + ' years' : 'Not specified'}`);
    console.log(`🎓 Education: ${candidateInfo.education || 'Not specified'}`);
    
    if (candidateInfo.summary) {
      console.log(`\n📝 Summary:\n${candidateInfo.summary}`);
    }
    
    if (candidateInfo.skills && candidateInfo.skills.length > 0) {
      console.log('\n🛠️  Skills:');
      candidateInfo.skills.forEach((skill: string, index: number) => {
        console.log(`   ${index + 1}. ${skill}`);
      });
    } else {
      console.log('\n🛠️  Skills: Not extracted');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ TEST COMPLETED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testLocalCV();
