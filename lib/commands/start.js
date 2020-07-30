/**
 * External dependencies
 */
const dockerCompose = require( 'docker-compose' );
const util = require( 'util' );
const path = require( 'path' );
const fs = require( 'fs' ).promises;
const inquirer = require( 'inquirer' );

/**
 * Promisified dependencies
 */
const sleep = util.promisify( setTimeout );
const rimraf = util.promisify( require( 'rimraf' ) );

/**
 * Internal dependencies
 */
const retry = require( '../retry' );
const stop = require( './stop' );
const initConfig = require( '../init-config' );
const downloadSources = require( '../download-sources' );
const {
	checkDatabaseConnection,
	makeContentDirectoriesWritable,
	configureWordPress,
	setupWordPressDirectories,
} = require( '../wordpress' );
const { didCacheChange, setCache } = require( '../cache' );
const md5 = require( '../md5' );

/**
 * @typedef {import('../config').Config} Config
 */
const CONFIG_CACHE_KEY = 'config_checksum';

/**
 * Starts the development server.
 *
 * @param {Object}  options
 * @param {Object}  options.spinner A CLI spinner which indicates progress.
 * @param {boolean} options.debug   True if debug mode is enabled.
 * @param {boolean} options.update  If true, update sources.
 */
module.exports = async function start( { spinner, debug, update } ) {
	spinner.text = 'Reading configuration.';
	await checkForLegacyInstall( spinner );

	const config = await initConfig( { spinner, debug } );

	if ( ! config.detectedLocalConfig ) {
		const { configDirectoryPath } = config;
		spinner.warn(
			`Warning: could not find a .bdwm-wp-env.json configuration file and could not determine if '${ configDirectoryPath }' is a WordPress installation, a plugin, or a theme.`
		);
		spinner.start();
	}

	// Check if the hash of the config has changed. If so, run configuration.
	const configHash = md5( config );
	const workDirectoryPath = config.workDirectoryPath;
	const shouldConfigureWp =
		update ||
		( await didCacheChange( CONFIG_CACHE_KEY, configHash, {
			workDirectoryPath,
		} ) );

	/**
	 * If the Docker image is already running and the `bdwm-wp-env` files have been
	 * deleted, the start command will not complete successfully. Stopping
	 * the container before continuing allows the docker entrypoint script,
	 * which restores the files, to run again when we start the containers.
	 *
	 * Additionally, this serves as a way to restart the container entirely
	 * should the need arise.
	 *
	 * @see https://github.com/WordPress/gutenberg/pull/20253#issuecomment-587228440
	 */
	if ( shouldConfigureWp ) {
		await stop( { spinner, debug } );
		spinner.text = 'Downloading sources.';
	}

	await Promise.all( [
		dockerCompose.upOne( 'mysql', {
			config: config.dockerComposeConfigPath,
			log: config.debug,
		} ),
		shouldConfigureWp && downloadSources( config, spinner ),
	] );

	if ( shouldConfigureWp ) {
		await setupWordPressDirectories( config );
	}

	spinner.text = 'Starting WordPress.';

	await dockerCompose.upMany( [ 'wordpress', 'tests-wordpress' ], {
		config: config.dockerComposeConfigPath,
		log: config.debug,
	} );

	// Only run WordPress install/configuration when config has changed.
	if ( shouldConfigureWp ) {
		spinner.text = 'Configuring WordPress.';

		if ( config.coreSource === null ) {
			// Don't chown wp-content when it exists on the user's local filesystem.
			await Promise.all( [
				makeContentDirectoriesWritable( 'development', config ),
				makeContentDirectoriesWritable( 'tests', config ),
			] );
		}

		try {
			await checkDatabaseConnection( config );
		} catch ( error ) {
			// Wait 30 seconds for MySQL to accept connections.
			await retry( () => checkDatabaseConnection( config ), {
				times: 30,
				delay: 1000,
			} );

			// It takes 3-4 seconds for MySQL to be ready after it starts accepting connections.
			await sleep( 4000 );
		}

		// Retry WordPress installation in case MySQL *still* wasn't ready.
		await Promise.all( [
			retry( () => configureWordPress( 'development', config, spinner ), {
				times: 2,
			} ),
			retry( () => configureWordPress( 'tests', config, spinner ), {
				times: 2,
			} ),
		] );

		// Set the cache key once everything has been configured.
		await setCache( CONFIG_CACHE_KEY, configHash, {
			workDirectoryPath,
		} );
	}

	spinner.text = 'WordPress started.';
};

/**
 * Checks for legacy installs and provides
 * the user the option to delete them.
 *
 * @param {Object} spinner A CLI spinner which indicates progress.
 */
async function checkForLegacyInstall( spinner ) {
	const basename = path.basename( process.cwd() );
	const installs = [
		`../${ basename }-wordpress`,
		`../${ basename }-tests-wordpress`,
	];
	await Promise.all(
		installs.map( ( install ) =>
			fs
				.access( install )
				.catch( () =>
					installs.splice( installs.indexOf( install ), 1 )
				)
		)
	);
	if ( ! installs.length ) {
		return;
	}

	spinner.info(
		`It appears that you have used a previous version of this tool where installs were kept in ${ installs.join(
			' and '
		) }. Installs are now in your home folder.\n`
	);
	const { yesDelete } = await inquirer.prompt( [
		{
			type: 'confirm',
			name: 'yesDelete',
			message:
				'Do you wish to delete these old installs to reclaim disk space?',
			default: true,
		},
	] );
	if ( yesDelete ) {
		await Promise.all( installs.map( ( install ) => rimraf( install ) ) );
		spinner.info( 'Old installs deleted successfully.' );
	}
	spinner.start();
}
