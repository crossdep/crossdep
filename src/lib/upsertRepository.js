const fse = require("fs-extra");
const { spawn, spawnSync } = require("child_process");
const path = require("path");
const { info, warn, error, winstonLogger } = require("./log");

function getSHA({ cachePath, repoKey }) {
  const shaBuffer = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: path.resolve(cachePath, repoKey)
  }).stdout;

  if (!shaBuffer) {
    return;
  }
  return shaBuffer.toString().trim();
}

function getAllFiles({cachePath, repoKey}) {
  const allFilesBuffer = spawnSync(
    "git",
    ["ls-tree", "--name-only", "-r", "HEAD"],
    {
      cwd: path.resolve(cachePath, repoKey)
    }
  ).stdout;

  if (!allFilesBuffer) {
    return;
  }
  // Split the stdout by newline, removing empty
  return allFilesBuffer
    .toString()
    .split("\n")
    .filter((file) => {
      return file.length > 0;
    });
}

function getFilesChanged({ cachePath, repoKey, sha, shaLastPulled }) {
  const filesChangedBuffer = spawnSync(
    "git",
    ["--no-pager", "diff", "--name-only", shaLastPulled, sha],
    {
      cwd: path.resolve(cachePath, repoKey)
    }
  ).stdout;

  if (!filesChangedBuffer) {
    return;
  }
  // Split the stdout by newline, removing empty
  return filesChangedBuffer
    .toString()
    .split("\n")
    .filter((file) => {
      return file.length > 0;
    });
}

function upsertRepository({ cachePath, repoPath, repoKey }) {
  info("About to clone " + repoKey + " to " + cachePath);
  return new Promise((resolve, reject) => {
    // TODO: Should only clone if not in cache
    const shaLastPulled = getSHA({ cachePath, repoKey });

    const clone = spawn("git", ["clone", "--depth=1", repoPath], {
      cwd: cachePath
    });

    // TODO: progress indicator?
    // clone.stdout.on('data', function(data) {
    //   const delta = data.toString();
    //   console.log(delta);
    //   result += delta;
    // });

    clone.on("close", status => {
      if (status == 0) {
        resolve({
          repoKey,
          repoPath,
          fetchMethod: "clone",
          sha: getSHA({ cachePath, repoKey }),
          filesChangedSinceLastPull: getAllFiles({
            cachePath,
            repoKey
          })
        });
      } else if (status == 128) {
        info(repoKey + " exists in cache, trying to pull instead");
        const pull = spawn("git", ["pull", repoPath], {
          cwd: path.resolve(cachePath, repoKey)
        });
        pull.on("close", status => {
          if (status === 0 || status === 1) {
            const sha = getSHA({ cachePath, repoKey });
            resolve({
              repoKey,
              repoPath,
              fetchMethod: "pull",
              sha,
              shaLastPulled,
              filesChangedSinceLastPull: getFilesChanged({
                cachePath,
                repoKey,
                sha,
                shaLastPulled
              })
            });
          } else {
            reject("'git pull' failed with status " + status);
          }
        });
        pull.on("error", e => {
          reject("'git pull' failed with error " + JSON.stringify(e));
        });
        //reject("Could not git clone " + repoPath + ", repo already exists in cache.")
      } else {
        reject("'git clone' failed with status " + status);
      }
    });

    clone.on("error", e => {
      reject("'git clone' failed with error " + JSON.stringify(e));
    });
  });
}

module.exports = {
  upsertRepository
};
