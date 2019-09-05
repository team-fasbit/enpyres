<?php

// Block direct requests
if ( ! defined( 'ABSPATH' ) ) {
	wp_die('No cheating');
}

require_once( plugin_dir_path( __FILE__ ) . '/menu.php' );

if( ! class_exists( 'WYZIMobileMenu' ) ) {

	class WYZIMobileMenu extends WYZIMobileMenuParent {

		public function __construct() {

		}

		public function the_mobile_menu() {

			$this->set_menu_id();

			add_action( 'wyzi_after_header_menu', function() {
				echo '<div id="blurrMe">';
			} );

			add_action( 'wyzi_after_footer', function() {
				echo '</div>';
			} );?>

		<a href="#" id="wyz-mobile-menu-trigger"><i class="fa fa-bars" aria-hidden="true"></i></a>
		<div class="wyz-menu-sidebar closed">
			<a href="#" id="wyz-mobile-menu-close"><i class="fa fa-close" aria-hidden="true"></i></a>
			<!-- Mobile Menu -->
			<div class="mobile-menu">
				<nav id="mobile-navigation">
					<?php if ( '' != $this->menu_id ) {
						wp_nav_menu( array(
							'menu_id' => 'mobile-main-menu',
							'container' => false,
							'theme_location' => $this->menu_id,
						) );
					}?>
				</nav>
			</div>
		</div>

		<script>
		jQuery(document).ready(function(){


			// Toggle the blurred class
			var trigger = jQuery('#wyz-mobile-menu-trigger, #wyz-mobile-menu-close'),
			menu = jQuery('.wyz-menu-sidebar');

			trigger.on('click',function(e){
				e.preventDefault();
				jQuery(this).toggleClass('active');
				menu.toggleClass('closed');
				if(!jQuery('#mobile-main-menu').is(':visible')){
					jQuery('.meanmenu-reveal').trigger('click');
				}
				jQuery('#blurrMe').toggleClass('blurred'); // just here
			});

			var menuResizeId;
			jQuery(window).resize(function() {
				clearTimeout(menuResizeId);
				menuResizeId = setTimeout(refreshMobileMenu, 200);
			});


			function refreshMobileMenu() {
				var wWidth = jQuery(document).width();
				if(wWidth<=767){
					if(!(jQuery('#mobile-main-menu').is(':visible'))){
						jQuery('.meanmenu-reveal').trigger('click');

					}
				}
			}

		});
		</script>


		<style>
			a.meanmenu-reveal{display:none !important;}
		</style>
			
			<?php
		}
	}
}