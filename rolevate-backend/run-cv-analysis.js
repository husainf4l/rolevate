const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

async function runCVAnalysisForCandidate() {
  try {
    console.log('🔍 Running CV Analysis for candidate...');
    
    // Get the application and candidate info
    const application = await prisma.application.findFirst({
      where: {
        jobId: 'cmcxmffqf000diuc17tbhwwiy',
        candidate: {
          phone: {
            contains: '962796026659'
          }
        }
      },
      include: {
        candidate: {
          include: {
            cvs: {
              where: { isActive: true },
              take: 1
            }
          }
        },
        job: {
          include: {
            company: true
          }
        }
      }
    });

    if (!application) {
      console.error('❌ Application not found');
      return;
    }

    if (!application.candidate.cvs || application.candidate.cvs.length === 0) {
      console.error('❌ No CV found for candidate');
      return;
    }

    const cv = application.candidate.cvs[0];
    console.log('📄 Found CV:', cv.fileName);
    console.log('📍 CV URL:', cv.fileUrl);

    // Convert URL to local file path
    const cvLocalPath = cv.fileUrl.replace('http://localhost:4005/api/', './');
    console.log('📁 Local CV path:', cvLocalPath);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(cvLocalPath)) {
      console.error('❌ CV file not found at:', cvLocalPath);
      return;
    }

    console.log('✅ CV file exists, running analysis...');

    // Import the CV analysis service
    const { OpenaiCvAnalysisService } = require('./dist/src/services/openai-cv-analysis.service');
    const cvAnalysisService = new OpenaiCvAnalysisService();

    // Prepare job data for analysis
    const jobData = {
      title: application.job.title,
      department: application.job.department,
      company: { name: application.job.company.name },
      location: application.job.location,
      skills: application.job.skills,
      experience: application.job.experience,
      education: application.job.education,
      jobLevel: application.job.jobLevel,
      workType: application.job.workType,
      description: application.job.description,
      requirements: application.job.requirements,
      responsibilities: application.job.responsibilities
    };

    // Analysis prompt
    const analysisPrompt = application.job.cvAnalysisPrompt || `
    Analyze this candidate's CV for the ${application.job.title} position. 
    Focus on:
    1. Relevant experience and skills
    2. Education and qualifications
    3. Overall fit for the role
    4. Strengths and areas for improvement
    
    Provide specific examples from the CV content.`;

    console.log('🤖 Running OpenAI CV analysis...');
    
    // Run the analysis
    const analysisResult = await cvAnalysisService.analyzeCVWithOpenAI(
      cvLocalPath,
      analysisPrompt,
      jobData
    );

    console.log('✅ CV Analysis completed:');
    console.log('📊 Score:', analysisResult.score);
    console.log('📝 Summary:', analysisResult.summary);
    console.log('🎯 Overall Fit:', analysisResult.overallFit);
    console.log('💪 Strengths:', analysisResult.strengths);
    console.log('⚠️ Weaknesses:', analysisResult.weaknesses);

    // Update the application with new analysis results
    await prisma.application.update({
      where: { id: application.id },
      data: {
        cvAnalysisResults: analysisResult
      }
    });

    console.log('✅ CV analysis results saved to database');
    console.log('🎉 Ready for interview room creation!');

  } catch (error) {
    console.error('❌ Error running CV analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runCVAnalysisForCandidate();
