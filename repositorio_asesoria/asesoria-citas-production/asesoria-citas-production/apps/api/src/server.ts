import { app } from './app.js';
import { env } from './config/env.js';

const port = Number(process.env.PORT) || env.API_PORT;

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`);
});
