const autocannon = require('autocannon');

autocannon(
  {
    url: 'http://localhost:6000/posts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'My First Drizzle Post',
      content: 'Drizzle ORM feels smooth like butter 🧈',
      userId: 1,
    }),
    connections: 10,
    duration: 10,
  },
  (err, results) => {
    console.log(results);
  }
);
