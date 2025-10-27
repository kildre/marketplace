/**
 * Environment Isolation Validation Test Script
 * 
 * This script validates that the getDomainConfig() function properly isolates
 * environments and prevents cross-environment communication.
 */

import { getDomainConfig, validateEnvironmentIsolation } from './domain-config';

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

class EnvironmentValidator {
  private results: TestResult[] = [];

  /**
   * Run all validation tests for environment isolation
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Environment Isolation Validation Tests');
    console.log('=' .repeat(60));

    // Test 1: Basic configuration loading
    await this.testConfigurationLoading();

    // Test 2: Environment detection
    await this.testEnvironmentDetection();

    // Test 3: API endpoint isolation
    await this.testApiEndpointIsolation();

    // Test 4: Authentication configuration isolation
    await this.testAuthConfigIsolation();

    // Test 5: Network security validation
    await this.testNetworkSecurity();

    // Test 6: Cross-environment prevention
    await this.testCrossEnvironmentPrevention();

    // Test 7: URL construction validation
    await this.testUrlConstruction();

    this.printResults();
    return this.results;
  }

  private addResult(testName: string, passed: boolean, message: string, details?: any) {
    this.results.push({ testName, passed, message, details });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}: ${message}`);
    if (details && !passed) {
      console.log('   Details:', details);
    }
  }

  private async testConfigurationLoading() {
    try {
      const config = getDomainConfig();
      
      if (config && config.environment && config.api && config.auth) {
        this.addResult(
          'Configuration Loading',
          true,
          'getDomainConfig() returns valid configuration object',
          config
        );
      } else {
        this.addResult(
          'Configuration Loading',
          false,
          'getDomainConfig() returned incomplete configuration',
          config
        );
      }
    } catch (error) {
      this.addResult(
        'Configuration Loading',
        false,
        `getDomainConfig() threw error: ${error}`,
        error
      );
    }
  }

  private async testEnvironmentDetection() {
    const config = getDomainConfig();
    const hostname = window.location.hostname;
    
    let expectedEnv: string;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      expectedEnv = 'localhost';
    } else if (hostname.includes('il2') || hostname.includes('.mil.local')) {
      expectedEnv = 'IL-2';
    } else if (hostname.includes('il5') || hostname.includes('.cdao.us')) {
      expectedEnv = 'IL-5';
    } else {
      expectedEnv = 'unknown';
    }

    const detected = config.environment.name;
    this.addResult(
      'Environment Detection',
      detected === expectedEnv,
      `Detected: ${detected}, Expected: ${expectedEnv} (hostname: ${hostname})`,
      { detected, expected: expectedEnv, hostname }
    );
  }

  private async testApiEndpointIsolation() {
    const config = getDomainConfig();
    const envName = config.environment.name;
    const apiBaseUrl = config.api.baseUrl;

    let isIsolated = true;
    let message = '';

    switch (envName) {
      case 'localhost':
        // Localhost can point anywhere for development
        isIsolated = true;
        message = 'Localhost environment allows flexible API configuration';
        break;
        
      case 'IL-2':
        if (apiBaseUrl.includes('cdao.us') || apiBaseUrl.includes('localhost')) {
          isIsolated = false;
          message = 'IL-2 environment must not point to unclassified or localhost endpoints';
        } else {
          message = 'IL-2 API endpoints properly isolated to classified network';
        }
        break;
        
      case 'IL-5':
        if (apiBaseUrl.includes('.mil.local') || apiBaseUrl.includes('localhost')) {
          isIsolated = false;
          message = 'IL-5 environment must not point to classified or localhost endpoints';
        } else {
          message = 'IL-5 API endpoints properly isolated to unclassified network';
        }
        break;
        
      default:
        message = `Unknown environment ${envName} - cannot validate isolation`;
    }

    this.addResult('API Endpoint Isolation', isIsolated, message, {
      environment: envName,
      apiBaseUrl,
      endpoints: config.api.endpoints
    });
  }

  private async testAuthConfigIsolation() {
    const config = getDomainConfig();
    const validation = validateEnvironmentIsolation();

    const authIssues = validation.issues.filter(issue => 
      issue.includes('Auth') || issue.includes('bypass')
    );

    this.addResult(
      'Authentication Isolation',
      authIssues.length === 0,
      authIssues.length === 0 ? 
        'Authentication configuration properly isolated' : 
        `Authentication issues found: ${authIssues.join(', ')}`,
      { 
        authConfig: config.auth,
        issues: authIssues,
        warnings: validation.warnings
      }
    );
  }

  private async testNetworkSecurity() {
    const config = getDomainConfig();
    const allowedDomains = config.networking.allowedDomains;
    
    const hasAllowedDomains = allowedDomains && allowedDomains.length > 0;
    const corsConfig = config.networking.corsEnabled;

    // CORS should only be enabled in localhost
    const corsAppropriate = config.environment.name === 'localhost' || !corsConfig;

    this.addResult(
      'Network Security Configuration',
      hasAllowedDomains && corsAppropriate,
      hasAllowedDomains ? 
        'Network security properly configured' : 
        'Missing allowed domains configuration',
      {
        allowedDomains,
        corsEnabled: corsConfig,
        environment: config.environment.name
      }
    );
  }

  private async testCrossEnvironmentPrevention() {
    const config = getDomainConfig();
    const validation = validateEnvironmentIsolation();

    this.addResult(
      'Cross-Environment Prevention',
      validation.isValid,
      validation.isValid ? 
        'No cross-environment configuration detected' : 
        `Cross-environment issues: ${validation.issues.join(', ')}`,
      {
        isValid: validation.isValid,
        issues: validation.issues,
        warnings: validation.warnings
      }
    );
  }

  private async testUrlConstruction() {
    const config = getDomainConfig();
    let allUrlsValid = true;
    const invalidUrls: string[] = [];

    // Test each endpoint URL
    Object.entries(config.api.endpoints).forEach(([name, url]) => {
      try {
        // Attempt to construct URL to validate format
        if (url.startsWith('/')) {
          // Relative URL - needs base URL
          if (!config.api.baseUrl) {
            // This is OK for proxy setup
            return;
          }
          new globalThis.URL(url, config.api.baseUrl);
        } else {
          // Absolute URL
          new globalThis.URL(url);
        }
      } catch {
        allUrlsValid = false;
        invalidUrls.push(`${name}: ${url}`);
      }
    });

    this.addResult(
      'URL Construction Validation',
      allUrlsValid,
      allUrlsValid ? 
        'All endpoint URLs are valid' : 
        `Invalid URLs found: ${invalidUrls.join(', ')}`,
      {
        endpoints: config.api.endpoints,
        invalidUrls
      }
    );
  }

  private printResults() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('=' .repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log(`Tests Passed: ${passed}/${total} (${passRate}%)`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Environment isolation is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Review the failing tests above.');
      console.log('\nFailed tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`   - ${r.testName}: ${r.message}`));
    }

    console.log('\n💡 To run this validation:');
    console.log('   1. Open browser dev console');
    console.log('   2. Run: import("./validation-test.js").then(m => m.validateEnvironment())');
  }
}

/**
 * Export function for browser console testing
 */
export const validateEnvironment = async () => {
  const validator = new EnvironmentValidator();
  return await validator.runAllTests();
};

/**
 * Quick validation function for browser console
 */
export const quickValidation = () => {
  console.log('🔍 Quick Environment Validation');
  
  const config = getDomainConfig();
  const validation = validateEnvironmentIsolation();
  
  console.table({
    'Environment': config.environment.name,
    'Classification': config.environment.classification,
    'API Base URL': config.api.baseUrl,
    'Auth Bypass': config.auth.bypassEnabled,
    'Keycloak URL': config.auth.keycloakUrl,
    'Validation Status': validation.isValid ? 'PASS' : 'FAIL'
  });

  if (!validation.isValid) {
    console.warn('Issues found:', validation.issues);
  }

  if (validation.warnings.length > 0) {
    console.warn('Warnings:', validation.warnings);
  }

  return { config, validation };
};

export default EnvironmentValidator;