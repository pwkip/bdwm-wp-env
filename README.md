# `bdwm-wp-env`

`bdwm-wp-env` lets you easily set up a local WordPress environment for building and testing plugins and themes. It's simple to install and requires no configuration.

## Quick (tl;dr) instructions

Ensure that Docker is running, then:

```sh
$ cd /path/to/a/wordpress/plugin
$ npm -g i @bdwm/bdwm-wp-env
$ bdwm-wp-env start
```

The local environment will be available at http://localhost:8888 (Username: `admin`, Password: `password`).

## Prerequisites

`bdwm-wp-env` requires Docker to be installed. There are instructions available for installing Docker on [Windows 10 Pro](https://docs.docker.com/docker-for-windows/install/), [all other versions of Windows](https://docs.docker.com/toolbox/toolbox_install_windows/), [macOS](https://docs.docker.com/docker-for-mac/install/), and [Linux](https://docs.docker.com/v17.12/install/linux/docker-ce/ubuntu/#install-using-the-convenience-script).

Node.js and NPM are required. The latest LTS version of Node.js is used to develop `bdwm-wp-env` and is recommended.

## Installation

### Installation as a global package

After confirming that the prerequisites are installed, you can install `bdwm-wp-env` globally like so:

```sh
$ npm -g i @bdwm/bdwm-wp-env
```

You're now ready to use `bdwm-wp-env`!

### Installation as a local package

If your project already has a package.json, it's also possible to use `bdwm-wp-env` as a local package. First install `bdwm-wp-env` locally as a dev dependency:

```sh
$ npm i @bdwm/bdwm-wp-env --save-dev
```

Then modify your package.json and add an extra command to npm `scripts` (https://docs.npmjs.com/misc/scripts):

```json
"scripts": {
	"bdwm-wp-env": "bdwm-wp-env"
}
```

When installing `bdwm-wp-env` in this way, all `bdwm-wp-env` commands detailed in these docs must be prefixed with `npm run`, for example:

```sh
$ npm run bdwm-wp-env start
```

instead of:

```sh
$ bdwm-wp-env start
```

## Usage

### Starting the environment

First, ensure that Docker is running. You can do this by clicking on the Docker icon in the system tray or menu bar.

Then, change to a directory that contains a WordPress plugin or theme:

```sh
$ cd ~/gutenberg
```

Then, start the local environment:

```sh
$ bdwm-wp-env start
```

Finally, navigate to http://localhost:8888 in your web browser to see WordPress running with the local WordPress plugin or theme running and activated. Default login credentials are username: `admin` password: `password`.

### Stopping the environment

To stop the local environment:

```sh
$ bdwm-wp-env stop
```

## Troubleshooting common problems

Many common problems can be fixed by running through the following troubleshooting steps in order:

### 1. Check that `bdwm-wp-env` is running

First, check that `bdwm-wp-env` is running. One way to do this is to have Docker print a table with the currently running containers:

```sh
$ docker ps
```

In this table, by default, you should see three entries: `wordpress` with port 8888, `tests-wordpress` with port 8889 and `mariadb` with port 3306.

### 2. Check the port number

By default `bdwm-wp-env` uses port 8888, meaning that the local environment will be available at http://localhost:8888.

You can configure the port that `bdwm-wp-env` uses so that it doesn't clash with another server by specifying the `WP_ENV_PORT` environment variable when starting `bdwm-wp-env`:

```sh
$ WP_ENV_PORT=3333 bdwm-wp-env start
```

Running `docker ps` and inspecting the `PORTS` column allows you to determine which port `bdwm-wp-env` is currently using.

You may also specify the port numbers in your `.bdwm-wp-env.json` file, but the environment variables take precedent.

### 3. Restart `bdwm-wp-env`

Restarting `bdwm-wp-env` will restart the underlying Docker containers which can fix many issues.

To restart `bdwm-wp-env`:

```sh
$ bdwm-wp-env stop
$ bdwm-wp-env start
```

### 4. Restart Docker

Restarting Docker will restart the underlying Docker containers and volumes which can fix many issues.

To restart Docker:

1. Click on the Docker icon in the system tray or menu bar.
2. Select _Restart_.

Once restarted, start `bdwm-wp-env` again:

```sh
$ bdwm-wp-env start
```

### 5. Reset the database

Resetting the database which the local environment uses can fix many issues, especially when they are related to the WordPress installation.

To reset the database:

**⚠️ WARNING: This will permanently delete any posts, pages, media, etc. in the local WordPress installation.**

```sh
$ bdwm-wp-env clean all
$ bdwm-wp-env start
```

### 6. Nuke everything and start again 🔥

When all else fails, you can use `bdwm-wp-env destroy` to forcibly remove all of the underlying Docker containers and volumes. This will allow you to start from scratch.

To nuke everything:

**⚠️ WARNING: This will permanently delete any posts, pages, media, etc. in the local WordPress installation.**

```sh
$ bdwm-wp-env destroy
$ bdwm-wp-env start
```

## Command reference

`bdwm-wp-env` creates generated files in the `bdwm-wp-env` home directory. By default, this is `~/.bdwm-wp-env`. The exception is Linux, where files are placed at `~/bdwm-wp-env` [for compatibility with Snap Packages](https://github.com/WordPress/gutenberg/issues/20180#issuecomment-587046325). The `bdwm-wp-env` home directory contains a subdirectory for each project named `/$md5_of_project_path`. To change the `bdwm-wp-env` home directory, set the `WP_ENV_HOME` environment variable. For example, running `WP_ENV_HOME="something" bdwm-wp-env start` will download the project files to the directory `./something/$md5_of_project_path` (relative to the current directory).

### `bdwm-wp-env start`

The start command installs and initalizes the WordPress environment, which includes downloading any specified remote sources. By default, `bdwm-wp-env` will not update or re-configure the environment except when the configuration file changes. Tell `bdwm-wp-env` to update sources and apply the configuration options again with `bdwm-wp-env start --update`. This will not overrwrite any existing content.

```sh
bdwm-wp-env start

Starts WordPress for development on port 8888 (override with WP_ENV_PORT) and
tests on port 8889 (override with WP_ENV_TESTS_PORT). The current working
directory must be a WordPress installation, a plugin, a theme, or contain a
.bdwm-wp-env.json file. After first insall, use the '--update' flag to download updates
to mapped sources and to re-apply WordPress configuration options.

Options:
  --update   Download source updates and apply WordPress configuration.
                                                      [boolean] [default: false]
```

### `bdwm-wp-env stop`

```sh
bdwm-wp-env stop

Stops running WordPress for development and tests and frees the ports.
```

### `bdwm-wp-env clean [environment]`

```sh
bdwm-wp-env clean [environment]

Cleans the WordPress databases.

Positionals:
  environment  Which environments' databases to clean.
            [string] [choices: "all", "development", "tests"] [default: "tests"]
```

### `bdwm-wp-env run [container] [command]`

```sh
bdwm-wp-env run <container> [command..]

Runs an arbitrary command in one of the underlying Docker containers. For
example, it can be useful for running wp cli commands. You can also use it to
open shell sessions like bash and the WordPress shell in the WordPress instance.
For example, `bdwm-wp-env run cli bash` will open bash in the development WordPress
instance.

Positionals:
  container  The container to run the command on.            [string] [required]
  command    The command to run.                           [array] [default: []]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --debug    Enable debug output.                     [boolean] [default: false]
```

For example:

```sh
bdwm-wp-env run cli wp user list
⠏ Running `wp user list` in 'cli'.

ID      user_login      display_name    user_email      user_registered roles
1       admin   admin   wordpress@example.com   2020-03-05 10:45:14     administrator

✔ Ran `wp user list` in 'cli'. (in 2s 374ms)
```

```sh
bdwm-wp-env run tests-cli wp shell
ℹ Starting 'wp shell' on the tests-cli container. Exit the WordPress shell with ctrl-c.

Starting 31911d623e75f345e9ed328b9f48cff6_mysql_1 ... done
Starting 31911d623e75f345e9ed328b9f48cff6_tests-wordpress_1 ... done
wp> echo( 'hello world!' );
hello world!
wp> ^C
✔ Ran `wp shell` in 'tests-cli'. (in 16s 400ms)
```

### `bdwm-wp-env destroy`

```sh
bdwm-wp-env destroy

Destroy the WordPress environment. Deletes docker containers, volumes, and
networks associated with the WordPress environment and removes local files.
```

### `bdwm-wp-env logs [environment]`

```sh
bdwm-wp-env logs

displays PHP and Docker logs for given WordPress environment.

Positionals:
  environment  Which environment to display the logs from.
      [string] [choices: "development", "tests", "all"] [default: "development"]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --debug    Enable debug output.                     [boolean] [default: false]
  --watch    Watch for logs as they happen.            [boolean] [default: true]
```

## .bdwm-wp-env.json

You can customize the WordPress installation, plugins and themes that the development environment will use by specifying a `.bdwm-wp-env.json` file in the directory that you run `bdwm-wp-env` from.

`.bdwm-wp-env.json` supports six fields for options applicable to both the tests and development instances.

| Field        | Type           | Default                                | Description                                                                                                                |
| ------------ | -------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `"core"`     | `string\|null` | `null`                                 | The WordPress installation to use. If `null` is specified, `bdwm-wp-env` will use the latest production release of WordPress.   |
| `"plugins"`  | `string[]`     | `[]`                                   | A list of plugins to install and activate in the environment.                                                              |
| `"themes"`   | `string[]`     | `[]`                                   | A list of themes to install in the environment. The first theme in the list will be activated.                             |
| `"port"`     | `integer`      | `8888` (`8889` for the tests instance) | The primary port number to use for the installation. You'll access the instance through the port: 'http://localhost:8888'. |
| `"config"`   | `Object`       | See below.                             | Mapping of wp-config.php constants to their desired values.                                                                |
| `"mappings"` | `Object`       | `"{}"`                                 | Mapping of WordPress directories to local directories to be mounted in the WordPress instance.                             |

_Note: the port number environment variables (`WP_ENV_PORT` and `WP_ENV_TESTS_PORT`) take precedent over the .bdwm-wp-env.json values._

Several types of strings can be passed into the `core`, `plugins`, `themes`, and `mappings` fields.

| Type              | Format                        | Example(s)                                               |
| ----------------- | ----------------------------- | -------------------------------------------------------- |
| Relative path     | `.<path>\|~<path>`            | `"./a/directory"`, `"../a/directory"`, `"~/a/directory"` |
| Absolute path     | `/<path>\|<letter>:\<path>`   | `"/a/directory"`, `"C:\\a\\directory"`                   |
| GitHub repository | `<owner>/<repo>[#<ref>]`      | `"WordPress/WordPress"`, `"WordPress/gutenberg#master"`  |
| ZIP File          | `http[s]://<host>/<path>.zip` | `"https://wordpress.org/wordpress-5.4-beta2.zip"`        |

Remote sources will be downloaded into a temporary directory located in `~/.bdwm-wp-env`.

Additionally, the key `env` is available to override any of the above options on an individual-environment basis. For example, take the following `.bdwm-wp-env.json` file:

```json
{
	"plugins": [ "." ],
	"config": {
		"KEY_1": true,
		"KEY_2": false
	},
	"env": {
		"development": {
			"themes": [ "./one-theme" ]
		},
		"tests": {
			"config": {
				"KEY_1": false
			},
			"port": 3000
		}
	}
}
```

On the development instance, `cwd` will be mapped as a plugin, `one-theme` will be mapped as a theme, KEY_1 will be set to true, and KEY_2 will be set to false. Also note that the default port, 8888, will be used as well.

On the tests instance, `cwd` is still mapped as a plugin, but no theme is mapped. Additionaly, while KEY_2 is still set to false, KEY_1 is overriden and set to false. 3000 overrides the default port as well.

This gives you a lot of power to change the options appliciable to each environment.

## .bdwm-wp-env.override.json

Any fields here will take precedence over .bdwm-wp-env.json. This file is useful when ignored from version control, to persist local development overrides. Note that options like `plugins` and `themes` are not merged. As a result, if you set `plugins` in your override file, this will override all of the plugins listed in the base-level config. The only keys which are merged are `config` and `mappings`. This means that you can set your own wp-config values without losing any of the default values.

## Default wp-config values.

On the development instance, these wp-config values are defined by default:

```
WP_DEBUG: true,
SCRIPT_DEBUG: true,
WP_PHP_BINARY: 'php',
WP_TESTS_EMAIL: 'admin@example.org',
WP_TESTS_TITLE: 'Test Blog',
WP_TESTS_DOMAIN: 'http://localhost',
WP_SITEURL: 'http://localhost',
WP_HOME: 'http://localhost',
```

On the test instance, all of the above are still defined, but `WP_DEBUG` and `SCRIPT_DEBUG` are set to false.

Additionally, the values referencing a URL include the specified port for the given environment. So if you set `testsPort: 3000, port: 2000`, `WP_HOME` (for example) will be `http://localhost:3000` on the tests instance and `http://localhost:2000` on the development instance.

### Examples

#### Latest production WordPress + current directory as a plugin

This is useful for plugin development.

```json
{
	"core": null,
	"plugins": [ "." ]
}
```

#### Latest development WordPress + current directory as a plugin

This is useful for plugin development when upstream Core changes need to be tested.

```json
{
	"core": "WordPress/WordPress#master",
	"plugins": [ "." ]
}
```

#### Local `wordpress-develop` + current directory as a plugin

This is useful for working on plugins and WordPress Core at the same time.

```json
{
	"core": "../wordpress-develop/build",
	"plugins": [ "." ]
}
```

#### A complete testing environment

This is useful for integration testing: that is, testing how old versions of WordPress and different combinations of plugins and themes impact each other.

```json
{
	"core": "WordPress/WordPress#5.2.0",
	"plugins": [ "WordPress/wp-lazy-loading", "WordPress/classic-editor" ],
	"themes": [ "WordPress/theme-experiments" ]
}
```

#### Add mu-plugins and other mapped directories

You can add mu-plugins via the mapping config. The mapping config also allows you to mount a directory to any location in the wordpress install, so you could even mount a subdirectory. Note here that theme-1, will not be activated, despite being the "first" mapped theme.

```json
{
	"plugins": [ "." ],
	"mappings": {
		"wp-content/mu-plugins": "./path/to/local/mu-plugins",
		"wp-content/themes": "./path/to/local/themes",
		"wp-content/themes/specific-theme": "./path/to/local/theme-1"
	}
}
```

#### Avoid activating plugins or themes on the instance

Since all plugins in the `plugins` key are activated by default, you should use the `mappings` key to avoid this behavior. This might be helpful if you have a test plugin that should not be activated all the time. The same applies for a theme which should not be activated.

```json
{
	"plugins": [ "." ],
	"mappings": {
		"wp-content/plugins/my-test-plugin": "./path/to/test/plugin"
	}
}
```

#### Map a plugin only in the tests environment

If you need a plugin active in one environment but not the other, you can use `env.<envName>` to set options specific to one environment. Here, we activate cwd and a test plugin on the tests instance. This plugin is not activated on any other instances.

```json
{
	"plugins": [ "." ],
	"env": {
		"tests": {
			"plugins": [ ".", "path/to/test/plugin" ]
		}
	}
}
```

#### Custom Port Numbers

You can tell `bdwm-wp-env` to use a custom port number so that your instance does not conflict with other `bdwm-wp-env` instances.

```json
{
	"plugins": [ "." ],
	"port": 4013,
	"env": {
		"tests": {
			"port": 4012
		}
	}
}
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
