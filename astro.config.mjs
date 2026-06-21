import { defineConfig } from 'astro/config';

const repository = process.env.GITHUB_REPOSITORY;
const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER;
const repositoryName = repository?.split('/')[1];
const isGithubActions = Boolean(process.env.GITHUB_ACTIONS);

export default defineConfig({
  site: isGithubActions && repositoryOwner && repositoryName
    ? `https://${repositoryOwner}.github.io/${repositoryName}`
    : undefined,
  base: isGithubActions && repositoryName ? `/${repositoryName}` : './',
});
