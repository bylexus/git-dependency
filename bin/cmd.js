#!/usr/bin/env node
/**
 * command line executable for git-dependency
 *
 * It assumes a package.json in the actual working directory.
 *
 * (c) 2017 alex@alexi.ch
 */

var lib = require('../index.js');
var jsonfile = require('jsonfile');
var path = require('path');
var program = require('commander');

var setWorkingDir = function(dir) {
    process.chdir(dir);
};

var packageConfigPath = function() {
    return path.join(process.cwd(), 'package.json');
};

var readPackageConfig = function() {
    return jsonfile.readFileSync(packageConfigPath());
};

program.version('0.0.3').option('-w, --working-dir <path>', 'use specified working directory');

program
    .command('install')
    .description('installs / updates git dependencies defined in package.json')
    .action(function() {
        setWorkingDir(this.parent.workingDir || process.cwd());
        var packageConf = readPackageConfig();
        lib.install(packageConf);
    });

program
    .command('add <name> <url>')
    .description(
        'adds the repository <url> under the name/folder <name>. URL may be in the form "[url]#[ref]" to check out a specific refspec. Updates package.json.'
    )
    .action(function(name, url, ref) {
        setWorkingDir(this.parent.workingDir || process.cwd());
        var packageConf = readPackageConfig();
        lib.add(packageConf, name, url, ref);
        lib.saveConfig(packageConf, packageConfigPath());
        lib.install(packageConf);
    });

program
    .command('remove <name>')
    .description('Removes a named dependency, AND removes the cloned repository. Updates package.json.')
    .action(function(name) {
        setWorkingDir(this.parent.workingDir || process.cwd());
        var packageConf = readPackageConfig();
        lib.remove(packageConf, name);
        lib.saveConfig(packageConf, packageConfigPath());
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}
