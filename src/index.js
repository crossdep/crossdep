const path = require("path");
const fse = require("fs-extra");
const {uniqueBy} = require('lodash/array');

const {
  parseConfig,
  validateConfig,
  checkPermissions,
  upsertRepositories
} = require("./lib");
const {
  OK,
  UNHANDLED_EXCEPTION,
  CONFIG_PARSE_ERROR,
  CONFIG_NOT_FOUND,
  CONFIG_NOT_VALID,
  INSUFFICIENT_PERMISSIONS,
  NO_REPOSITORIES_UPSERTED,
  SOME_REPOSITORIES_COULD_NOT_BE_UPSERTED
} = require("./lib/exitCodes");
const { info, warn, error, winstonLogger } = require("./lib/log");

const cachePath = path.resolve(__dirname, "../cache");

const validConfig = {
  version: 1,
  repos: {
    "cz-cli": {
      path: "git@github.com:commitizen/cz-cli.git"
    },
    "cz-conventional-changelog": {
      path: "git@github.com:commitizen/cz-conventional-changelog.git"
    },
    "crossdep": {
      path: "git@github.com:crossdep/crossdep.git"
    }
  },
  // Some example asserts
  // Very explicit
  // alternatively might want something more general
  // like "show me the differences between these repos"
  assertFileExits: {
    "package.json": {
      assertJSONPathExists: "version",
      assertJSONPathExists: "dependencies['node-sass']",
      assertJSONValue: {
        path: "dependencies['node-sass']",
        value: "4.0"
      }
    },
    ".nvmrc": {
      assertFileContains: "save-exact"
    }
  }
};

async function main({ config }) {
  info("Will attempt to parse the config.");
  const parsedConfig = await parseConfig(config);
  info("Did attempt to parse the config.");

  if (!parsedConfig || parsedConfig.parsed !== true) {
    error("The config could not be parsed.");
    process.exit(CONFIG_PARSE_ERROR);
  }

  if (!parsedConfig.config.version) {
    error("No config version found.");
    process.exit(CONFIG_NOT_FOUND);
  }

  info("Will attempt to validate the config.");
  const validatedConfig = await validateConfig(parsedConfig);
  info("Did attempt to validate the config.");

  if (!validatedConfig || validatedConfig.validated !== true) {
    error("The config is not valid.");
    process.exit(CONFIG_NOT_VALID);
  }

  info("Will check if the permissions are allowed.");
  const checkedPermissions = await checkPermissions(validatedConfig);
  info("Did check if the permissions are allowed.");

  if (!checkedPermissions || checkedPermissions.allowed !== true) {
    error("Insufficient permissions.");
    process.exit(INSUFFICIENT_PERMISSIONS);
  }

  try {
    info("Will create the cache directory.");
    await fse.mkdirp(cachePath);
    info("Will create the cache directory.");

    info("Will upsert repositories.");
    const upsertedRepositories = await upsertRepositories({
      cachePath: cachePath,
      repos: validatedConfig.config.repos
    });
    info("Did upsert repositories.");

    if (
      !upsertedRepositories ||
      Object.keys(upsertedRepositories).length === 0
    ) {
      error("No repositories upserted.");
      process.exit(NO_REPOSITORIES_UPSERTED);
    }

    // Now we've got the files that were impacted by the last push
    // so let's dedupe them and see what rules changed

    // Once we know what rules to run, run them!
    // We could alternatively run all of them.  :/

    const filesChanged = upsertedRepositories.reduce((a,v) => {
      return a.concat(v.filesChangedSinceLastPull);
    }, []);

    console.log(filesChanged);
    // We've got repos and their hash

    // Now, get rules out of the config

    // Apply rules against all repos

    // Spit out results

    return upsertedRepositories;
  } catch (e) {
    error("Some repositories could not be upserted.", e);
    process.exit(SOME_REPOSITORIES_COULD_NOT_BE_UPSERTED);
  }
}

main({ config: validConfig })
  .then(upsertedRepositories => {
    console.log(upsertedRepositories);
    process.exit(OK);
  })
  .catch(e => {
    error("An unhandled exception occurred.", e);
    process.exit(UNHANDLED_EXCEPTION);
  });

// // Perm check (filter)
// const allowedRepos  = await permission();

// // Clone (map)
// const paths = await()

// Scan ()

// Merge

// Report

//const { json2csvAsync } = require("./lib/convert");
/*

1. Check access
2. Fetch
3. Tokenize (parse package)
4. 

type: "string"
resolver: GIT_GITHUB_SPS_UI_PACKAGEJSON_VERSION

where: GIT_GITHUB_SPS_UI_PACKAGEJSON
what: {
  type: ast,
  ast: {
    VERSION
  }
}

protocol (git)
  host (github)
    org
      repo
        file
          jsonpath
          ast path

*/

// var documents = [
//   require('./examples/pladmin.package.json')
// ];

// var json2csvCallback = function(csv) {
//   console.log(csv);
// };

// json2csvAsync(documents, {
//     delimiter: { field: "\t" },
//     keys:['name', 'version', 'devDependencies.istanbul'] }).then(json2csvCallback);
