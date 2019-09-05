// source --> https://enpires.com/wp-content/plugins/wyz-toolkit/booked/includes/add-ons/booked-woocommerce-payments//js/frontend-functions.js?ver=5.0.3 
;(function($, window, document, undefined) {
	var $win = $(window);
	var $doc = $(document);
	var $field_container;

	$doc.ready(function() {
			
		$(document).on("booked-on-new-app", function(event) {
			$field_container = $('.field.field-paid-service');
			booked_wc_products_field($field_container);
		});

		booked_wc_btn_edit_appointment_shortcode();
		booked_wc_btn_edit_appointment_popup_app();
		booked_wc_btn_pay_appointment_shortcode();

		$(document).on("booked-before-loading-calendar-booking-options", function(event) {
			booked_wc_change_calendar_loading_paramenters();
		});
		
		$(document).on("booked-before-loading-booking-form", function(event) {
			booked_wc_change_booking_form_paramenters();
		});

		$(document).on("booked-on-requested-appointment", function(event,redirectObj) {
			redirectObj.redirect = booked_wc_redirect_to_checkout_if_product_option();
		});
		
	});

	function booked_wc_products_field(field_container) {

		var $dropdown = $('select', field_container);

		$dropdown.on('change', function() {
			var $this = $(this),
				calendar_id = parseInt( $this.data('calendar-id') ),
				product_id = $this.val(),
				field_name = $this.attr('name'),
				$variations_container = $this.parent().find('.paid-variations');

			booked_wc_load_variations(product_id, field_name, calendar_id, $variations_container);
		});
	}

	function booked_wc_load_variations( product_id, field_name, calendar_id, variations_container ) {

		if ( !product_id ) {
			variations_container.html('');
			return;
		};

		var data = {
			'action': booked_wc_variables.prefix + 'load_variations',
			'product_id': parseInt(product_id),
			'calendar_id': calendar_id,
			'field_name': field_name
		};

		$.post(
			booked_wc_variables.ajaxurl,
			data,
			function(response) {
				variations_container.html(response);
				resize_booked_modal();
			}
		);
	}

	function booked_wc_btn_edit_appointment_shortcode() {
		$('.booked-profile-appt-list .appt-block .edit').on('click', function(event) {

			event.preventDefault();

			var $button = $(this),
				appt_id = $button.attr('data-appt-id'),
				calendar_link = $button.attr('data-app-calendar');
				
			if (booked_wc_variables.i18n_confirm_appt_edit){
				confirm_edit = confirm(booked_wc_variables.i18n_confirm_appt_edit);
			} else {
				confirm_edit = true;
			}
			
			if ( confirm_edit === true ) {
				window.location.href = calendar_link;
			}

			return false;
		});
	}

	function booked_wc_btn_pay_appointment_shortcode() {
		$('.booked-profile-appt-list .appt-block .pay').on('click', function(event) {

			event.preventDefault();

			var $button = $(this),
				appt_id = $button.attr('data-appt-id');

			confirm_edit = confirm(booked_wc_variables.i18n_pay);
			if ( confirm_edit===true ){

				var data = {
					'action': booked_wc_variables.prefix + 'add_to_cart',
					'app_id': appt_id
				};

				jQuery.post(booked_wc_variables.ajaxurl, data, function(response) {
					if ( response.status === 'success' ) {
						window.location.href = booked_wc_variables.checkout_page;
					} else {
						alert( response.messages[0] );
					};
				}, 'json');
			}

			return false;
		});
	}

	function booked_wc_change_calendar_loading_paramenters() {
		
		if ( !booked_load_calendar_date_booking_options ) {
			return;
		};

		var current_url = window.location.href,
			url_parameters = current_url.replace(/^[^?]+\??/gi, ''),
			url_parameters_parts = url_parameters ? url_parameters.split('&') : false;

		if (url_parameters_parts && current_url.match('booked_wc_extension')) {

			// populate additional loading parameters
			for (var i = 0; i < url_parameters_parts.length; i++) {
				var data = url_parameters_parts[i].split('='),
					name = data[0].replace(/_\d+$/, ''),
					value = data[1];

				booked_load_calendar_date_booking_options[name] = value;
			}
		};
		
	}
	
	function booked_wc_change_booking_form_paramenters() {
		if ( !booked_appt_form_options ) {
			return;
		};

		var current_url = window.location.href,
			url_parameters = current_url.replace(/^[^?]+\??/gi, ''),
			url_parameters_parts = url_parameters ? url_parameters.split('&') : false;

		if (url_parameters_parts && current_url.match('booked_wc_extension')) {

			// populate additional loading parameters
			for (var i = 0; i < url_parameters_parts.length; i++) {
				var data = url_parameters_parts[i].split('='),
					name = data[0].replace(/_\d+$/, ''),
					value = data[1];

				booked_appt_form_options[name] = value;
			}
		};
		
	}

	function booked_wc_redirect_to_checkout_if_product_option() {
	
		var redirect = false,
			$form = $('form#newAppointmentForm');

		// This checks if a WooCommerce field is being set
		$('.field-paid-service', $form).each(function() { 
			var $this = $(this);

			$('select', $this).each(function() {
				var $this_select = $(this);

				if ( $this_select.val()!=='' ) {
					redirect = true;
				};
			});
		});

		// This checks if a WooCommerce field is not being set & there is a price
		if (redirect == false && document.getElementById("newAppointmentForm").elements["price"] !=null ) { 
			if(document.getElementById("newAppointmentForm").elements["price"].value !=0){
				redirect = true;
			}
		}

		if ( redirect ) {
			window.location = booked_wc_variables.checkout_page;
			return true;
		}
		
		return false;
		
	}

	function booked_wc_btn_edit_appointment_popup_app() {
		
		$doc.on('click', '.booked-form input#submit-edit-request-appointment', function(e){
			
			var $thisButton = $(this);
			
			$('form#newAppointmentForm p.status').show().html('<i class="booked-icon booked-icon-spinner-clock booked-icon-spin"></i>&nbsp;&nbsp;&nbsp;' + booked_js_vars.i18n_please_wait);
	        resize_booked_modal();
			
			e.preventDefault();
			
			$.ajax({
				type	: 'post',
				url 	: booked_js_vars.ajax_url,
				data	: $('#newAppointmentForm').serialize(),
				success	: function(data) {

					data = data.split('###');
					var data_result = data[0].substr(data[0].length - 5);

					if (data_result == 'error'){

						$thisButton.attr('disabled',false);
						$thisButton.parents('form').find('button.cancel').show();

						$('.booked-form input').each(function(){
							thisDefault = $(this).attr('title');
							thisVal = $(this).val();
							if (!thisVal){ $(this).val(thisDefault); }
						});

						$('form#newAppointmentForm p.status').show().html('<i class="booked-icon booked-icon-alert" style="color:#E35656"></i>&nbsp;&nbsp;&nbsp;' + data[1]);
						resize_booked_modal();

					} else {
						
						window.location = booked_js_vars.profilePage

					}

				}
			});
		});
		
	}

})(jQuery, window, document);
// source --> https://enpires.com/wp-content/plugins/Ultimate_VC_Addons/assets/min-js/ultimate-params.min.js?ver=3.17.1 
jQuery(document).ready(function(a){var b="",c="",d="",e="",f="",g="";jQuery(".ult-responsive").each(function(h,i){var j=jQuery(this),k=j.attr("data-responsive-json-new"),l=j.data("ultimate-target"),m="",n="",o="",p="",q="",r="";void 0===k&&null==k||a.each(a.parseJSON(k),function(a,b){var c=a;if(void 0!==b&&null!=b){var d=b.split(";");jQuery.each(d,function(a,b){if(void 0!==b||null!=b){var d=b.split(":");switch(d[0]){case"large_screen":m+=c+":"+d[1]+";";break;case"desktop":n+=c+":"+d[1]+";";break;case"tablet":o+=c+":"+d[1]+";";break;case"tablet_portrait":p+=c+":"+d[1]+";";break;case"mobile_landscape":q+=c+":"+d[1]+";";break;case"mobile":r+=c+":"+d[1]+";"}}})}}),""!=r&&(g+=l+"{"+r+"}"),""!=q&&(f+=l+"{"+q+"}"),""!=p&&(e+=l+"{"+p+"}"),""!=o&&(d+=l+"{"+o+"}"),""!=n&&(c+=l+"{"+n+"}"),""!=m&&(b+=l+"{"+m+"}")});var h="<style>/** Ultimate: Media Responsive **/ ";h+=c,h+="@media (max-width: 1199px) { "+d+"}",h+="@media (max-width: 991px)  { "+e+"}",h+="@media (max-width: 767px)  { "+f+"}",h+="@media (max-width: 479px)  { "+g+"}",h+="/** Ultimate: Media Responsive - **/</style>",jQuery("head").append(h)});
// source --> https://enpires.com/wp-content/plugins/Ultimate_VC_Addons/assets/min-js/jquery-appear.min.js?ver=3.17.1 
!function(a){a.fn.bsf_appear=function(b,c){var d=a.extend({data:void 0,one:!0,accX:0,accY:0},c);return this.each(function(){var c=a(this);if(c.bsf_appeared=!1,!b)return void c.trigger("bsf_appear",d.data);var e=a(window),f=function(){if(!c.is(":visible"))return void(c.bsf_appeared=!1);var a=e.scrollLeft(),b=e.scrollTop(),f=c.offset(),g=f.left,h=f.top,i=d.accX,j=d.accY,k=c.height(),l=e.height(),m=c.width(),n=e.width();h+k+j>=b&&h<=b+l+j&&g+m+i>=a&&g<=a+n+i?c.bsf_appeared||c.trigger("bsf_appear",d.data):c.bsf_appeared=!1},g=function(){if(c.bsf_appeared=!0,d.one){e.unbind("scroll",f);var g=a.inArray(f,a.fn.bsf_appear.checks);g>=0&&a.fn.bsf_appear.checks.splice(g,1)}b.apply(this,arguments)};d.one?c.one("bsf_appear",d.data,g):c.bind("bsf_appear",d.data,g),e.scroll(f),a.fn.bsf_appear.checks.push(f),f()})},a.extend(a.fn.bsf_appear,{checks:[],timeout:null,checkAll:function(){var b=a.fn.bsf_appear.checks.length;if(b>0)for(;b--;)a.fn.bsf_appear.checks[b]()},run:function(){a.fn.bsf_appear.timeout?(clearTimeout(a.fn.bsf_appear.timeout),a.fn.bsf_appear.timeout=setTimeout(a.fn.bsf_appear.checkAll,20)):a.fn.bsf_appear.timeout=setTimeout(a.fn.bsf_appear.checkAll,20)}}),a.each(["append","prepend","after","before","attr","removeAttr","addClass","removeClass","toggleClass","remove","css","show","hide"],function(b,c){var d=a.fn[c];d&&(a.fn[c]=function(){var b=d.apply(this,arguments);return a.fn.bsf_appear.run(),b})})}(jQuery);
// source --> https://enpires.com/wp-content/plugins/Ultimate_VC_Addons/assets/min-js/custom.min.js?ver=3.17.1 
!function(a){"use strict";function b(a,b,c){if("img"===c){var d=parseInt(b.outerHeight()),e=d/2;a.css("padding-top",e+"px"),a.parent().css("margin-top",e+20+"px"),b.css("top",-d+"px")}else{var d=parseInt(b.outerHeight()),e=d/2;a.css("padding-top",e+"px"),a.parent().css("margin-top",e+20+"px"),b.css("top",-d+"px")}}function c(b){b.find(".timeline-icon-block").length>0&&a(".timeline-block").each(function(b,c){var d=a(this).find(".timeline-header-block"),e=a(this).find(".timeline-icon-block");e.css({position:"absolute"});var f=e.outerHeight(),g=e.outerWidth(),h=-g/2;parseInt(d.find(".timeline-header").css("padding-left").replace(/[^\d.]/g,""));a(this).hasClass("timeline-post-left")?(e.css({left:h,right:"auto"}),jQuery("body").hasClass("rtl")&&e.css({left:"auto",right:h})):a(this).hasClass("timeline-post-right")&&(e.css({left:"auto",right:h}),jQuery("body").hasClass("rtl")&&e.css({left:h,right:"auto"}));var i=d.height(),j=i/2,k=f/2,l=j-k;e.css({top:l});var m=e.offset().left,n=a(window).width();(0>m||n<m+g)&&(e.css({position:"relative",top:"auto",left:"auto",right:"auto","text-align":"center"}),e.children().children().css({margin:"10px auto"}),d.css({padding:"0"}))})}function d(){jQuery(".ult-animation").each(function(){if(jQuery(this).attr("data-animate")){var a=jQuery(this).children("*"),b=jQuery(this).attr("data-animate"),c=jQuery(this).attr("data-animation-duration")+"s",d=jQuery(this).attr("data-animation-iteration"),f=jQuery(this).attr("data-animation-delay"),g=(jQuery(this).attr("data-opacity_start_effect"),"opacity:1;-webkit-animation-delay:"+f+"s;-webkit-animation-duration:"+c+";-webkit-animation-iteration-count:"+d+"; -moz-animation-delay:"+f+"s;-moz-animation-duration:"+c+";-moz-animation-iteration-count:"+d+"; animation-delay:"+f+"s;animation-duration:"+c+";animation-iteration-count:"+d+";"),h="opacity:1;-webkit-transition-delay: "+f+"s; -moz-transition-delay: "+f+"s; transition-delay: "+f+"s;";if(e(jQuery(this))){var i=jQuery(this).attr("style");void 0===i&&(i="test"),i=i.replace(/ /g,""),"opacity:0;"==i&&0!==i.indexOf(h)&&jQuery(this).attr("style",h),jQuery.each(a,function(a,c){var d=jQuery(c),f=d.attr("style");void 0===f&&(f="test");var h="";h=0==f.indexOf(g)?f:g+f,d.attr("style",h),e(d)&&d.addClass("animated").addClass(b)})}}})}function e(a){var b=jQuery(window).scrollTop(),c=jQuery(window).height();if(jQuery(a).hasClass("ult-animate-viewport"))var d=jQuery(a).data("opacity_start_effect");if(void 0===d||""==d)var e=2;else var e=100-d;jQuery(a).outerHeight();return jQuery(a).offset().top-b<=c-c*(e/100)}function f(){jQuery(".ult-new-ib").each(function(a,b){var c=jQuery(this);if(c.hasClass("ult-ib-resp")){var d=jQuery(document).width(),e=c.data("min-width");d<=c.data("max-width")&&d>=e?c.find(".ult-new-ib-content").hide():c.find(".ult-new-ib-content").show()}})}function g(){var b="";a(".ult-spacer").each(function(c,d){var e=a(d).data("id"),f=(a("body").width(),a(d).data("height-mobile")),g=a(d).data("height-mobile-landscape"),h=a(d).data("height-tab"),i=a(d).data("height-tab-portrait"),j=a(d).data("height");""!=j&&(b+=" .spacer-"+e+" { height:"+j+"px } "),""==h&&"0"!=h&&0!=h||(b+=" @media (max-width: 1199px) { .spacer-"+e+" { height:"+h+"px } } "),void 0===i||""==i&&"0"!=i&&0!=i||(b+=" @media (max-width: 991px) { .spacer-"+e+" { height:"+i+"px } } "),void 0===g||""==g&&"0"!=g&&0!=g||(b+=" @media (max-width: 767px) { .spacer-"+e+" { height:"+g+"px } } "),""==f&&"0"!=f&&0!=f||(b+=" @media (max-width: 479px) { .spacer-"+e+" { height:"+f+"px } } ")}),""!=b&&(b="<style>"+b+"</style>",a("head").append(b))}a.fn.vc_translate_row=function(){var b=a(window).scrollTop(),c=a(window).height();a(this).each(function(d,e){var f=a(e).attr("data-row-effect-mobile-disable");if(f=void 0===f?"false":f.toString(),/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))var g="true";else var g="false";if("true"==g&&"true"==f)var h="true";else var h="false";if("false"==h){var i=a(e).outerHeight(),j=a(e).offset().top,k=j-b,l=k+i,m=a(e).attr("data-parallax-content-sense"),n=m/100,o=0;if(l<=c-0*c&&k<=0){if(i>c)var o=(c-l)*n;else var o=-k*n;o<0&&(o=0)}else o=0;a(e).find(".vc-row-translate-wrapper").children().each(function(b,c){jQuery(c).is(".upb_row_bg,.upb_video-wrapper,.ult-vc-seperator,.ult-easy-separator-wrapper")||a(c).css({transform:"translate3d(0,"+o+"px,0)","-webkit-transform":"translate3d(0,"+o+"px,0)","-ms-transform":"translate3d(0,"+o+"px,0)"})})}})},a.fn.vc_fade_row=function(){var b=a(window).scrollTop(),c=a(window).height();a(this).each(function(d,e){var f=a(e).attr("data-row-effect-mobile-disable");if(f=void 0===f?"false":f.toString(),/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))var g="true";else var g="false";if("true"==g&&"true"==f)var h="true";else var h="false";if("false"==h){var i=a(e).data("fadeout-percentage");i=100-i;var j=a(e).outerHeight(),k=a(e).offset().top,l=k-b,m=l+j,n=1,o=c-c*(i/100),p=(o-m)/o*1;p>0&&(n=1-p),m<=o?(n<0?n=0:n>1&&(n=1),a(e).children().each(function(b,c){a(c).is(".upb_row_bg,.upb_video-wrapper,.ult-vc-seperator")||a(c).css({opacity:n})})):a(e).children().each(function(b,c){a(c).css({opacity:n})})}})},jQuery(document).ready(function(){g()}),jQuery(window).scroll(function(){var b=jQuery(".ult-no-mobile").length;/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)&&b>=1?jQuery(".ult-animation").css("opacity",1):d(),a(".vc-row-fade").vc_fade_row(),a(".vc-row-translate").vc_translate_row()}),jQuery(window).load(function(){function b(){return"ontouchstart"in window||navigator.MaxTouchPoints>0||navigator.msMaxTouchPoints>0}jQuery(".ult-banner-block-custom-height").each(function(a,b){var c=jQuery(this).find("img"),d=jQuery(this).width(),e=jQuery(this).height();c.width();d>e&&c.css({width:"100%",height:"auto"})}),jQuery(".ult-new-ib").each(function(a,c){b()&&jQuery(this).find(".ult-new-ib-link").click(function(a){a.preventDefault();var b=jQuery(this).attr("href"),c=jQuery(this).data("touch-delay");null==c&&(c=200),setTimeout(function(){window.location=b},c)})});var d=0,e=0,g=function(){jQuery(".ifb-jq-height").each(function(){jQuery(this).find(".ifb-back").css("height","auto"),jQuery(this).find(".ifb-front").css("height","auto");var a=parseInt(jQuery(this).find(".ifb-front > div").outerHeight(!0)),b=parseInt(jQuery(this).find(".ifb-back > div").outerHeight(!0)),c=a>b?a:b;jQuery(this).find(".ifb-front").css("height",c+"px"),jQuery(this).find(".ifb-back").css("height",c+"px"),jQuery(this).hasClass("vertical_door_flip")?jQuery(this).find(".ifb-flip-box").css("height",c+"px"):jQuery(this).hasClass("horizontal_door_flip")?jQuery(this).find(".ifb-flip-box").css("height",c+"px"):jQuery(this).hasClass("style_9")&&jQuery(this).find(".ifb-flip-box").css("height",c+"px")}),jQuery(".ifb-auto-height").each(function(){if(jQuery(this).hasClass("horizontal_door_flip")||jQuery(this).hasClass("vertical_door_flip")){var a=parseInt(jQuery(this).find(".ifb-front > div").outerHeight()),b=parseInt(jQuery(this).find(".ifb-back > div").outerHeight()),c=a>b?a:b;jQuery(this).find(".ifb-flip-box").css("height",c+"px")}})};-1!=navigator.userAgent.indexOf("Safari")&&-1==navigator.userAgent.indexOf("Chrome")?setTimeout(function(){g()},500):g(),jQuery(document).on("ultAdvancedTabClicked",function(a,b){g()}),jQuery(window).resize(function(){d++,setTimeout(function(){e++,d==e&&g()},500)});var h=0;jQuery(window).resize(function(){f(),jQuery(".csstime.smile-icon-timeline-wrap").each(function(){c(jQuery(this))}),a(".jstime .timeline-wrapper").each(function(){c(jQuery(this))}),"none"==jQuery(".smile-icon-timeline-wrap.jstime .timeline-line").css("display")?0===h&&(a(".jstime .timeline-wrapper").masonry("destroy"),h=1):1==h&&(jQuery(".jstime .timeline-wrapper").masonry({itemSelector:".timeline-block"}),setTimeout(function(){jQuery(".jstime .timeline-wrapper").masonry({itemSelector:".timeline-block",width:"401px"}),jQuery(this).find(".timeline-block").each(function(){jQuery(this).css("left","initial"),"0px"==jQuery(this).css("left")?jQuery(this).addClass("timeline-post-left"):jQuery(this).addClass("timeline-post-right")}),h=0},300))}),a(".smile-icon-timeline-wrap").each(function(){var b=jQuery(this).data("timeline-cutom-width");b&&jQuery(this).css("width",2*b+40+"px");var d=parseInt(jQuery(this).width()),e=parseInt(jQuery(this).find(".timeline-block").width()),f=d-2*e-40;f=f/d*100,a(".jstime .timeline-wrapper").each(function(){jQuery(this).masonry({itemSelector:".timeline-block"})}),setTimeout(function(){a(".jstime .timeline-wrapper").each(function(){jQuery(this).find(".timeline-block").each(function(){"0px"==jQuery(this).css("left")?jQuery(this).addClass("timeline-post-left"):jQuery(this).addClass("timeline-post-right"),c(jQuery(this))}),jQuery(".timeline-block").each(function(){var a=parseInt(jQuery(this).css("top"))-parseInt(jQuery(this).next().css("top"));a<14&&a>0||0==a?jQuery(this).next().addClass("time-clash-right"):a>-14&&jQuery(this).next().addClass("time-clash-left")})}),jQuery(".timeline-post-right").each(function(){var a=jQuery(this).find(".timeline-icon-block").clone();jQuery(this).find(".timeline-icon-block").remove(),jQuery(this).find(".timeline-header-block").after(a)}),jQuery(".smile-icon-timeline-wrap").each(function(){var a=jQuery(this).data("time_block_bg_color");jQuery(this).find(".timeline-block").css("background-color",a),jQuery(this).find(".timeline-post-left.timeline-block l").css("border-left-color",a),jQuery(this).find(".timeline-post-right.timeline-block l").css("border-right-color",a),jQuery(this).find(".feat-item").css("background-color",a),jQuery(this).find(".feat-item").find(".feat-top").length>0?jQuery(this).find(".feat-item l").css("border-top-color",a):jQuery(this).find(".feat-item l").css("border-bottom-color",a),jQuery(".jstime.timeline_preloader").remove(),jQuery(this).find("div").hasClass("timeline-wrapper")?jQuery(this).css("opacity","1"):jQuery(this).remove()})},1e3),jQuery(this).find(".timeline-line ").next().hasClass("timeline-separator-text")||jQuery(this).find(".timeline-line").prepend("<span></span>");var g=jQuery(this).data("time_sep_color"),h=jQuery(this).data("time_sep_bg_color"),i=jQuery(".smile-icon-timeline-wrap .timeline-line").css("border-right-color");jQuery(this).find(".timeline-dot").css("background-color",h),jQuery(this).find(".timeline-line span").css("background-color",h),jQuery(this).find(".timeline-line span").css("background-color",h),jQuery(this).find(".timeline-separator-text").css("color",g),jQuery(this).find(".timeline-separator-text .sep-text").css("background-color",h),jQuery(this).find(".ult-timeline-arrow s").css("border-color","rgba(255, 255, 255, 0) "+i),jQuery(this).find(".feat-item .ult-timeline-arrow s").css("border-color",i+" rgba(255, 255, 255, 0)"),jQuery(this).find(".timeline-block").css("border-color",i),jQuery(this).find(".feat-item").css("border-color",i)})}),jQuery(document).ready(function(a){var e=jQuery(".ult-no-mobile").length;/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)&&e>=1?jQuery(".ult-animation").css("opacity",1):d(),f(),jQuery(".ubtn").hover(function(){var a=jQuery(this);a.find(".ubtn-text").css("color",a.data("hover")),a.find(".ubtn-hover").css("background",a.data("hover-bg")).addClass("ubtn-hover-active");var b=""!=a.data("hover-bg")&&a.data("hover-bg");setTimeout(function(){!1!==b&&a.hasClass(".ubtn-fade-bg")&&a.css("background",a.data("hover-bg"))},150);var c=a.attr("style");if(""!=a.data("shadow-hover")){a.css("box-shadow");c+="box-shadow:"+a.data("shadow-hover")}if(a.attr("style",c),""!=a.data("border-hover")&&a.css("border-color",a.data("border-hover")),"none"!=a.data("shadow-click")){var d=a.data("shd-shadow")-3;""!=a.is(".shd-left")?a.css({right:d}):""!=a.is(".shd-right")?a.css({left:d}):""!=a.is(".shd-top")?a.css({bottom:d}):""!=a.is(".shd-bottom")&&a.css({top:d})}},function(){var a=jQuery(this);a.find(".ubtn-text").removeAttr("style"),a.find(".ubtn-hover").removeClass("ubtn-hover-active"),a.css("background",a.data("bg"));var b=a.data("border-color"),c=a.attr("style");""!=a.data("shadow-hover")&&(c+="box-shadow:"+a.data("shadow")),a.attr("style",c),""!=a.data("border-hover")&&a.css("border-color",b),"none"!=a.data("shadow-click")&&(a.removeClass("no-ubtn-shadow"),""!=a.is(".shd-left")?a.css({right:"auto"}):""!=a.is(".shd-right")?a.css({left:"auto"}):""!=a.is(".shd-top")?a.css({bottom:"auto"}):""!=a.is(".shd-bottom")&&a.css({top:"auto"}))}),jQuery(".ubtn").on("focus blur mousedown mouseup",function(a){var b=jQuery(this);"none"!=b.data("shadow-click")&&setTimeout(function(){b.is(":focus")?(b.addClass("no-ubtn-shadow"),""!=b.is(".shd-left")?b.css({right:b.data("shd-shadow")+"px"}):""!=b.is(".shd-right")?b.css({left:b.data("shd-shadow")+"px"}):""!=b.is(".shd-top")?b.css({bottom:b.data("shd-shadow")+"px"}):""!=b.is(".shd-bottom")&&b.css({top:b.data("shd-shadow")+"px"})):(b.removeClass("no-ubtn-shadow"),""!=b.is(".shd-left")?b.css({right:"auto"}):""!=b.is(".shd-right")?b.css({left:"auto"}):""!=b.is(".shd-top")?b.css({bottom:"auto"}):""!=b.is(".shd-bottom")&&b.css({top:"auto"}))},0)}),jQuery(".ubtn").focusout(function(){var a=jQuery(this);a.removeClass("no-ubtn-shadow"),""!=a.is(".shd-left")?a.css({right:"auto"}):""!=a.is(".shd-right")?a.css({left:"auto"}):""!=a.is(".shd-top")?a.css({bottom:"auto"}):""!=a.is(".shd-bottom")&&a.css({top:"auto"})}),jQuery(".smile-icon-timeline-wrap.jstime").css("opacity","0"),jQuery(".jstime.timeline_preloader").css("opacity","1"),jQuery(".smile-icon-timeline-wrap.csstime .timeline-wrapper").each(function(){jQuery(".csstime .timeline-block:even").addClass("timeline-post-left"),jQuery(".csstime .timeline-block:odd").addClass("timeline-post-right")}),jQuery(".csstime .timeline-post-right").each(function(){jQuery(this).css("float","right"),jQuery("<div style='clear:both'></div>").insertAfter(jQuery(this))}),jQuery(".csstime.smile-icon-timeline-wrap").each(function(){var a=jQuery(this).data("time_block_bg_color");jQuery(this).find(".timeline-block").css("background-color",a),jQuery(this).find(".timeline-post-left.timeline-block l").css("border-left-color",a),jQuery(this).find(".timeline-post-right.timeline-block l").css("border-right-color",a),jQuery(this).find(".feat-item").css("background-color",a),jQuery(this).find(".feat-item").find(".feat-top").length>0?jQuery(this).find(".feat-item l").css("border-top-color",a):jQuery(this).find(".feat-item l").css("border-bottom-color",a),c(jQuery(this))}),jQuery(".aio-icon, .aio-icon-img, .flip-box, .ultb3-info, .icon_list_icon, .ult-banner-block, .uavc-list-icon, .ult_tabs, .icon_list_connector").each(function(){if(jQuery(this).attr("data-animation")){var b=jQuery(this).attr("data-animation"),c="delay-"+jQuery(this).attr("data-animation-delay");if(void 0===b||""===b)return!1;a(this).bsf_appear(function(){var a=jQuery(this);a.addClass("animated").addClass(b),a.addClass("animated").addClass(c)})}}),jQuery(".stats-block").each(function(){a(this).bsf_appear(function(){var a=parseFloat(jQuery(this).find(".stats-number").data("counter-value")),b=jQuery(this).find(".stats-number").data("counter-value")+" ",c=parseInt(jQuery(this).find(".stats-number").data("speed")),d=jQuery(this).find(".stats-number").data("id"),e=jQuery(this).find(".stats-number").data("separator"),f=jQuery(this).find(".stats-number").data("decimal"),g=b.split(".");g=g[1]?g[1].length-1:0;var h=!0;"none"==f&&(f=""),h="none"!=e;var i={useEasing:!0,useGrouping:h,separator:e,decimal:f},j=new countUp(d,0,a,g,c,i);setTimeout(function(){j.start()},500)})}),/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)?jQuery(".ifb-flip-box").on("click",function(a){var b=jQuery(this);b.hasClass("ifb-hover")?b.removeClass("ifb-hover"):b.addClass("ifb-hover")}):jQuery(document).on("mouseenter mouseleave hover",".ifb-flip-box",function(a){var b=jQuery(this);b.hasClass("ifb-hover")?b.removeClass("ifb-hover"):b.addClass("ifb-hover")}),jQuery(".ifb-flip-box").each(function(a,b){jQuery(this).parent().hasClass("style_9")&&(jQuery(this).hover(function(){jQuery(this).addClass("ifb-door-hover")},function(){jQuery(this).removeClass("ifb-door-hover")}),jQuery(this).on("click",function(){jQuery(this).toggleClass("ifb-door-right-open"),jQuery(this).removeClass("ifb-door-hover")}))}),jQuery(document).on("click",".ifb-flip-box",function(a){a.stopPropagation(),jQuery(document).trigger("ultFlipBoxClicked",jQuery(this))}),jQuery(".vertical_door_flip .ifb-front").each(function(){jQuery(this).wrap('<div class="v_door ifb-multiple-front ifb-front-1"></div>'),jQuery(this).parent().clone().removeClass("ifb-front-1").addClass("ifb-front-2").insertAfter(jQuery(this).parent())}),jQuery(".reverse_vertical_door_flip .ifb-back").each(function(){jQuery(this).wrap('<div class="rv_door ifb-multiple-back ifb-back-1"></div>'),jQuery(this).parent().clone().removeClass("ifb-back-1").addClass("ifb-back-2").insertAfter(jQuery(this).parent())}),jQuery(".horizontal_door_flip .ifb-front").each(function(){jQuery(this).wrap('<div class="h_door ifb-multiple-front ifb-front-1"></div>'),jQuery(this).parent().clone().removeClass("ifb-front-1").addClass("ifb-front-2").insertAfter(jQuery(this).parent())}),jQuery(".reverse_horizontal_door_flip .ifb-back").each(function(){jQuery(this).wrap('<div class="rh_door ifb-multiple-back ifb-back-1"></div>'),jQuery(this).parent().clone().removeClass("ifb-back-1").addClass("ifb-back-2").insertAfter(jQuery(this).parent())}),jQuery(".style_9 .ifb-front").each(function(){jQuery(this).wrap('<div class="new_style_9 ifb-multiple-front ifb-front-1"></div>'),jQuery(this).parent().clone().removeClass("ifb-front-1").addClass("ifb-front-2").insertAfter(jQuery(this).parent())}),jQuery(".style_9 .ifb-back").each(function(){jQuery(this).wrap('<div class="new_style_9 ifb-multiple-back ifb-back-1"></div>'),jQuery(this).parent().clone().removeClass("ifb-back-1").addClass("ifb-back-2").insertAfter(jQuery(this).parent())}),/^((?!chrome).)*safari/i.test(navigator.userAgent)&&(jQuery(".vertical_door_flip").each(function(a,b){var c=jQuery(this).find(".flip_link").outerHeight();jQuery(this).find(".flip_link").css("top",-c/2+"px"),jQuery(this).find(".ifb-multiple-front").css("width","50.2%")}),jQuery(".horizontal_door_flip").each(function(a,b){var c=jQuery(this).find(".flip_link").outerHeight();jQuery(this).find(".flip_link").css("top",-c/2+"px"),jQuery(this).find(".ifb-multiple-front").css("height","50.2%")}),jQuery(".reverse_vertical_door_flip").each(function(a,b){var c=jQuery(this).find(".flip_link").outerHeight();jQuery(this).find(".flip_link").css("top",-c/2+"px")}),jQuery(".reverse_horizontal_door_flip").each(function(a,b){var c=jQuery(this).find(".flip_link").outerHeight();jQuery(this).find(".flip_link").css("top",-c/2+"px"),jQuery(this).find(".ifb-back").css("position","inherit")})),jQuery(".square_box-icon").each(function(a,c){var d=jQuery(this);if(jQuery(this).find(".aio-icon-img").length>0){var e=jQuery(this).find(".aio-icon-img");b(d,e,"img"),e.find(".img-icon").load(function(){b(d,e,"icon")})}else{var e=jQuery(this).find(".aio-icon");b(d,e,"icon"),jQuery(window).load(function(){b(d,e,"icon")})}})})}(jQuery),jQuery(document).ready(function(){function a(){jQuery(".ult-new-ib").each(function(a,b){var c=jQuery(this).data("min-height")||"";jQuery(this).find(".ult-new-ib-img").data("min-height"),jQuery(this).find(".ult-new-ib-img").data("max-width");if(""!=c){jQuery(this).addClass("ult-ib2-min-height"),jQuery(this).css("height",c),jQuery(this).find(".ult-new-ib-img").removeClass("ult-ib2-toggle-size");var d=(jQuery(this).find(".ult-new-ib-img").width(),jQuery(this).find(".ult-new-ib-img").height());(jQuery(this).width()<=c||d<c)&&jQuery(this).find(".ult-new-ib-img").addClass("ult-ib2-toggle-size")}jQuery(this).hover(function(){jQuery(this).find(".ult-new-ib-img").css("opacity",jQuery(this).data("hover-opacity"))},function(){jQuery(this).find(".ult-new-ib-img").css("opacity",jQuery(this).data("opacity"))})})}a(),jQuery(window).load(function(){a()}),jQuery(window).resize(function(){a()})}),jQuery(document).ready(function(){function a(){jQuery(".ultimate-map-wrapper").each(function(a,b){var c=jQuery(b).attr("id");if(void 0===c||""===c)return!1;var d=jQuery(b).find(".ultimate_google_map").attr("id"),e=jQuery("#"+d).attr("data-map_override");jQuery("#"+d).css({"margin-left":0}),jQuery("#"+d).css({right:0});var f=jQuery("#"+c).parent();if("full"==e&&(f=jQuery("body"),"false"),"ex-full"==e&&(f=jQuery("html"),"false"),!isNaN(e))for(var a=0;a<e&&"HTML"!=f.prop("tagName");a++)f=f.parent();if(0==e||"0"==e)var g=f.width();else var g=f.outerWidth();var h=f.offset().left,i=jQuery("#"+d).offset().left,j=h-i;if(jQuery("#"+d).css({width:g}),0==e&&"0"==e||jQuery("#"+d).css({"margin-left":j}),"full"==e&&jQuery("body").hasClass("rtl")){var k=jQuery("#"+d),l=jQuery(window).width()-(k.offset().left+k.outerWidth());jQuery("#"+d).css({right:-l})}})}a(),jQuery(window).load(function(){a()}),jQuery(window).resize(function(){a()}),jQuery(".ui-tabs").bind("tabsactivate",function(b,c){jQuery(this).find(".ultimate-map-wrapper").length>0&&a()}),jQuery(".ui-accordion").bind("accordionactivate",function(b,c){jQuery(this).find(".ultimate-map-wrapper").length>0&&a()}),jQuery(document).on("onUVCModalPopupOpen",function(){a()}),jQuery(document).on("UVCMapResize",function(){a()})});
// source --> https://enpires.com/wp-content/plugins/Ultimate_VC_Addons/assets/min-js/headings.min.js?ver=3.17.1 
!function(a){function b(){var a=0;$jh(".uvc-heading").each(function(){var b,c,d,e=$jh(this).outerWidth(),f=$jh(this).attr("data-hline_width"),g=$jh(this).attr("data-hicon_type"),h=$jh(this).attr("data-halign"),i=$jh(this).attr("data-hspacer");if(left_rtl="left",right_rtl="right",jQuery("body").hasClass("rtl")&&(left_rtl="right",right_rtl="left"),"line_with_icon"==i){var j=$jh(this).attr("id");a=$jh(this).attr("data-hfixer"),a=void 0===a||""===a?0:parseInt(a);var k=e/2;$jh(this).find(".dynamic_ultimate_heading_css").remove(),d="auto"==f||f>e?e:f;var l=d/2;"selector"==g?(c=$jh(this).find(".aio-icon").outerWidth(),b=$jh(this).find(".aio-icon").outerHeight()):(c=$jh(this).find(".aio-icon-img").outerWidth(),b=$jh(this).find(".aio-icon-img").outerHeight());var m=c/2,n=k-m+c+a,o=l;if(b+=3,$jh(this).find(".uvc-heading-spacer").height(b),"center"==h){$jh(this).find(".aio-icon-img").css({margin:"0 auto"});var p="#"+j+" .uvc-heading-spacer.line_with_icon:before{"+right_rtl+":"+n+"px;}#"+j+" .uvc-heading-spacer.line_with_icon:after{"+left_rtl+":"+n+"px;}"}else if("left"==h){$jh(this).find(".aio-icon-img").css({float:h});var p="";p=""!=d?"#"+j+" .uvc-heading-spacer.line_with_icon:before{left:"+(c+a)+"px;right:auto;}#"+j+" .uvc-heading-spacer.line_with_icon:after{left:"+(o+c+a)+"px;right:auto;}":"#"+j+" .uvc-heading-spacer.line_with_icon:before{right:"+(n-c-2*a)+"px;}#"+j+" .uvc-heading-spacer.line_with_icon:after{left:"+(n-a)+"px;}"}else if("right"==h){$jh(this).find(".aio-icon-img").css({float:h});var p="";p=""!=d?"#"+j+" .uvc-heading-spacer.line_with_icon:before{right:"+(c+a)+"px;left:auto;}#"+j+" .uvc-heading-spacer.line_with_icon:after{right:"+(o+c+a)+"px;left:auto;}":"#"+j+" .uvc-heading-spacer.line_with_icon:before{right:"+(n-a)+"px;}#"+j+" .uvc-heading-spacer.line_with_icon:after{left:"+(n-c-2*a)+"px;}"}var q=$jh(this).attr("data-hborder_style"),r=$jh(this).attr("data-hborder_color"),s=$jh(this).attr("data-hborder_height");"auto"==f&&"center"==h&&(o=Math.floor(o-c+a));var t='<div class="dynamic_ultimate_heading_css"><style>#'+j+" .uvc-heading-spacer.line_with_icon:before, #"+j+" .uvc-heading-spacer.line_with_icon:after{width:"+o+"px;border-style:"+q+";border-color:"+r+";border-bottom-width:"+s+"px;}"+p+"</style></div>";$jh(this).prepend(t)}else"line_only"==i&&("right"==h||"left"==h?$jh(this).find(".uvc-heading-spacer").find(".uvc-headings-line").css({float:h}):$jh(this).find(".uvc-heading-spacer").find(".uvc-headings-line").css({margin:"0 auto"}))})}$jh=a.noConflict(),$jh(document).ready(function(a){b(),$jh(window).resize(function(a){b()})}),a(window).load(function(a){b(),jQuery(".ult_exp_section").select(function(){jQuery(this).parent().find(".uvc-heading").length>0&&b()})})}(jQuery);