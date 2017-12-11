const { upsertRepository } = require('./upsertRepository');

async function upsertRepositories ({cachePath, repos}) {
    // Return an array of promises representing each repo update
    return Promise.all(
        Object.keys(repos).map(async (repoKey) => {
            const repo = repos[repoKey];
            return await upsertRepository({
                cachePath: cachePath,
                repoPath: repo.path,
                repoKey: repoKey
            });
        })
    );
}

module.exports = {
    upsertRepositories
}