const GitHubStrategy = require('passport-github2').Strategy;
const supabase = require('./supabaseClient');

module.exports = (passport) => {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('github_id', profile.id);

    let user = users?.[0];

    if (user) {
      // Update accessToken
      await supabase.from('users').update({
        access_token: accessToken
      }).eq('id', user.id);
    } else {
      const { data, error } = await supabase.from('users').insert([{
        github_id: profile.id,
        username: profile.username,
        email: profile.emails?.[0]?.value || '',
        avatar_url: profile.photos?.[0]?.value || '',
        access_token: accessToken
      }]).select().single();

      if (error) return done(error);
      user = data;
    }

    done(null, user);
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const { data } = await supabase.from('users').select('*').eq('id', id);
    done(null, data?.[0] || null);
  });
};
