<?php
/**
 * Theme Functions
 *
 * @package wyz
 * @author WzTechno
 * @link http://www.wztechno.com
 */
define( 'WYZ_THEME_DIR', get_template_directory() );
define( 'WYZ_THEME_URI', get_template_directory_uri() );
define( 'WYZ_CSS_DIR', WYZ_THEME_DIR . '/css' );
define( 'WYZ_CSS_URI', WYZ_THEME_URI . '/css' );
define( 'WYZ_IMPORT_DIR', WYZ_THEME_DIR . '/auto-import' );
define( 'WYZ_IMPORT_URI', WYZ_THEME_DIR . '/auto-import' );
define( 'WYZ_TEMPLATES_DIR', WYZ_THEME_DIR . '/templates' );
define('ULTIMATE_NO_EDIT_PAGE_NOTICE', true);
define('ULTIMATE_NO_PLUGIN_PAGE_NOTICE', true);

/*
===========================================================================
 * Loads theme options files
=========================================================================
*/

require_once( WYZ_THEME_DIR . '/includes/theme-options.php' );


/*
===========================================================================
 * Add theme supports
===========================================================================
*/

add_action( 'after_setup_theme', 'wyz_after_theme_setup' );

/**
 * Add theme supports and includes one-click importer.
 */
function wyz_after_theme_setup() {
	global $wp_version, $content_width;
	if ( version_compare( $wp_version, '3.0', '>=' ) ) {
		add_theme_support( 'automatic-feed-links' );
	}
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'woocommerce' );
	if ( ! isset( $content_width ) ) {
		$set_width = wyz_get_option( 'content-width' );
		if ( ! isset( $set_width ) || empty( $set_width ) ) {
			$content_width = 1140;
		} else {
			$content_width = esc_html( $set_width );
		}
	}

	if ( ! function_exists( '_wp_render_title_tag' ) ) {
		/**
		 * Displays title in page header.
		 */
		function wyz_render_title() {?>
			<title><?php wp_title();?></title>
		<?php }
		add_action( 'wp_head', 'wyz_render_title' );
	} else {
		add_theme_support( 'title-tag' );
	}
	add_theme_support( 'custom-background' );
	add_theme_support( 'custom-logo' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	if ( wyz_get_option('resp') != 'off') {
		add_theme_support( 'responsive-embeds' );
	}

	add_theme_support( 'editor-color-palette', array(
		array(
			'name'  => __( 'Wyzi Blue', 'wyzi-business-finder' ),
			'slug'  => 'wyzi-blue',
			'color' => '#00aeff',
		),
		array(
			'name'  => __( 'Wyzi Light Blue', 'wyzi-business-finder' ),
			'slug'  => 'wyzi-light-blue',
			'color' => '#e4ecf3',
		),
		array(
			'name'  => __( 'Wyzi Dark blue', 'wyzi-business-finder' ),
			'slug'  => 'wyzi-dark-blue',
			'color' => '#2d343d',
		),
		array(
			'name'  => __( 'Wyzi Orange', 'wyzi-business-finder' ),
			'slug'  => 'wyzi-orange',
			'color' => '#ff6d1e',
		),
	) );


    load_theme_textdomain( 'wyzi-business-finder', WYZ_THEME_DIR . '/languages' );

	require WYZ_IMPORT_URI . '/wyz-importer.php';
}


require_once( WYZ_THEME_DIR . '/wyz-core/wyz-hooks.php' );
if ( ! defined('ENVATO_HOSTED_SITE') ) {
	require_once( WYZ_THEME_DIR . '/wyz-core/server-status.php' );
}

//include cmb2 color picker rgba
require_once( WYZ_THEME_DIR . '/includes/cmb2/jw-cmb2-rgba-colorpicker.php' );

// Register Custom Navigation Walker.
require_once( WYZ_THEME_DIR . '/includes/wp_bootstrap_navwalker.php' );


if ( function_exists( 'register_nav_menus' ) ) {
	register_nav_menus( array(
		'primary' => esc_html__( 'Primary Menu', 'wyzi-business-finder' ),
		'footer' => esc_html__( 'Footer Menu', 'wyzi-business-finder' ),
		'sticky_footer' => esc_html__( 'Sticky Footer Menu', 'wyzi-business-finder' ),
		'login' => esc_html__( 'Login Menu', 'wyzi-business-finder' ),
		'mobile' => esc_html__( 'Mobile Menu', 'wyzi-business-finder' ),
	) );
}

// Get headers.
require_once( WYZ_TEMPLATES_DIR . '/headers/header-factory.php' );
require_once( WYZ_TEMPLATES_DIR . '/mobile-menus/menu-factory.php' );

// Get footers.
require_once( WYZ_TEMPLATES_DIR . '/footers/footer-factory.php' );

// Get sidebars.
require_once( WYZ_THEME_DIR . '/sidebar/register-sidebars.php' );

// Filter for theme options.
require_once( WYZ_THEME_DIR . '/wyz-core/theme-options-filters.php' );

// Get wizy core functions.
require_once( WYZ_THEME_DIR . '/wyz-core/wyz-core-functions.php' );

// Register required plugins.
require_once( WYZ_THEME_DIR . '/TGMPA/setup.php' );

// Specify the number of Items per shop page in Woocommerce
add_filter( 'loop_shop_per_page', function($cols) { return 8; }, 20 );


?>
