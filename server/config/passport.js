const GitHubStrategy = require('passport-github2').Strategy;
const supabase = require('./supabaseClient');

module.exports = (passport) => {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Try find existing user
      const { data: users, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('github_id', profile.id);
      if (selectError) return done(selectError);

      let user = users?.[0];

      if (user) {
        // Update access token on each login (optional but good for GitHub API access)
        const { error: updateError } = await supabase
          .from('users')
          .update({ access_token: accessToken })
          .eq('id', user.id);
        if (updateError) return done(updateError);
      } else {
        // New user, insert to DB
        const { data, error: insertError } = await supabase.from('users').insert([{
          github_id: profile.id,
          username: profile.username,
          email: profile.emails?.[0]?.value || '',
          avatar_url: profile.photos?.[0]?.value || '',
          access_token: accessToken,
        }]).select().single();
        if (insertError) return done(insertError);
        user = data;
      }

      return done(null, user);

    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id);
      if (error) return done(error);
      return done(null, data?.[0] || null);
    } catch (err) {
      done(err);
    }
  });
};
