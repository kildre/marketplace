# Environment Isolation Validation Guide

## Acceptance Criteria
**Scenario 1**: Site exists on localhost, IL-2, and IL-5  
**Given** the site is on an environment,  
**When** a user interacts on either side,  
**Then** they only interact with the corresponding environment.

---

## Pre-Validation Setup

### 1. Ensure getDomainConfig() is Available
```bash
# Verify the domain-config.ts file exists
ls -la frontend/src/utils/domain-config.ts

# If missing, the file was created in previous steps
```

### 2. Environment Configuration Files
Ensure you have the environment-specific config files:
- `frontend/.env.local` (localhost)
- `frontend/.env.il2` (IL-2 classified)
- `frontend/.env.il5` (IL-5 unclassified)

---

## Step-by-Step Validation Process

### **Step 1: Localhost Environment Validation**

#### 1.1 Setup Localhost Environment
```bash
cd frontend

# Use the localhost configuration
cp .env.local .env.local.backup
# Ensure .env.local has localhost settings
```

#### 1.2 Start Local Development
```bash
npm run dev
```

#### 1.3 Validate in Browser Console
Open browser console and run:
```javascript
// Test 1: Basic Configuration Loading
import('./src/utils/domain-config.js').then(module => {
  const config = module.getDomainConfig();
  console.log('🏠 Localhost Configuration:', config);
  
  // Verify environment detection
  console.assert(config.environment.name === 'localhost', 'Should detect localhost');
  console.assert(config.environment.classification === 'development', 'Should be development classification');
  
  console.log('✅ Localhost environment detected correctly');
});
```

#### 1.4 Validate API Endpoints
```javascript
// Test 2: API Endpoint Construction
import('./src/utils/domain-config.js').then(module => {
  const config = module.getDomainConfig();
  
  console.log('API Base URL:', config.api.baseUrl);
  console.log('Available endpoints:');
  Object.entries(config.api.endpoints).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
  
  // Verify localhost can access local API
  const isLocalhost = config.api.baseUrl.includes('localhost') || config.api.baseUrl === '';
  console.assert(isLocalhost, 'Localhost should use local API');
  console.log('✅ Localhost API endpoints configured correctly');
});
```

#### 1.5 Validate Environment Isolation
```javascript
// Test 3: Full Validation
import('./src/utils/validation-test.js').then(module => {
  return module.validateEnvironment();
}).then(results => {
  const passed = results.filter(r => r.passed).length;
  console.log(`Localhost validation: ${passed}/${results.length} tests passed`);
});
```

#### 1.6 Expected Results for Localhost
- ✅ Environment name: `localhost`
- ✅ Classification: `development`
- ✅ API Base URL: `http://localhost:8082` or empty (proxy)
- ✅ Auth bypass: Can be `true` or `false`
- ✅ Allowed domains include localhost variants

---

### **Step 2: IL-5 (Unclassified) Environment Validation**

#### 2.1 Simulate IL-5 Environment
Since you can't actually deploy to IL-5, simulate it by:

```bash
# Build for IL-5 environment
npm run build -- --mode il5

# Serve the built files
npx serve dist -p 3000
```

#### 2.2 Access Application
Open `http://localhost:3000` in browser (this simulates the IL-5 deployment)

#### 2.3 Override Hostname Detection (for testing)
In browser console, temporarily override hostname detection:
```javascript
// Override hostname for testing IL-5
Object.defineProperty(window.location, 'hostname', {
  writable: true,
  value: 'marketplace.cdao.us'
});

// Now test configuration
import('./src/utils/domain-config.js').then(module => {
  const config = module.getDomainConfig();
  console.log('🌐 IL-5 Configuration:', config);
  
  // Verify IL-5 detection
  console.assert(config.environment.name === 'IL-5', 'Should detect IL-5');
  console.assert(config.environment.classification === 'unclassified', 'Should be unclassified');
  
  console.log('✅ IL-5 environment detected correctly');
});
```

