module.exports = async (context, Mainconfig) => {
  const config = Mainconfig
  const headRepoId = context.payload.pull_request.head.repo.id
  const baseRepoId = context.payload.pull_request.base.repo.id

  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const branchName = context.payload.pull_request.head.ref
  const ref = `heads/${branchName}`

  if (headRepoId !== baseRepoId) {
    context.log.info(`Closing PR from fork. keeping ${context.payload.pull_request.head.label}`)
    return
  }

  const isMerged = context.payload.pull_request.merged
  if (!isMerged && config.delete_closed_pr === false) {
    context.log.info(`PR was closed but not merged. Keeping ${owner}/${repo}/${ref}`)
    return
  }

  try {
    await context.github.git.deleteRef({ owner, repo, ref })
    context.log.info(`Successfully deleted ${owner}/${repo}/${ref} which was ${isMerged ? 'merged' : 'closed'}`)
  } catch (e) {
    context.log.warn(e, `Failed to delete ${owner}/${repo}/${ref}`)
  }
}
