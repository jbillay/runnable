'use strict';

$(document).ready(function(){/* activate scrollspy menu */
	$('body').scrollspy({
        target: '#navbar-collapsible',
        offset: 50
    });

    $('.nav a').click(function () {
        $('.navbar-collapse.in').collapse('hide');
    });

	/* smooth scrolling sections */
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                // div has been remove from the list
                $('html,body').animate({
                    scrollTop: target.offset().top - 49
                }, 1000);
                return false;
            }
        }
    });

    $('.navbar .active').removeClass('active');
});