/**
 * Translates raw CLI git & API error strings into clear, friendly plain English for beginners.
 */
export function translateGitError(rawError) {
  if (!rawError) return 'An unknown error occurred. Please try again.';

  const err = rawError.toString().toLowerCase();

  if (err.includes('not recognized as an internal or external command') || err.includes('command not found') || err.includes('spawn git enoent') || err.includes('git is not installed')) {
    return 'Git Not Found: Git is not installed on your computer or not added to your system PATH environment variable. Please install Git from https://git-scm.com/ and restart GitEasy.';
  }

  if (err.includes('enoent') || err.includes('no such file or directory') || err.includes('directory does not exist') || err.includes('cannot find the path')) {
    return 'Directory Error: The selected project folder path does not exist on your computer. Please select a valid folder path and try again.';
  }

  if (err.includes('dubious ownership') || err.includes('safe.directory')) {
    return 'Security Notice: Git detected that the repository folder is owned by another user. Run `git config --global --add safe.directory <path>` or select a folder in your user directory.';
  }

  if (err.includes('authentication failed') || err.includes('could not read username') || err.includes('invalid credentials') || err.includes('401')) {
    return 'Authentication Failed: Your GitHub access token is invalid or expired. Please sign out and sign in again.';
  }

  if (err.includes('permission to') && err.includes('denied')) {
    return 'Permission Denied: You do not have push permissions for this GitHub repository. Make sure you own the repository or have write access.';
  }

  if (err.includes('remote origin already exists')) {
    return 'Notice: Remote origin already exists. GitEasy automatically reconfigured it to point to your selected repository.';
  }

  if (err.includes('updates were rejected because the remote contains work') || err.includes('non-fast-forward') || err.includes('fetch first')) {
    return 'Upload Blocked: The remote GitHub repository already contains files (e.g. README or License) that are not on your computer. Create a new empty repository or pull changes first.';
  }

  if (err.includes('file exceeds') || err.includes('this exceeds github\'s file size limit')) {
    return 'File Too Large: GitHub limits individual files to 100MB. Please remove large video/binary files from your project folder before uploading.';
  }

  if (err.includes('nothing to commit, working tree clean')) {
    return 'Nothing to commit: Your files are already committed and ready to upload.';
  }

  if (err.includes('could not resolve host') || err.includes('failed to connect') || err.includes('network is unreachable')) {
    return 'Network Error: Unable to connect to GitHub. Please check your internet connection and try again.';
  }

  if (err.includes('repository not found') || err.includes('404')) {
    return 'Repository Not Found: The selected GitHub repository could not be found. Check if it was deleted or renamed.';
  }

  if (err.includes('execution failed')) {
    return 'Execution Error: The Git command failed to execute. Ensure the selected folder path exists and Git is installed.';
  }

  return `Git Command Issue: ${rawError.replace(/^Error:\s*/, '').trim()}`;
}
