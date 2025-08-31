// Create a simple test favicon as a blob for testing upload functionality
// Run this in browser console to create a test file

console.log('🧪 Creating test favicon file...');

// Create a simple canvas with a favicon design
const canvas = document.createElement('canvas');
canvas.width = 32;
canvas.height = 32;
const ctx = canvas.getContext('2d');

// Draw a simple favicon design
ctx.fillStyle = '#10B981'; // Green background
ctx.fillRect(0, 0, 32, 32);

ctx.fillStyle = '#FFFFFF'; // White text
ctx.font = 'bold 18px Arial';
ctx.textAlign = 'center';
ctx.fillText('T', 16, 22);

// Convert canvas to blob
canvas.toBlob((blob) => {
  console.log('✅ Test favicon created, size:', blob.size, 'bytes');
  
  // Create a File object from the blob
  const file = new File([blob], 'test-favicon.png', { type: 'image/png' });
  
  console.log('📁 Test file created:', {
    name: file.name,
    size: file.size,
    type: file.type
  });
  
  // You can now use this file to test the upload
  window.testFaviconFile = file;
  console.log('💾 Test file saved to window.testFaviconFile');
  console.log('Now you can test upload by running: window.testFaviconFile');
}, 'image/png');

console.log('🎯 Test favicon generation complete!');
