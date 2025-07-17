import axios from "axios";

export const getUserRepo = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        per_page: 100,
        sort: "updated",
        direction: "desc",
      },
    });
    const repos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
    }));

    res.json(repos);
  } catch (error) {
    cconsole.error("GitHub API error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch repositories",
      details: error.response?.data || error.message,
    });
  }
};