#### 2.4 Validate IL-5 API Isolation
```javascript
// Test IL-5 API endpoints
import('./src/utils/domain-config.js').then(module => {
  const config = module.getDomainConfig();
  
  // IL-5 should point to unclassified networks only
  const apiUrl = config.api.baseUrl;
  const isIL5Appropriate = apiUrl.includes('cdao.us') && !apiUrl.includes('.mil.local');
  
  console.assert(isIL5Appropriate, 'IL-5 should use unclassified endpoints');
  console.assert(!config.auth.bypassAuth, 'IL-5 should require authentication');
  
  console.log('✅ IL-5 API isolation validated');
});
```

#### 2.5 Expected Results for IL-5
- ✅ Environment name: `IL-5`
- ✅ Classification: `unclassified`
- ✅ API Base URL: `https://advana-marketplace-monolith-node.dev.mtt.cdao.us`
- ✅ Auth bypass: `false`
- ✅ Keycloak URL: `https://keycloak.cdao.us/auth`
- ❌ Should NOT contain: `.mil.local`, `localhost`, classified domains

---

### **Step 3: IL-2 (Classified) Environment Validation**

#### 3.1 Simulate IL-2 Environment
```bash
# Build for IL-2 environment
npm run build -- --mode il2

# Serve the built files
npx serve dist -p 3001
```

#### 3.2 Override Hostname for IL-2 Testing
```javascript
// Override hostname for testing IL-2
Object.defineProperty(window.location, 'hostname', {
  writable: true,
  value: 'marketplace.mil.local'
});

// Test IL-2 configuration
import('./src/utils/domain-config.js').then(module => {
  const config = module.getDomainConfig();
  console.log('🔒 IL-2 Configuration:', config);
  
  // Verify IL-2 detection
  console.assert(config.environment.name === 'IL-2', 'Should detect IL-2');
  console.assert(config.environment.classification === 'classified', 'Should be classified');
  
  console.log('✅ IL-2 environment detected correctly');
});
```

#### 3.3 Validate IL-2 Security Isolation
```javascript
// Test IL-2 security isolation
import('./src/utils/domain-config.js').then(module => {
  const config = module.getDomainConfig();
  const validation = module.validateEnvironmentIsolation();
  
  // IL-2 should be completely isolated
  const apiUrl = config.api.baseUrl;
  const isClassifiedOnly = apiUrl.includes('.mil.local') && !apiUrl.includes('cdao.us');
  
  console.assert(isClassifiedOnly, 'IL-2 should only use classified endpoints');
  console.assert(!config.auth.bypassAuth, 'IL-2 must require authentication');
  console.assert(validation.isValid, 'IL-2 should pass all security validations');
  
  console.log('✅ IL-2 security isolation validated');
});
```

#### 3.4 Expected Results for IL-2
- ✅ Environment name: `IL-2`
- ✅ Classification: `classified`
- ✅ API Base URL: `https://advana-marketplace-api.mil.local`
- ✅ Auth bypass: `false`
- ✅ Keycloak URL: `https://keycloak.classified.mil.local`
- ❌ Should NOT contain: `cdao.us`, `localhost`, unclassified domains

---

### **Step 4: Cross-Environment Validation**

#### 4.1 Test Environment Isolation
```javascript
// Test that environments don't cross-communicate
const testCrossEnvironmentIsolation = async () => {
  console.log('🧪 Testing Cross-Environment Isolation');
  
  // Test localhost isolation
  Object.defineProperty(window.location, 'hostname', { writable: true, value: 'localhost' });
  const { getDomainConfig } = await import('./src/utils/domain-config.js');
  const localhostConfig = getDomainConfig();
  
  // Test IL-5 isolation
  Object.defineProperty(window.location, 'hostname', { writable: true, value: 'test.cdao.us' });
  const il5Config = getDomainConfig();
  
  // Test IL-2 isolation
  Object.defineProperty(window.location, 'hostname', { writable: true, value: 'test.mil.local' });
  const il2Config = getDomainConfig();
  
  // Verify they're all different
  const environments = [localhostConfig.environment.name, il5Config.environment.name, il2Config.environment.name];
  const unique = [...new Set(environments)];
  
  console.assert(unique.length === 3, 'All environments should be detected as different');
  console.assert(!il2Config.api.baseUrl.includes('cdao.us'), 'IL-2 should not access unclassified APIs');
  console.assert(!il5Config.api.baseUrl.includes('.mil.local'), 'IL-5 should not access classified APIs');
  
  console.log('✅ Cross-environment isolation validated');
  console.table({
    'Localhost': localhostConfig.environment.name,
    'IL-5': il5Config.environment.name,
    'IL-2': il2Config.environment.name
  });
};

testCrossEnvironmentIsolation();
```

