const express = require('express');
const dotenv = require('dotenv');
const profileRoutes = require('./routes/profileRoutes');

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api', profileRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'GitHub Profile Analyzer API is running!',
    endpoints: {
      analyze: 'POST /api/analyze/:username',
      getAllProfiles: 'GET /api/profiles',
      getProfile: 'GET /api/profiles/:username'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
