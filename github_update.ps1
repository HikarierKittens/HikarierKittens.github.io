#Requires -Version 5.1
<#
.SYNOPSIS
Build, commit and push this project. Ask before merging remote commits.
.EXAMPLE
.\github_update.ps1 -Message "update wiki"
.EXAMPLE
.\github_update.ps1 -Message "update docs" -SkipBuild
.NOTES
Stages ALL changes, including deletions (except ignored files).
Never force-pushes. Requires Git, GitHub authentication, and npm for builds.
#>
[CmdletBinding()]
param(
    [ValidateNotNullOrEmpty()]
    [string]$Message = 'update wiki',
    [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9._-]*$')]
    [string]$Remote = 'origin',
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
# Handle native exit codes explicitly, including expected nonzero results.
$PSNativeCommandUseErrorActionPreference = $false

function Invoke-GitChecked {
    param([string[]]$GitArgs)
    & git @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Git failed (exit $LASTEXITCODE): git $($GitArgs -join ' ')"
    }
}

function Sync-RemoteWithConsent {
    # Fetch downloads remote history but does not change working files.
    Invoke-GitChecked -GitArgs @('fetch', '--prune', $Remote)
    & git show-ref --verify --quiet $script:RemoteRef
    $refExit = $LASTEXITCODE
    if ($refExit -eq 1) {
        return # The remote branch does not exist yet.
    }
    if ($refExit -ne 0) { throw 'Unable to inspect the remote branch.' }

    & git merge-base --is-ancestor $script:RemoteRef HEAD
    $ancestorExit = $LASTEXITCODE
    if ($ancestorExit -eq 0) { return }
    if ($ancestorExit -ne 1) { throw 'Unable to compare local and remote history.' }

    Write-Host "Remote '$Remote/$script:Branch' contains commits not merged locally." -ForegroundColor Yellow
    $answer = Read-Host 'Merge the fetched remote commits into the local branch? [y/N]'
    if ($answer -notmatch '^(?i:y|yes)$') {
        throw 'Merge declined. Nothing was pushed; your local commit is preserved.'
    }

    # Fetch + merge is the explicit equivalent of pulling with merge.
    # Unrelated histories are deliberately NOT merged automatically.
    & git merge --no-edit $script:RemoteRef
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Merge could not finish. Inspect git status.' -ForegroundColor Yellow
        Write-Host 'For conflicts: edit the files, then git add -A and git commit.'
        Write-Host 'To cancel an in-progress merge instead: git merge --abort'
        throw 'Stopped without pushing. Resolve the merge, then run this script again.'
    }

    # Validate the merged result too, not only the pre-merge local changes.
    Invoke-ProjectChecks
    Assert-CleanWorktree
}

function Invoke-ProjectChecks {
    if ($SkipBuild) { return }
    foreach ($task in @('docs:build', 'docs:check')) {
        & npm run $task
        if ($LASTEXITCODE -ne 0) { throw "npm run $task failed; push cancelled." }
    }
}

function Assert-CleanWorktree {
    $changes = @(& git status --porcelain)
    if ($LASTEXITCODE -ne 0) { throw 'Unable to check working tree status.' }
    if ($changes.Count -gt 0) {
        throw 'Working tree changed after committing/merging (possibly by a build). Review it and rerun; nothing was pushed.'
    }
}

Push-Location $PSScriptRoot
try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is not installed or not on PATH.' }
    if (-not $SkipBuild -and -not (Get-Command npm -ErrorAction SilentlyContinue)) {
        throw 'npm is not installed or not on PATH. Install it or explicitly use -SkipBuild.'
    }
    Invoke-GitChecked -GitArgs @('rev-parse', '--show-toplevel')
    Invoke-GitChecked -GitArgs @('remote', 'get-url', '--push', $Remote)
    $script:Branch = & git symbolic-ref --quiet --short HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Detached HEAD: switch to a local branch first.' }
    $script:Branch = $script:Branch.Trim()
    $script:RemoteRef = "refs/remotes/$Remote/$script:Branch"

    foreach ($state in @('MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply', 'sequencer')) {
        $statePath = & git rev-parse --git-path $state
        if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect repository operation state.' }
        if (Test-Path -LiteralPath $statePath) {
            throw "Unfinished Git operation ($state). Finish or abort it first."
        }
    }
    $unmerged = @(& git ls-files --unmerged)
    if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect conflicts.' }
    if ($unmerged.Count -gt 0) { throw 'Resolve existing conflicts before running this script.' }

    Write-Host "Target: $Remote/$script:Branch"
    Write-Host 'All non-ignored local changes, including deletions, will be committed.'
    Invoke-ProjectChecks
    Invoke-GitChecked -GitArgs @('add', '-A')
    & git diff --cached --quiet --exit-code
    $diffExit = $LASTEXITCODE
    if ($diffExit -eq 1) {
        Invoke-GitChecked -GitArgs @('commit', '-m', $Message)
    } elseif ($diffExit -eq 0) {
        Write-Host 'No staged changes; checking whether existing commits need pushing.'
    } else {
        throw 'Unable to inspect staged changes.'
    }

    Sync-RemoteWithConsent
    Assert-CleanWorktree
    & git push --set-upstream $Remote "HEAD:refs/heads/$script:Branch"
    if ($LASTEXITCODE -ne 0) {
        # The remote may have advanced between fetch and push. Recheck once.
        # Authentication/network/protection errors must not be called conflicts.
        Write-Warning 'Push failed. Rechecking remote history once (failure may also be authentication, network, or branch protection).'
        Sync-RemoteWithConsent
        Assert-CleanWorktree
        Invoke-GitChecked -GitArgs @('push', '--set-upstream', $Remote, "HEAD:refs/heads/$script:Branch")
    }
    Write-Host 'Successfully pushed to GitHub.' -ForegroundColor Green
} catch {
    Write-Error -Message $_.Exception.Message -ErrorAction Continue
    exit 1
} finally {
    Pop-Location
}
