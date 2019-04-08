git-dependency
======================

> Install defined GIT repos to a directory

This small command line tool has the following purpose:

* It fetches / clones GIT repos into a local folder
* It stores the installed git repo infos in `package.json`

This tool is mainly used during development: The GIT repos needed during development / as part of the package can
be defined in `package.json`, so this information is part of the main repo and can be distributed to source control.

We created this tool to replace [Bower](https://bower.io/), but cannot use npm/yarn for non-JS/Web repositories.

Installation
-------------

`npm install --save git-dependency`

Usage
-----

*Note*: This tool assumes a `package.json` in the current working directory.

### Install a GIT repo

`git-dependency add [local name] [git-url]#[git-ref]`

For example:

`git-dependency add php-injector https://github.com/bylexus/php-injector.git#0.0.8`

This adds the mentioned git repo to `components/php-injector` and checks out tag 0.0.8.

If you omit the refspec, `master` is assumed.

The added repo is stored in `package.json`, in the `gitDependencies` object.

### Install / update repos

To install / update repos configured in `package.json`, execute

`git-dependency install`

This installs the repos configured in `package.json` into `components` (or the configured base folder) by executing the follwing git commands:

* `git clone` (for not installed repos)
* or `git fetch --all` (for already installed repos)
* `git checkout [ref]`
* `git pull` (for branch refs)

### Remove installed repo

`git-dependency remove [name]`

e.g.:

`git-dependency remove php-injector`

This removes the git repo from the disk as well as from `package.json`

### Define base folder

The standard folder for cloning git repos is `components/` in the current working dir containing `package.json`.
You can change this location by adding a config to `package.json`:

```json
{
  "directories": {
    "gitDependencies": "webroot/git-repos"
  }
}
```


### Manually change repo entries in `package.json`

The installed repos are stored in `package.json`. You can manually edit the entries, if needed. The structure looks as follows:

```json
{
  "gitDependencies": {
    "[local name]": "[repo-url]#[branch/tag]",
    ...
  }
}
```

For example:

```json
{
  "gitDependencies": {
    "components-ext": "https://gitlab.kadenpartner.ch/kp/components-ext.git#0.2.2",
    "php-injector": "https://github.com/bylexus/php-injector.git#0.0.8"
  }
}
```

and then install them with

`git-dependency install`

### Options

The `gitDependencies` key in `package.json` takes a special `options` object to configure some aspects of git-dependency:


```json
{
    "gitDependencies": {
        "options": {
            "deleteDotGit": false
        }
    }
}
```

#### `options.deleteDotGit`

If `deleteDotGit` is set to true, the `.git` folder within the cloned repo dir is deleted, so that only the checked out files remain. This saves some megabytes of disk space if the repository is big.
On the other side, the repo is newly checked out every time you execute `git-dependency install` again.

(c) alex@alexi.ch
