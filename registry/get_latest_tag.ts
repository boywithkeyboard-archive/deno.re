import { LRUCache } from 'lru-cache'
import { Octokit } from 'octokit'
import semver from 'semver'

const cache = new LRUCache<string, string>({
  max: 500,
  ttl: 30*60_000 // half an hour
})

const gh = new Octokit()

export async function getLatestTag(user: string, repo: string): Promise<string | null> {
  const cachedTag = cache.get(user + '/' + repo)

  if (cachedTag) {
    return cachedTag
  }

  const { data } = await gh.rest.repos.listTags({
    owner: user,
    repo,
    per_page: 100
  })

  const tag = semver.rsort(
    data
      .filter(tag => semver.valid(tag.name) !== null)
      .map(tag => tag.name)
  )[0]

  cache.set(user + '/' + repo, tag ?? null)

  return tag ?? null
}
