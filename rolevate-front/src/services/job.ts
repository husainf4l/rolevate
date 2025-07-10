export interface JobAnalysisRequest {
  jobTitle: string;
  department: string;
  industry: string;
  employeeType: string;
  jobLevel: string;
  workType: string;
  location: string;
  country: string;
}

export interface JobAnalysisResponse {
  description: string;
  requirements: string;
  skills: string[];
  benefits: string;
  suggestedSalary?: string | undefined;
  industryInsights?: string | undefined;
  experienceLevel?: string | undefined;
  educationLevel?: string | undefined;
}

export class JobService {
  private static baseUrl = 'http://localhost:4005'; // Backend URL

  /**
   * Generate job analysis using AI
   */
  static async generateJobAnalysis(request: JobAnalysisRequest): Promise<JobAnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/api/aiautocomplete/job-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate job analysis' }));
      throw new Error(error.message || 'Failed to generate job analysis');
    }

    const data = await response.json();
    
    // Helper function to map AI experience level to form values
    const mapExperienceLevel = (aiExperience: string): string => {
      if (!aiExperience) return '';
      const experienceText = aiExperience.toLowerCase();
      if (experienceText.includes('0-1') || experienceText.includes('entry')) return '0-1 years';
      if (experienceText.includes('1-3') || experienceText.includes('2-4')) return '1-3 years';
      if (experienceText.includes('3-5') || experienceText.includes('4-6')) return '3-5 years';
      if (experienceText.includes('5-7') || experienceText.includes('6-8')) return '5-7 years';
      if (experienceText.includes('7+') || experienceText.includes('8+') || experienceText.includes('senior')) return '7+ years';
      return '1-3 years'; // default
    };

    // Helper function to map AI education requirements to form values
    const mapEducationLevel = (aiEducation: string[]): string => {
      if (!aiEducation || aiEducation.length === 0) return '';
      const educationText = aiEducation.join(' ').toLowerCase();
      if (educationText.includes('phd') || educationText.includes('doctorate')) return 'PhD';
      if (educationText.includes('master')) return "Master's Degree";
      if (educationText.includes('bachelor')) return "Bachelor's Degree";
      if (educationText.includes('certification') || educationText.includes('certificate')) return 'Professional Certification';
      if (educationText.includes('high school') || educationText.includes('secondary')) return 'High School';
      return "Bachelor's Degree"; // default for professional roles
    };

    // Map the backend response to the expected frontend format
    return {
      description: data.jobRequirements?.description || '',
      requirements: data.jobRequirements?.qualifications?.length > 0 ? 
        '• ' + data.jobRequirements.qualifications.join('\n• ') : '',
      skills: data.jobRequirements?.requiredSkills || [],
      benefits: data.jobRequirements?.benefitsAndPerks?.length > 0 ? 
        '• ' + data.jobRequirements.benefitsAndPerks.join('\n• ') : '',
      suggestedSalary: data.salaryRange ? 
        `${data.salaryRange.currency} ${data.salaryRange.min.toLocaleString()} - ${data.salaryRange.max.toLocaleString()}` : 
        undefined,
      industryInsights: data.insights?.length > 0 ? data.insights.join('\n\n') : undefined,
      experienceLevel: mapExperienceLevel(data.experienceLevel || ''),
      educationLevel: mapEducationLevel(data.educationRequirements || []),
    };
  }

  /**
   * Rewrite job description using AI
   */
  static async rewriteJobDescription(currentDescription: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/aiautocomplete/rewrite-job-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ description: currentDescription }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to rewrite job description' }));
      throw new Error(error.message || 'Failed to rewrite job description');
    }

    const data = await response.json();
    return data.rewrittenDescription || data.description || currentDescription;
  }

  /**
   * Rewrite job requirements using AI
   */
  static async rewriteJobRequirements(currentRequirements: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/aiautocomplete/rewrite-requirements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ requirements: currentRequirements }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to rewrite job requirements' }));
      throw new Error(error.message || 'Failed to rewrite job requirements');
    }

    const data = await response.json();
    return data.polishedRequirements || data.rewrittenRequirements || data.requirements || currentRequirements;
  }

  /**
   * Rewrite job title using AI
   */
  static async rewriteJobTitle(currentTitle: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/aiautocomplete/rewrite-job-title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ title: currentTitle }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to rewrite job title' }));
      throw new Error(error.message || 'Failed to rewrite job title');
    }

    const data = await response.json();
    return data.rewrittenTitle || data.title || currentTitle;
  }
}
