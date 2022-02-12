import * as assert from 'assert'
import * as core from '@actions/core'
import {daysBeforeDelete, github, owner, repo} from './get-context'

export async function createIssue(branch: string, commitAge: number): Promise<number> {
  let issueId: number
  const daysUntilDelete = Math.max(0, Math.abs(commitAge - daysBeforeDelete))
  try {
    const issueResponse = await github.rest.issues.create({
      owner,
      repo,
      title: `[${branch}] is STALE`,
      body: `${branch} has had no activity for ${commitAge.toString()} days. \r \r This branch will be automatically deleted in ${daysUntilDelete.toString()} days.`,
      labels: [
        {
          name: 'stale branch 🗑️',
          color: 'B60205',
          description: 'Used by Stale Branches Action to label issues'
        }
      ]
    })
    issueId = issueResponse.data.id || 0
    assert.ok(issueId, 'Date cannot be empty')
  } catch (err) {
    if (err instanceof Error)
      core.setFailed(`Failed to create issue for ${branch} with ${err.message}`)
    issueId = 0
  }

  return issueId
}
