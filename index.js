/**
 * git-dependency module
 *
 * (c) 2017-2019 alex@alexi.ch
 */
var fs = require('fs'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    execSync = require('child_process').execSync,
    rimraf = require('rimraf');

/**
 * Installs the git dependencies listed in config.
 * See README.md for more information and examples.
 *
 * Config is an object with at least the following entries:
 * directories: {
 *   gitDependencies: <base-dir for git checkouts>
 * },
 * gitDependencies: {
 *   "options": {
 *       "deleteDotGit": false
 *   },
 *   [checkout-name]: "<git-url>#<ref>",
 *   ...
 * }
 *
 * Note that this function:
 * - runs SYNCHRONOUS intentionally
 * - just executes a system call: 'git' must be in the PATH.
 */
var installGitDependencies = function(config) {
    config = config || {};
    var path = require('path'),
        dir = config.directories ? config.directories.gitDependencies : 'components',
        deps = config.gitDependencies || {},
        options = Object.assign(
            {
                deleteDotGit: false
            },
            deps.options || {}
        );
    delete deps.options;

    for (var key in deps) {
        var repo = deps[key];
        var split = repo.split('#');
        var url, version, outdir;
        if (split.length < 1) {
            console.error('No GIT url given for ' + key);
        }
        url = split[0];
        if (split.length < 2) {
            version = 'master';
        } else {
            version = split[1];
        }
        outdir = path.join(dir, key);
        var fullOutdir = path.join(process.cwd(), outdir);
        var dotGitFolder = path.join(fullOutdir, '.git');
        console.log('git package ' + outdir + ': ' + url + '#' + version);

        if (fs.existsSync(dotGitFolder)) {
            console.log('Fetching repository updates for ' + key);
            execSync(['git', 'fetch', '--all'].join(' '), { cwd: fullOutdir });
        } else {
            console.log('Removing old version in ' + outdir);
            rimraf.sync(fullOutdir);
            console.log('Cloning repository ' + url + ' to ' + outdir);
            execSync(['git', 'clone', '--no-checkout', '--origin=origin', url, fullOutdir].join(' '));
        }

        console.log('Checking out ref ' + key + ':' + version);
        execSync(['git', 'checkout', '-qf', version].join(' '), { cwd: fullOutdir });

        // check if we have a branch. If this is the case, pull it.
        try {
            execSync(['git', 'show-ref', '--verify -q', 'refs/heads/' + version].join(' '), { cwd: fullOutdir });
            console.log('Pulling branch ' + key + ':' + version);
            execSync(['git', 'pull', '--force'].join(' '), { cwd: fullOutdir });
        } catch (e) {
            console.log(key + ':' + version + ': This does not seem to be a branch, skip pulling');
        }

        // removing .git folder, if deleteDotGit is set:
        if (options.deleteDotGit === true) {
            console.log('Removing .git folder in ' + fullOutdir);
            rimraf.sync(dotGitFolder);
        }
    }
};

/*
 * Adds a repository to the list of dependencies, but does NOT install it:
 * you must call 'installGitDependencies' after.
 *
 * See README.md for more information and examples.
 *
 * The given config object is updated.
 */
var addRepo = function(config, name, url) {
    config = config || {};
    config.gitDependencies = config.gitDependencies || {};
    config.gitDependencies[name] = url;
};

/*
 * Removes a repo identified by given name. It removes the git repo on the disk
 * as well as in the config object (but does not save the config to a file).
 * You must call 'saveConf' if you whish to save the config to a file.
 *
 * See README.md for more information and examples.
 *
 * The given config object is updated.
 */
var removeRepo = function(config, name) {
    config = config || {};
    config.gitDependencies = config.gitDependencies || {};
    var dir = config.directories ? config.directories.gitDependencies : 'components';

    if (name) {
        delete config.gitDependencies[name];
    }

    var outdir = path.join(dir, name);
    var fullOutdir = path.join(process.cwd(), outdir);

    rimraf.sync(fullOutdir);
};

/*
 * Saves the given config object as json to a file. Normally, 'file'
 * would be a path to 'package.json', but this is not a must.
 *
 * See README.md for more information and examples.
 */
var saveConf = function(config, file) {
    config = config || {};
    jsonfile.writeFileSync(file, config, { spaces: 2 });
};

module.exports = {
    install: installGitDependencies,
    add: addRepo,
    remove: removeRepo,
    saveConfig: saveConf
};
