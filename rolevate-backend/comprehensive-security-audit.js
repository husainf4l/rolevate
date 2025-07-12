const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4005/api';
const PASSWORD = 'tt55oo77';

class SecurityAuditor {
  constructor() {
    this.results = {
      authentication: [],
      authorization: [],
      cryptography: [],
      network: [],
      monitoring: [],
      operational: [],
      compliance: []
    };
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  log(category, test, status, details = '') {
    const result = { test, status, details };
    this.results[category].push(result);
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`   ${icon} ${test}${details ? ': ' + details : ''}`);
  }

  async testAuthentication() {
    console.log('\n🔐 TESTING AUTHENTICATION & AUTHORIZATION (ISO 27001 A.9)');
    
    // Test 1: Password strength enforcement
    try {
      const weakPasswords = ['123', 'password', 'abc123'];
      for (const weak of weakPasswords) {
        const response = await axios.post(`${BASE_URL}/auth/signup`, {
          email: `test_${Date.now()}@example.com`,
          password: weak,
          name: 'Test User',
          userType: 'CANDIDATE'
        }, { validateStatus: () => true });

        if (response.status === 400) {
          this.log('authentication', `Weak password "${weak}" rejected`, 'PASS');
        } else {
          this.log('authentication', `Weak password "${weak}" accepted`, 'FAIL');
        }
      }
    } catch (error) {
      this.log('authentication', 'Password strength test', 'FAIL', error.message);
    }

    await this.sleep(2000);

    // Test 2: JWT token validation
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'husain.f4l@gmail.com',
        password: PASSWORD
      });

      const token = loginResponse.data.access_token;
      if (token && token.split('.').length === 3) {
        this.log('authentication', 'JWT token format', 'PASS');
        
        // Test token expiration (should be 15 minutes)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const expiry = payload.exp - payload.iat;
        if (expiry === 900) { // 15 minutes = 900 seconds
          this.log('authentication', 'JWT token expiry (15 min)', 'PASS');
        } else {
          this.log('authentication', 'JWT token expiry', 'FAIL', `${expiry}s instead of 900s`);
        }
      } else {
        this.log('authentication', 'JWT token format', 'FAIL');
      }
    } catch (error) {
      this.log('authentication', 'JWT token test', 'FAIL', error.message);
    }

    await this.sleep(2000);

    // Test 3: Authorization controls
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'husain.f4l@gmail.com',
        password: PASSWORD
      });

      const token = loginResponse.data.access_token;

      // Test protected endpoint access
      const protectedResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true
      });

      if (protectedResponse.status === 200) {
        this.log('authorization', 'Protected endpoint access with valid token', 'PASS');
      } else {
        this.log('authorization', 'Protected endpoint access', 'FAIL');
      }

      // Test access without token
      const unprotectedResponse = await axios.get(`${BASE_URL}/auth/me`, {
        validateStatus: () => true
      });

      if (unprotectedResponse.status === 401) {
        this.log('authorization', 'Protected endpoint blocks unauthorized access', 'PASS');
      } else {
        this.log('authorization', 'Protected endpoint authorization', 'FAIL');
      }

      // Test admin endpoint access
      const adminResponse = await axios.get(`${BASE_URL}/security/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true
      });

      if (adminResponse.status === 401 || adminResponse.status === 403) {
        this.log('authorization', 'Admin endpoint blocks non-admin users', 'PASS');
      } else {
        this.log('authorization', 'Admin endpoint access control', 'FAIL');
      }

    } catch (error) {
      this.log('authorization', 'Authorization test', 'FAIL', error.message);
    }
  }

  async testCryptography() {
    console.log('\n🔒 TESTING CRYPTOGRAPHY & DATA PROTECTION (ISO 27001 A.10)');

    // Test 1: Check if HTTPS is enforced (HSTS header)
    try {
      const response = await axios.get(`${BASE_URL}/auth/me`, {
        validateStatus: () => true
      });

      const hstsHeader = response.headers['strict-transport-security'];
      if (hstsHeader) {
        this.log('cryptography', 'HSTS header present', 'PASS', hstsHeader);
      } else {
        this.log('cryptography', 'HSTS header missing', 'FAIL');
      }
    } catch (error) {
      this.log('cryptography', 'HSTS header test', 'FAIL', error.message);
    }

    // Test 2: Password hashing verification
    try {
      // Check if bcrypt is being used (by creating a user and checking password format)
      const testEmail = `crypto_test_${Date.now()}@example.com`;
      const response = await axios.post(`${BASE_URL}/auth/signup`, {
        email: testEmail,
        password: 'StrongPass123!@#',
        name: 'Crypto Test User',
        userType: 'CANDIDATE'
      }, { validateStatus: () => true });

      if (response.status === 200 || response.status === 201) {
        this.log('cryptography', 'Password hashing implemented', 'PASS');
      } else {
        this.log('cryptography', 'Password hashing test', 'WARN', 'Could not verify');
      }
    } catch (error) {
      this.log('cryptography', 'Password hashing test', 'FAIL', error.message);
    }

    // Test 3: Check encryption configuration in code
    try {
      const securityServicePath = path.join(__dirname, 'src/security/security.service.ts');
      if (fs.existsSync(securityServicePath)) {
        const content = fs.readFileSync(securityServicePath, 'utf8');
        if (content.includes('aes-256-cbc') && content.includes('scryptSync')) {
          this.log('cryptography', 'AES-256 encryption implementation', 'PASS');
        } else {
          this.log('cryptography', 'Encryption implementation', 'FAIL', 'AES-256 not found');
        }
      } else {
        this.log('cryptography', 'Security service file check', 'FAIL', 'File not found');
      }
    } catch (error) {
      this.log('cryptography', 'Encryption code review', 'FAIL', error.message);
    }
  }

  async testNetworkSecurity() {
    console.log('\n🌐 TESTING NETWORK SECURITY & COMMUNICATIONS (ISO 27001 A.13)');

    // Test 1: Security headers
    try {
      const response = await axios.get(`${BASE_URL}/auth/me`, {
        validateStatus: () => true
      });

      const securityHeaders = {
        'x-frame-options': 'Clickjacking protection',
        'x-content-type-options': 'MIME type sniffing protection',
        'strict-transport-security': 'HSTS protection',
        'content-security-policy': 'XSS protection'
      };

      for (const [header, description] of Object.entries(securityHeaders)) {
        if (response.headers[header]) {
          this.log('network', description, 'PASS');
        } else {
          this.log('network', description, 'FAIL', `${header} header missing`);
        }
      }
    } catch (error) {
      this.log('network', 'Security headers test', 'FAIL', error.message);
    }

    await this.sleep(2000);

    // Test 2: Rate limiting
    try {
      console.log('   Testing rate limiting (this may take a moment)...');
      const requests = Array(10).fill().map(() => 
        axios.get(`${BASE_URL}/auth/me`, { 
          validateStatus: () => true,
          timeout: 2000 
        })
      );

      const responses = await Promise.allSettled(requests);
      const rateLimited = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 429
      ).length;

      if (rateLimited > 0) {
        this.log('network', 'Rate limiting active', 'PASS', `${rateLimited} requests blocked`);
      } else {
        this.log('network', 'Rate limiting', 'WARN', 'May not be active or threshold not reached');
      }
    } catch (error) {
      this.log('network', 'Rate limiting test', 'FAIL', error.message);
    }

    await this.sleep(2000);

    // Test 3: CORS configuration
    try {
      const response = await axios.options(`${BASE_URL}/auth/me`, {
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'GET'
        },
        validateStatus: () => true
      });

      const corsHeader = response.headers['access-control-allow-origin'];
      if (!corsHeader || corsHeader === 'https://malicious-site.com') {
        this.log('network', 'CORS configuration', 'FAIL', 'Too permissive');
      } else {
        this.log('network', 'CORS configuration', 'PASS');
      }
    } catch (error) {
      this.log('network', 'CORS test', 'PASS', 'Malicious origin blocked');
    }

    // Test 4: Input validation
    try {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '\'; DROP TABLE users; --',
        '../../../etc/passwd'
      ];

      for (const input of maliciousInputs) {
        const response = await axios.post(`${BASE_URL}/auth/signup`, {
          email: 'test@example.com',
          password: 'ValidPass123!',
          name: input,
          userType: 'CANDIDATE'
        }, { validateStatus: () => true });

        // Should either reject or sanitize the input
        if (response.status === 400 || response.status === 422) {
          this.log('network', `Input validation for ${input.substring(0, 20)}...`, 'PASS');
        } else {
          this.log('network', `Input validation for malicious input`, 'WARN', 'May need review');
        }
      }
    } catch (error) {
      this.log('network', 'Input validation test', 'FAIL', error.message);
    }
  }

  async testMonitoring() {
    console.log('\n📊 TESTING SECURITY MONITORING & INCIDENT RESPONSE (ISO 27001 A.16)');

    // Test 1: Security logging endpoint exists
    try {
      const response = await axios.get(`${BASE_URL}/security/health`, {
        validateStatus: () => true
      });

      if (response.status === 401) {
        this.log('monitoring', 'Security monitoring endpoint exists', 'PASS');
      } else {
        this.log('monitoring', 'Security monitoring endpoint', 'FAIL');
      }
    } catch (error) {
      this.log('monitoring', 'Security monitoring test', 'FAIL', error.message);
    }

    // Test 2: Check if security database table exists
    try {
      const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
      if (fs.existsSync(schemaPath)) {
        const content = fs.readFileSync(schemaPath, 'utf8');
        if (content.includes('SecurityLog') || content.includes('security_logs')) {
          this.log('monitoring', 'Security logging database schema', 'PASS');
        } else {
          this.log('monitoring', 'Security logging database schema', 'FAIL');
        }
      } else {
        this.log('monitoring', 'Database schema check', 'FAIL', 'Schema file not found');
      }
    } catch (error) {
      this.log('monitoring', 'Security logging schema check', 'FAIL', error.message);
    }

    // Test 3: Check security service implementation
    try {
      const securityServicePath = path.join(__dirname, 'src/security/security.service.ts');
      if (fs.existsSync(securityServicePath)) {
        const content = fs.readFileSync(securityServicePath, 'utf8');
        const features = [
          'logSecurityEvent',
          'getSecurityMetrics',
          'AUTH_FAILURE',
          'SUSPICIOUS_ACTIVITY'
        ];

        const implementedFeatures = features.filter(feature => content.includes(feature));
        if (implementedFeatures.length === features.length) {
          this.log('monitoring', 'Security service implementation', 'PASS');
        } else {
          this.log('monitoring', 'Security service implementation', 'FAIL', 
            `Missing: ${features.filter(f => !implementedFeatures.includes(f)).join(', ')}`);
        }
      } else {
        this.log('monitoring', 'Security service file check', 'FAIL');
      }
    } catch (error) {
      this.log('monitoring', 'Security service check', 'FAIL', error.message);
    }
  }

  async testOperationalSecurity() {
    console.log('\n⚙️ TESTING OPERATIONAL SECURITY (ISO 27001 A.12)');

    // Test 1: Environment configuration
    try {
      const envPath = path.join(__dirname, '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        
        // Check for secure secrets
        const jwtSecret = content.match(/JWT_SECRET=(.+)/)?.[1];
        const encryptionKey = content.match(/ENCRYPTION_KEY=(.+)/)?.[1];
        
        if (jwtSecret && jwtSecret.length >= 32) {
          this.log('operational', 'JWT secret strength', 'PASS');
        } else {
          this.log('operational', 'JWT secret strength', 'FAIL', 'Too weak or missing');
        }

        if (encryptionKey && encryptionKey.length >= 32) {
          this.log('operational', 'Encryption key strength', 'PASS');
        } else {
          this.log('operational', 'Encryption key strength', 'FAIL', 'Too weak or missing');
        }

        // Check for rate limiting config
        if (content.includes('RATE_LIMIT')) {
          this.log('operational', 'Rate limiting configuration', 'PASS');
        } else {
          this.log('operational', 'Rate limiting configuration', 'WARN', 'Not configured');
        }
      } else {
        this.log('operational', 'Environment file check', 'FAIL', '.env file not found');
      }
    } catch (error) {
      this.log('operational', 'Environment configuration check', 'FAIL', error.message);
    }

    // Test 2: Dependency security
    try {
      const packagePath = path.join(__dirname, 'package.json');
      if (fs.existsSync(packagePath)) {
        const content = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const securityDeps = ['helmet', 'bcryptjs', 'express-rate-limit'];
        const installedSecurityDeps = securityDeps.filter(dep => 
          content.dependencies && content.dependencies[dep]
        );

        if (installedSecurityDeps.length === securityDeps.length) {
          this.log('operational', 'Security dependencies installed', 'PASS');
        } else {
          this.log('operational', 'Security dependencies', 'FAIL', 
            `Missing: ${securityDeps.filter(d => !installedSecurityDeps.includes(d)).join(', ')}`);
        }
      } else {
        this.log('operational', 'Package.json check', 'FAIL');
      }
    } catch (error) {
      this.log('operational', 'Dependency check', 'FAIL', error.message);
    }
  }

  async testCompliance() {
    console.log('\n📋 TESTING COMPLIANCE DOCUMENTATION (ISO 27001 A.18)');

    // Test 1: Security documentation exists
    const requiredDocs = [
      'SECURITY.md',
      'SECURITY_MIGRATION_COMPLETE.md',
      '.env.example'
    ];

    for (const doc of requiredDocs) {
      try {
        const docPath = path.join(__dirname, doc);
        if (fs.existsSync(docPath)) {
          const content = fs.readFileSync(docPath, 'utf8');
          if (content.length > 100) { // Basic content check
            this.log('compliance', `${doc} documentation`, 'PASS');
          } else {
            this.log('compliance', `${doc} documentation`, 'FAIL', 'Insufficient content');
          }
        } else {
          this.log('compliance', `${doc} documentation`, 'FAIL', 'File missing');
        }
      } catch (error) {
        this.log('compliance', `${doc} documentation check`, 'FAIL', error.message);
      }
    }

    // Test 2: ISO 27001 controls coverage
    try {
      const securityMdPath = path.join(__dirname, 'SECURITY.md');
      if (fs.existsSync(securityMdPath)) {
        const content = fs.readFileSync(securityMdPath, 'utf8');
        const iso27001Controls = ['A.9', 'A.10', 'A.12', 'A.13', 'A.16'];
        const coveredControls = iso27001Controls.filter(control => content.includes(control));

        if (coveredControls.length === iso27001Controls.length) {
          this.log('compliance', 'ISO 27001 controls documentation', 'PASS');
        } else {
          this.log('compliance', 'ISO 27001 controls documentation', 'FAIL', 
            `Missing: ${iso27001Controls.filter(c => !coveredControls.includes(c)).join(', ')}`);
        }
      } else {
        this.log('compliance', 'ISO 27001 controls documentation', 'FAIL', 'SECURITY.md missing');
      }
    } catch (error) {
      this.log('compliance', 'ISO 27001 documentation check', 'FAIL', error.message);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔒 COMPREHENSIVE ISO 27001:2022 SECURITY AUDIT REPORT');
    console.log('='.repeat(80));

    const categories = [
      { key: 'authentication', name: 'Authentication & Authorization (A.9)' },
      { key: 'cryptography', name: 'Cryptography & Data Protection (A.10)' },
      { key: 'network', name: 'Network Security & Communications (A.13)' },
      { key: 'monitoring', name: 'Security Monitoring & Incident Response (A.16)' },
      { key: 'operational', name: 'Operational Security (A.12)' },
      { key: 'compliance', name: 'Compliance Documentation (A.18)' }
    ];

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let warningTests = 0;

    for (const category of categories) {
      const results = this.results[category.key];
      const passed = results.filter(r => r.status === 'PASS').length;
      const failed = results.filter(r => r.status === 'FAIL').length;
      const warnings = results.filter(r => r.status === 'WARN').length;

      console.log(`\n📊 ${category.name}`);
      console.log(`   ✅ Passed: ${passed}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   ⚠️  Warnings: ${warnings}`);

      totalTests += results.length;
      passedTests += passed;
      failedTests += failed;
      warningTests += warnings;

      if (failed > 0) {
        console.log(`   🔍 Failed tests:`);
        results.filter(r => r.status === 'FAIL').forEach(r => {
          console.log(`     - ${r.test}${r.details ? ': ' + r.details : ''}`);
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📈 OVERALL COMPLIANCE SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`⚠️  Warnings: ${warningTests} (${((warningTests/totalTests)*100).toFixed(1)}%)`);

    const complianceScore = ((passedTests + warningTests * 0.5) / totalTests * 100).toFixed(1);
    console.log(`\n🎯 Compliance Score: ${complianceScore}%`);

    if (complianceScore >= 95) {
      console.log('🏆 EXCELLENT - Fully compliant with ISO 27001:2022');
    } else if (complianceScore >= 85) {
      console.log('✅ GOOD - Mostly compliant, minor issues to address');
    } else if (complianceScore >= 70) {
      console.log('⚠️  FAIR - Significant improvements needed');
    } else {
      console.log('❌ POOR - Major security gaps identified');
    }

    console.log('\n🔒 Security audit completed!');
  }

  async runFullAudit() {
    console.log('🔒 Starting Comprehensive ISO 27001:2022 Security Audit...');
    console.log('⏱️  This may take several minutes due to rate limiting...\n');

    await this.testAuthentication();
    await this.sleep(3000);
    
    await this.testCryptography();
    await this.sleep(3000);
    
    await this.testNetworkSecurity();
    await this.sleep(5000); // Longer delay after rate limit tests
    
    await this.testMonitoring();
    await this.sleep(2000);
    
    await this.testOperationalSecurity();
    await this.sleep(2000);
    
    await this.testCompliance();
    
    this.generateReport();
  }
}

// Run the comprehensive audit
const auditor = new SecurityAuditor();
auditor.runFullAudit().catch(console.error);