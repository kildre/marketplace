// Custom Vite plugin to handle platform-ui image imports
import path from 'path';

export function platformUIImagesPlugin() {
  return {
    name: 'platform-ui-images',
    resolveId(id) {
      // Handle platform-ui image imports
      if (id.includes('./images/') && id.includes('.png')) {
        const imageName = path.basename(id);
        return `/assets/images/${imageName}`;
      }
    },
    load(id) {
      // Return the public URL for images
      if (id.startsWith('/assets/images/') && id.includes('.png')) {
        return `export default "${id}";`;
      }
    }
  };
}
