import { config } from 'dotenv';

config({ path: '.env' });

const testUri = process.env.MONGODB_TEST_URI;
if (!testUri) {
  throw new Error(
    'MONGODB_TEST_URI is not set. Refusing to run against the main database.',
  );
}
process.env.MONGODB_URI = testUri;
