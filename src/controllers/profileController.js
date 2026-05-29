 
const axios = require('axios');
const db = require('../config/db');

// Calculate profile score
const calculateScore = (followers, publicRepos) => {
  return (followers * 2) + publicRepos;
};

//top language from repos
const getTopLanguage = async (username) => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`
    );
    const repos = response.data;

    const languageCount = {};
    repos.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    if (Object.keys(languageCount).length === 0) return null;

    return Object.keys(languageCount).reduce((a, b) =>
      languageCount[a] > languageCount[b] ? a : b
    );
  } catch (err) {
    return null;
  }
};

// API analyze profile
const analyzeProfile = async (req, res) => {
  const { username } = req.params;

  try {
    // Fetch from GitHub API
    const githubRes = await axios.get(
      `https://api.github.com/users/${username}`
    );
    const data = githubRes.data;

    // top language
    const topLanguage = await getTopLanguage(username);

    //score
    const profileScore = calculateScore(data.followers, data.public_repos);

    // check duplicate
    const [existing] = await db.query(
      'SELECT id FROM profiles WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      // Update 
      await db.query(
        `UPDATE profiles SET
          name = ?, bio = ?, location = ?, avatar_url = ?,
          profile_url = ?, public_repos = ?, followers = ?,
          following = ?, public_gists = ?, top_language = ?,
          profile_score = ?, account_created_at = ?,
          github_updated_at = ?
        WHERE username = ?`,
        [
          data.name, data.bio, data.location, data.avatar_url,
          data.html_url, data.public_repos, data.followers,
          data.following, data.public_gists, topLanguage,
          profileScore, new Date(data.created_at),
          new Date(data.updated_at), username
        ]
      );

      const [updated] = await db.query(
        'SELECT * FROM profiles WHERE username = ?',
        [username]
      );

      return res.json({
        message: `Profile of '${username}' re-analyzed and updated successfully`,
        profile: updated[0]
      });
    }

    // Insert 
    await db.query(
      `INSERT INTO profiles 
        (username, name, bio, location, avatar_url, profile_url,
        public_repos, followers, following, public_gists,
        top_language, profile_score, account_created_at, github_updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username, data.name, data.bio, data.location,
        data.avatar_url, data.html_url, data.public_repos,
        data.followers, data.following, data.public_gists,
        topLanguage, profileScore,
        new Date(data.created_at), new Date(data.updated_at)
      ]
    );

    const [inserted] = await db.query(
      'SELECT * FROM profiles WHERE username = ?',
      [username]
    );

    return res.status(201).json({
      message: `Profile of '${username}' analyzed and stored successfully`,
      profile: inserted[0]
    });

  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: `GitHub user '${username}' not found` });
    }
    return res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
};

// profiles via github api
const getAllProfiles = async (req, res) => {
  try {
    const [profiles] = await db.query(
      'SELECT * FROM profiles ORDER BY profile_score DESC'
    );
    return res.json({
      message: 'All analyzed profiles',
      count: profiles.length,
      profiles
    });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
};

// username via github api
const getProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const [profile] = await db.query(
      'SELECT * FROM profiles WHERE username = ?',
      [username]
    );

    if (profile.length === 0) {
      return res.status(404).json({ 
        error: `Profile '${username}' not found. Analyze it first using POST /api/analyze/${username}` 
      });
    }

    return res.json({
      message: `Profile data for '${username}'`,
      profile: profile[0]
    });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
};

module.exports = { analyzeProfile, getAllProfiles, getProfile };