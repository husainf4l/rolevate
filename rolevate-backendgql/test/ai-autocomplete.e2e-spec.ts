import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import request from 'supertest';
import { App } from 'supertest/types';
import { AIAutocompleteTestModule } from './ai-autocomplete-test.module';

describe('AI Autocomplete Service (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AIAutocompleteTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configure GraphQL for testing
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Company Description Generation', () => {
    it('should generate company description', () => {
      const query = `
        mutation GenerateCompanyDescription($input: CompanyDescriptionRequestDto!) {
          generateCompanyDescription(input: $input) {
            generatedDescription
          }
        }
      `;

      const variables = {
        input: {
          companyName: "TechCorp",
          industry: "Technology",
          location: "San Francisco",
          country: "USA",
          numberOfEmployees: "50-100",
          currentDescription: "A software company",
          website: "https://techcorp.com"
        }
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query, variables })
        .expect((res) => {
          console.log('Response:', res.body); // Debug log
          expect(res.status).toBe(200);
          expect(res.body.data.generateCompanyDescription).toBeDefined();
          expect(res.body.data.generateCompanyDescription.generatedDescription).toBeDefined();
          expect(typeof res.body.data.generateCompanyDescription.generatedDescription).toBe('string');
          expect(res.body.data.generateCompanyDescription.generatedDescription.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Salary Recommendation', () => {
    it('should generate salary recommendation', () => {
      const query = `
        mutation GenerateSalaryRecommendation($input: SalaryRecommendationRequestDto!) {
          generateSalaryRecommendation(input: $input) {
            jobTitle
            department
            industry
            location
            workType
            salaryRange {
              min
              max
              currency
              period
            }
            averageSalary
            salaryMethodology
            jobRequirements {
              description
              shortDescription
              keyResponsibilities
              qualifications
              requiredSkills
              benefitsAndPerks
            }
            experienceLevel
            educationRequirements
            sources {
              name
              url
              methodology
              dataPoints
              lastUpdated
              region
              salaryRange {
                min
                max
                currency
              }
            }
            insights
            lastUpdated
            disclaimer
          }
        }
      `;

      const variables = {
        input: {
          jobTitle: "Software Engineer",
          department: "Engineering",
          industry: "Technology",
          employeeType: "Full-time",
          jobLevel: "Mid-level",
          workType: "Remote",
          location: "San Francisco",
          country: "USA"
        }
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query, variables })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.generateSalaryRecommendation).toBeDefined();
          const data = res.body.data.generateSalaryRecommendation;
          expect(data.jobTitle).toBe('Software Engineer');
          expect(data.salaryRange).toBeDefined();
          expect(data.salaryRange.min).toBeDefined();
          expect(data.salaryRange.max).toBeDefined();
          expect(data.averageSalary).toBeDefined();
          expect(data.sources).toBeDefined();
          expect(Array.isArray(data.sources)).toBe(true);
        });
    });
  });

  describe('Job Title Rewrite', () => {
    it('should rewrite job title', () => {
      const query = `
        mutation RewriteJobTitle($input: JobTitleRewriteRequestDto!) {
          rewriteJobTitle(input: $input) {
            jobTitle
            department
          }
        }
      `;

      const variables = {
        input: {
          jobTitle: "Coder",
          industry: "Technology",
          company: "TechCorp",
          jobLevel: "Senior"
        }
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query, variables })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.rewriteJobTitle).toBeDefined();
          const data = res.body.data.rewriteJobTitle;
          expect(data.jobTitle).toBeDefined();
          expect(data.department).toBeDefined();
          expect(typeof data.jobTitle).toBe('string');
          expect(typeof data.department).toBe('string');
        });
    });
  });

  describe('Job Description Rewrite', () => {
    it('should rewrite job description', () => {
      const query = `
        mutation RewriteJobDescription($input: JobDescriptionRewriteInput!) {
          rewriteJobDescription(input: $input) {
            rewrittenDescription
            rewrittenShortDescription
          }
        }
      `;

      const variables = {
        input: {
          jobDescription: "We need someone who can code and work with teams. Must have experience with JavaScript and be able to solve problems quickly."
        }
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query, variables })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.rewriteJobDescription).toBeDefined();
          const data = res.body.data.rewriteJobDescription;
          expect(data.rewrittenDescription).toBeDefined();
          expect(data.rewrittenShortDescription).toBeDefined();
          expect(typeof data.rewrittenDescription).toBe('string');
          expect(typeof data.rewrittenShortDescription).toBe('string');
        });
    });
  });

  describe('Requirements Polish', () => {
    it('should polish job requirements', () => {
      const query = `
        mutation PolishRequirements($input: RequirementsPolishRequestDto!) {
          polishRequirements(input: $input) {
            polishedRequirements
          }
        }
      `;

      const variables = {
        input: {
          requirements: "Need someone who knows React, Node.js, and can work long hours. Should have a degree in computer science."
        }
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query, variables })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.polishRequirements).toBeDefined();
          const data = res.body.data.polishRequirements;
          expect(data.polishedRequirements).toBeDefined();
          expect(typeof data.polishedRequirements).toBe('string');
        });
    });
  });

  describe('Benefits Polish', () => {
    it('should polish benefits section', () => {
      const query = `
        mutation PolishBenefits($input: BenefitsPolishRequestDto!) {
          polishBenefits(input: $input) {
            polishedBenefits
          }
        }
      `;

      const variables = {
        input: {
          benefits: "Health insurance, paid time off, free lunch, flexible hours",
          industry: "Technology",
          jobLevel: "Mid-level",
          company: "TechCorp"
        }
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query, variables })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.polishBenefits).toBeDefined();
          const data = res.body.data.polishBenefits;
          expect(data.polishedBenefits).toBeDefined();
          expect(typeof data.polishedBenefits).toBe('string');
        });
    });
  });

  describe('Responsibilities Polish', () => {
    it('should polish responsibilities section', () => {
      const query = `
        mutation PolishResponsibilities($input: ResponsibilitiesPolishRequestDto!) {
          polishResponsibilities(input: $input) {
            polishedResponsibilities
          }
        }
      `;

      const variables = {
        input: {
          responsibilities: "Write code, fix bugs, attend meetings, help junior developers",
          industry: "Technology",
          jobLevel: "Senior",
          jobTitle: "Software Engineer",
          company: "TechCorp"
        }
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query, variables })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.polishResponsibilities).toBeDefined();
          const data = res.body.data.polishResponsibilities;
          expect(data.polishedResponsibilities).toBeDefined();
          expect(typeof data.polishedResponsibilities).toBe('string');
        });
    });
  });

  describe('About Company Polish', () => {
    it('should polish about company section', () => {
      const query = `
        mutation PolishAboutCompany($input: AboutCompanyPolishRequestDto!) {
          polishAboutCompany(input: $input) {
            polishedAboutCompany
          }
        }
      `;

      const variables = {
        input: {
          aboutCompany: "We are a software company that makes apps. We have been around for 5 years and have good clients.",
          industry: "Technology",
          companyName: "TechCorp",
          location: "San Francisco"
        }
      };

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query, variables })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.polishAboutCompany).toBeDefined();
          const data = res.body.data.polishAboutCompany;
          expect(data.polishedAboutCompany).toBeDefined();
          expect(typeof data.polishedAboutCompany).toBe('string');
          expect(data.polishedAboutCompany.length).toBeLessThanOrEqual(800);
        });
    });
  });
});
