const fs = require('fs');
const path = require('path');

const request = async () => {
  const FormData = require('form-data');
  const form = new FormData();
  form.append('registerUser', JSON.stringify({
    role: 'counselor',
    personalInfo: {
      name: 'Test Test',
      email: 'test@example.com',
      password: 'mypassword123',
      confirmPassword: 'mypassword123'
    },
    education: {
      degree: 'Bachelor\'s',
      institution: 'NUST',
      experience: '2 years',
      description: 'This is a valid ten char description'
    },
    payment: {
      accountNumber: '1234567890123',
      bankName: 'HBL',
      branchCode: '1234'
    }
  }));

  // Create a dummy PDF
  fs.writeFileSync('dummy.pdf', 'dummy pdf content');
  form.append('file', fs.createReadStream('dummy.pdf'));

  try {
    const fetch = require('node-fetch'); // need node-fetch, but wait, usually default JS doesn't have fetch if old node.
  } catch(e) {}
  
  form.submit('http://localhost:3000/api/register', function(err, res) {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Status:', res.statusCode);
      res.resume();
      res.on('data', chunk => console.log(chunk.toString()));
    }
  });
};
request();
