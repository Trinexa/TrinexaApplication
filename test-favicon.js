// Test script to verify favicon functionality
// Run this in the browser console after configuring a favicon

console.log('🎯 Testing Favicon Configuration...');

// Check if FaviconManager is working
const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
console.log('Current favicon links:', faviconLinks.length);

faviconLinks.forEach((link, index) => {
  console.log(`Favicon ${index + 1}:`, {
    href: link.href,
    rel: link.rel,
    type: link.type
  });
});

// Check document title
console.log('Current page title:', document.title);

// Check if SystemSettings context is available
if (window.React) {
  console.log('✅ React is available');
} else {
  console.log('❌ React not found');
}

console.log('🎯 Favicon test complete!');
