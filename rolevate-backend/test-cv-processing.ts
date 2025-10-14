import * as dotenv from 'dotenv';
import { CvParsingService } from './src/services/cv-parsing.service';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

async function testCVProcessing() {
  console.log('🧪 Testing CV Processing for Existing CV...');

  const prisma = new PrismaClient();
  
  try {
    // Get the CV that was uploaded
    const cv = await prisma.cV.findFirst({
      where: { 
        candidateId: 'cmgox9p1d000cj6ddoptxzu7d',
        isActive: true 
      },
      orderBy: { uploadedAt: 'desc' }
    });

    if (!cv) {
      console.log('❌ No active CV found for the candidate');
      return;
    }

    console.log('📄 Found CV:', {
      id: cv.id,
      fileName: cv.fileName,
      status: cv.status,
      url: cv.fileUrl
    });

    // Process the CV
    const cvService = new CvParsingService();
    console.log('🔍 Processing CV:', cv.fileUrl);

    const candidateInfo = await cvService.extractCandidateInfoFromCV(cv.fileUrl);

    console.log('✅ CV Processing Complete!');
    console.log('📋 Extracted Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Name: ${candidateInfo.firstName} ${candidateInfo.lastName}`);
    console.log(`📧 Email: ${candidateInfo.email}`);
    console.log(`📞 Phone: ${candidateInfo.phone || 'Not found'}`);
    console.log(`💼 Current Job: ${candidateInfo.currentJobTitle || 'Not specified'}`);
    console.log(`🏢 Current Company: ${candidateInfo.currentCompany || 'Not specified'}`);
    console.log(`📅 Experience: ${candidateInfo.totalExperience ? candidateInfo.totalExperience + ' years' : 'Not specified'}`);
    console.log(`🎓 Education: ${candidateInfo.education || 'Not specified'}`);
    console.log(`📝 Summary: ${candidateInfo.summary || 'Not available'}`);

    if (candidateInfo.skills && candidateInfo.skills.length > 0) {
      console.log('🛠️ Skills:');
      candidateInfo.skills.forEach((skill, index) => {
        console.log(`   ${index + 1}. ${skill}`);
      });
    } else {
      console.log('🛠️ Skills: Not extracted');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Update the CV record
    await prisma.cV.update({
      where: { id: cv.id },
      data: {
        status: 'PROCESSED',
        extractedData: candidateInfo as any,
        processedAt: new Date(),
      },
    });

    console.log('✅ CV record updated in database');

    // Update candidate profile
    const updateData: any = {};
    
    if (candidateInfo.currentJobTitle) updateData.currentJobTitle = candidateInfo.currentJobTitle;
    if (candidateInfo.currentCompany) updateData.currentCompany = candidateInfo.currentCompany;
    if (candidateInfo.totalExperience !== null && candidateInfo.totalExperience !== undefined) {
      updateData.totalExperience = candidateInfo.totalExperience;
    }
    if (candidateInfo.skills && candidateInfo.skills.length > 0) updateData.skills = candidateInfo.skills;
    if (candidateInfo.education) updateData.highestEducation = candidateInfo.education;
    if (candidateInfo.summary) updateData.profileSummary = candidateInfo.summary;

    if (Object.keys(updateData).length > 0) {
      await prisma.candidateProfile.update({
        where: { id: cv.candidateId },
        data: updateData,
      });
      console.log('✅ Candidate profile updated:', updateData);
    } else {
      console.log('ℹ️ No profile updates needed');
    }

  } catch (error) {
    console.error('❌ CV Processing Failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCVProcessing();
