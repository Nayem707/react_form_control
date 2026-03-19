// Test script to verify registration fix
const testRegistration = async () => {
  try {
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('username', 'testuser123');
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Registration test result:', data);

    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', data);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

// You can test this in browser console or with node-fetch
console.log('Registration test function created. To test:');
console.log('1. Open browser developer tools');
console.log('2. Go to http://localhost:5000/api/health');
console.log('3. Run testRegistration() in console');
