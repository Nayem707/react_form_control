const autocannon = require('autocannon');
const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello World!');
});

server.listen(6000, () => {
  console.log('Server running on http://localhost:6000');

  autocannon(
    {
      url: 'http://localhost:6000',
      connections: 20,
      duration: 5,
    },
    (err, result) => {
      console.log(result);
      server.close();
    }
  );
});
