<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'brian');

/** MySQL database password */
define('DB_PASSWORD', 'ravyn0810');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'mZUQ7i1%iGT&++>]F-#&j#ye?{{b/{<od?/&:BiRSKa2|-SpDJC~_t[_krl*e3cn');
define('SECURE_AUTH_KEY',  ':P!K}Bsa5edHX*gfGblgu7FMl`$oBY`k!8PlPSygZ26:^Am%o%sL+>Y:0fzD;~}@');
define('LOGGED_IN_KEY',    '+-m&~imsPMR/J-b^b2RCkBbKnLt-]yaD7ZK87BA1s2 1zfYXQ.^-A>EW0RcL7}Zn');
define('NONCE_KEY',        'f{W6~hSkF}M=KL8f5FRyp(R$-BzB|4 cWQ(;Oqm-6Znsu8DMfr +<]_N;X&`I|Yr');
define('AUTH_SALT',        '#7b_9}+=-@so~nHA|if{QM,!&y6g}e++Yl>Op2|c.wpJ:h|yvra`;vLdIqL}>+|7');
define('SECURE_AUTH_SALT', 'y3Jsz[P3wG3TgKQTvs-;qqSBDgIR|K=|)-cOo-]ad^Q+-`ui1qf?b~-_<~C1^/@<');
define('LOGGED_IN_SALT',   '-|)O!|nfW8^#5D-k9s46`aiU1aIMn|ORWTglb6X-CiBHpuvbEY,vWjQWJX5{3KNa');
define('NONCE_SALT',       '*C{W_J-W@PO+-N2CB)-;3rx2ue:z$:!;XSKbS_~JoD$~)%XyWSh1g@bfw(xS]A}r');


/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);
define('FS_METHOD', 'direct');
define('WP_MEMORY_LIMIT', '512M');
set_time_limit(600);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
