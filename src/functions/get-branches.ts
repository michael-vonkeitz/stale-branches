import * as assert from 'assert'
import * as core from '@actions/core'
import {github, owner, repo} from './get-context'
import {BranchResponse} from '../types/branches'
import {logGetBranches} from './logging/log-get-branches'
import {checkBranchProtection} from './check-branch-protection'

/**
 * Retrieves all branches in a repository
 *
 * @returns {BranchResponse} A subset of data on all branches in a repository @see {@link BranchResponse}
 */
export async function getBranches(includeProtectedBranches:boolean): Promise<BranchResponse[]> {
  let branches: BranchResponse[]
  try {
    const branchResponse = await github.paginate(
      github.rest.repos.listBranches,
      {
        owner,
        repo,
        per_page: 100
      },
      response =>
        response.data.map(
          branch =>
            ({
              branchName: branch.name,
              commmitSha: branch.commit.sha
            }) as BranchResponse
        )
    )
    branches = branchResponse

    if (includeProtectedBranches) {
      await checkBranchProtection(branches)
    }

    assert.ok(branches, 'Response cannot be empty.')
    core.info(logGetBranches(branches.length))
  } catch (err) {
    if (err instanceof Error) {
      core.setFailed(`Failed to retrieve branches for ${repo}. Error: ${err.message}`)
    } else {
      core.setFailed(`Failed to retrieve branches for ${repo}.`)
    }
    branches = [{branchName: '', commmitSha: ''}]
  }

  return branches
}
