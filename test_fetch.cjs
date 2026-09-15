const http = require('http');
http.get('http://localhost:3000/api/jobs', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Jobs length:', JSON.parse(data).length, JSON.parse(data)[0]));
}).on('error', (err) => console.log('Error jobs:', err.message));

http.get('http://localhost:3000/api/locations', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Locations length:', JSON.parse(data).length, JSON.parse(data)[0]));
}).on('error', (err) => console.log('Error locations:', err.message));
