import { mkdir } from "node:fs/promises";
import { join } from "path";
import { spawnSync, file } from "bun";

import type { NostrJson } from "./types";
import { validateApiKey } from "./common";
import { Either } from "./utils";

const setupSSHKey = async () => {
  const sshKeyPath = "/etc/secrets/nostrize-git-deploy-ssh-key";

  const sshKeyExists = await file(sshKeyPath).exists();

  if (!sshKeyExists) {
    throw new Error("ssh key could not be found");
  }

  // Configure the SSH command to use this key
  const gitSSHCommand = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no`;

  process.env.GIT_SSH_COMMAND = gitSSHCommand;
};

const runGitCommand = (pwd: string) => (commandParts: string[]) => {
  let result = spawnSync(["git", ...commandParts], { cwd: pwd });

  if (result.stderr.length > 0) {
    const errStr = result.stderr.toString();

    console.error(`${commandParts.join(" ")} in ${pwd} failed: ${errStr}`);

    throw new Error(errStr);
  }
};

export const commitAndPushChanges = async (
  json: NostrJson,
  headers: Headers,
) => {
  const either = validateApiKey("NOSTR_JSON_API_KEY")(headers);

  if (Either.isLeft(either)) {
    return either;
  }

  await setupSSHKey();

  const repoDir = join("/tmp", "website");

  await mkdir(repoDir, { recursive: true });

  const git = runGitCommand(repoDir);

  git(["clone", "https://github.com/nostrize/website.git"]);

  await Bun.write(
    Bun.file(join("..", "website", "db", "nostr.json")),
    JSON.stringify(json, null, 2),
  );

  // Stage the file
  git(["add", "db/nostr.json"]);

  // Commit the changes
  git(["commit", "-m", "Update nostr.json"]);

  // Push the changes
  git(["push"]);

  console.log("Changes committed and pushed successfully.");

  return Either.right(null);
};
