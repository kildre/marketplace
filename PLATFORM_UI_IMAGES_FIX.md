# Platform-UI Images Fix

## Problem
The `@advana/platform-ui` package uses dynamic imports for images that don't work properly with Vite-based applications. The images in the header were missing because Vite couldn't resolve the dynamic `require('./images/filename.png')` calls used by the AdvanaMenu component.

## Solution
1. **Copied platform-ui images to public assets**: All required images from `@advana/platform-ui/dist/images/` have been copied to `frontend/public/assets/images/`.

2. **Created custom logo section component**: Built `CustomMenuLogoSection.tsx` that uses static imports compatible with Vite and provides the same functionality as the original AdvanaMenu logos.

3. **Used AdvanaMenu's menuLogoSection prop**: Instead of modifying the AdvanaMenu component, we use its built-in `menuLogoSection` prop to provide our custom logo section with properly loaded images.

4. **Updated Dockerfile**: Modified the build process to automatically copy platform-ui images during Docker builds.

## Files Modified
- `frontend/src/App.tsx` - Updated to use AdvanaMenu with custom menuLogoSection
- `frontend/src/components/CustomMenuLogoSection.tsx` - Custom logo component with static image imports
- `frontend/public/assets/images/` - Contains copied platform-ui images
- `frontend/vite.config.ts` - Basic configuration (alias not needed with this approach)
- `Dockerfile` - Added image copying step in build process
- `copy-platform-ui-images.sh` - Helper script for manual image copying

## Images Included
The following images from `@advana/platform-ui` are now available:
- `AdvanaDarkTheme.png` - Main Advana logo
- `DOD_color.png` - Department of Defense logo
- `cdao_Logo.png` - CDAO logo
- `Jupiter_DON_logo.png` - Navy Department logo (Jupiter enclave)
- `Jupiter_USMC_logo.png` - Marines logo (Jupiter enclave)
- `Jupiter_USN_logo.png` - Navy logo (Jupiter enclave)
- `Jupiter_logo.png` - Jupiter main logo
- `logos/cdao_Full_Logo.png` - Full CDAO logo

## How It Works
The `CustomMenuLogoSection` component:
- Uses static imports (`import image from '/assets/images/filename.png'`) that work with Vite
- Replicates the exact logo layout and functionality from the original AdvanaMenu
- Supports both Advana and Jupiter enclaves
- Is passed to AdvanaMenu via the `menuLogoSection` prop, overriding the default logo rendering

## Development Workflow
1. **For local development**: Static imports are resolved automatically by Vite.

2. **For Docker builds**: The Dockerfile automatically copies images during the build process.

3. **Manual copying** (if needed): Run `./copy-platform-ui-images.sh` from the project root.

## Enclave Support
The CustomMenuLogoSection supports both:
- Default (Advana) enclave - Shows DOD, CDAO, and Advana logos
- Jupiter enclave - Shows Navy Department, Marines, Navy, and Jupiter logos

## Props Available
The CustomMenuLogoSection accepts:
- `enclave`: 'advana' (default) or 'jupiter'
- `alternateLogo`: Optional alternate logo URL
- `megaMenuBaseDomain`: Base domain for navigation
- `isCRA`: Whether using Create React App mode (default: true)

## Future Maintenance
- When updating `@advana/platform-ui`, re-run the image copying process
- If new images are added to the platform-ui package, add them to CustomMenuLogoSection
- The component can be easily extended to support additional enclaves or customization
