import app from './app';
import mongoConnect from './utils/db';

const port = process.env.PORT || 3000;
(async () => {
  try {
    await mongoConnect();
    app.listen(port, () => {
      /* eslint-disable no-console */
      console.log(`Listening: https://hw-week4-api.azurewebsites.net:${port}`);
      /* eslint-enable no-console */
    });
  } catch (error) {
    console.log('Server error', (error as Error).message);
  }
})();
