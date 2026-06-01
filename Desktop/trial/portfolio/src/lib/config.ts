export const env = {
  githubUsername: import.meta.env.VITE_GITHUB_USERNAME || "siddharthpsanthosh",
  githubToken: import.meta.env.VITE_GITHUB_TOKEN || "",
  pypiPackages: (import.meta.env.VITE_PYPI_PACKAGES || "rvmn,fastquery")
    .split(",")
    .map((pkg) => pkg.trim())
    .filter(Boolean),
  huggingFaceUsername: import.meta.env.VITE_HF_USERNAME || "",
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || "siddharth@example.com",
  profileImage: import.meta.env.VITE_PROFILE_IMAGE || "/profile.jpg",
};