#### 4.2 Network Security Validation
```javascript
// Test network security configurations
import('./src/utils/domain-config.js').then(module => {
  // Test each environment's allowed domains
  const testNetworkSecurity = (hostname, expectedEnv) => {
    Object.defineProperty(window.location, 'hostname', { writable: true, value: hostname });
    const config = module.getDomainConfig();
    
    console.log(`Network security for ${expectedEnv}:`, config.networking.allowedDomains);
    
    // Verify appropriate domain restrictions
    const allowedDomains = config.networking.allowedDomains;
    const hasRestrictions = allowedDomains && allowedDomains.length > 0;
    
    console.assert(hasRestrictions, `${expectedEnv} should have domain restrictions`);
    return config;
  };
  
  testNetworkSecurity('localhost', 'Localhost');
  testNetworkSecurity('test.cdao.us', 'IL-5');
  testNetworkSecurity('test.mil.local', 'IL-2');
  
  console.log('✅ Network security configurations validated');
});
```

---

### **Step 5: Production Validation Checklist**

#### 5.1 Final Validation Commands
Run this comprehensive validation:
```javascript
// Complete validation suite
const runCompleteValidation = async () => {
  console.log('🔍 Running Complete Environment Validation');
  
  const { validateEnvironment, quickValidation } = await import('./src/utils/validation-test.js');
  
  // Quick validation
  console.log('\n1. Quick Validation:');
  const quick = quickValidation();
  
  // Full validation
  console.log('\n2. Full Validation:');
  const full = await validateEnvironment();
  
  // Summary
  const passed = full.filter(r => r.passed).length;
  const total = full.length;
  
  console.log(`\n📊 FINAL RESULTS: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 ALL VALIDATION TESTS PASSED!');
    console.log('✅ Environment isolation is working correctly');
  } else {
    console.log('⚠️ Some validations failed - review issues above');
  }
  
  return { quick, full, passRate: (passed/total)*100 };
};

runCompleteValidation();
```

#### 5.2 Expected Final Results

**✅ PASS Criteria:**
- All environments correctly detected
- API endpoints isolated per environment
- Authentication properly configured
- No cross-environment communication
- Network security restrictions in place
- All validation tests pass (100%)

**❌ FAIL Indicators:**
- Wrong environment detection
- Cross-environment API calls possible
- Auth bypass enabled in production
- Missing domain restrictions
- Any validation test failures

---

### **Step 6: Troubleshooting Common Issues**

#### 6.1 Environment Not Detected Correctly
```javascript
// Debug environment detection
import('./src/utils/domain-config.js').then(module => {
  console.log('Current hostname:', window.location.hostname);
  console.log('Current mode:', import.meta.env.MODE);
  
  const config = module.getDomainConfig();
  console.log('Detected environment:', config.environment);
  
  // Manual check
  const hostname = window.location.hostname;
  if (hostname === 'localhost') console.log('✅ Should be localhost');
  else if (hostname.includes('cdao.us')) console.log('✅ Should be IL-5');  
  else if (hostname.includes('mil.local')) console.log('✅ Should be IL-2');
  else console.log('❓ Unknown environment');
});
```

#### 6.2 API Endpoints Not Isolated
```javascript
// Debug API configuration
import('./src/utils/domain-config.js').then(module => {
  const config = module.getDomainConfig();
  console.log('API Base URL:', config.api.baseUrl);
  console.log('Environment Variables:');
  console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('  MODE:', import.meta.env.MODE);
  
  // Check if using correct environment file
  const envFile = import.meta.env.MODE === 'il2' ? '.env.il2' : 
                 import.meta.env.MODE === 'il5' ? '.env.il5' : '.env.local';
  console.log('Expected env file:', envFile);
});
```

---

## Summary

This validation guide ensures that:

1. **localhost** environment allows flexible development
2. **IL-5** environment only communicates with unclassified systems
3. **IL-2** environment only communicates with classified systems
4. No cross-environment communication is possible
5. All security boundaries are properly enforced

Run through all steps to validate that your `getDomainConfig()` function properly implements environment isolation according to the acceptance criteria.