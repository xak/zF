(function ($) {
    var scroller;
    var startOf960;

    function calculateStartOf960 () {
        startOf960 = (Math.max($('#scroll-container').width() - 960, 0) / 2);
        return startOf960;
    }

    function Scroller (opts) {
        var handle = opts.handle;
        var track = opts.track;
        var scroller = opts.scroller;
        var content = opts.content;
        var dragEndedCallback = opts.dragEndedCallback || function () {};
        var dragStartedCallback = opts.dragStartedCallback || function () {};

        var contentMaxScroll = (content.width() + startOf960*2) - scroller.width();
        var maxTravel = track.width() - handle.width();
        var window_mouseMove = null;
        var dragInProgress = false;

        handle.click(function (e) {e.preventDefault(); e.stopPropagation();});

        function mouseFollower (cb) {
            return function (e) {
                cb(e.clientX || e.originalEvent.targetTouches[0].clientX || 0,
                     e.clientY || e.originalEvent.targetTouches[0].clientY || 0);
            };
        }

        function scrollContentToRatio (ratio, animated, callback) {
            var newScroll = ratio * contentMaxScroll;
            if (!animated) {
                scroller.scrollLeft(newScroll);
                return;
            } else {
                scroller.animate({scrollLeft: newScroll}, 400, 'swing', callback);
            }
        }

        function moveHandleToRatio (ratio, animated, callback) {
            var props = {marginLeft: ratio * maxTravel};
            if (!animated) {
                handle.css(props);
                return;
            } else {
                handle.animate(props, 400, 'swing', callback);
            }
        }

        function scrollToRatio (ratio, opts) {
            opts = $.extend({
                animate: false,
                scrollbarCallback: function () {},
                contentCallback: function () {}
                }, opts);
            ratio = Math.max(Math.min(ratio, 1.0), 0.0);
            moveHandleToRatio(ratio, opts.animate, opts.scrollbarCallback);
            scrollContentToRatio(ratio, opts.animate, opts.contentCallback);
        }

        function scrollByDelta (delta, opts) {
            return scrollToRatio((scroller.scrollLeft() - delta) / contentMaxScroll, opts);
        }

        function getScrollbarRatio () {
            return handle.offset().left / maxTravel;
        }

        function getContentRatio () {
            return scroller.scrollLeft() / contentMaxScroll;
        }

        var endDrag;
        function beginDrag (e) {
            endDrag();
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            dragInProgress = true;

            var pageX = e.pageX || e.originalEvent.targetTouches[0].clientX;

            var xOnHandle = pageX - handle.offset().left + track.offset().left;
            function scrollHandleCallback (x, y) {
                var position = x - xOnHandle;

                if (position < 0) {
                    position = 0;
                } else if (position > maxTravel) {
                    position = maxTravel;
                }

                var scrollRatio = position / maxTravel;
                scrollToRatio(scrollRatio);
            }
            window_mouseMove = mouseFollower(scrollHandleCallback);
            $('body').bind('mousemove touchmove', window_mouseMove);
            dragStartedCallback();
            return false;
        }
        
        endDrag = function (e) {
            dragInProgress = false;
            $('body').unbind('mousemove touchmove', window_mouseMove);
            dragEndedCallback();
            return false;
        };

        handle.get(0).onselectstart = function () {return false;};
        // handle.mousedown(beginDrag);
        handle.bind('mousedown touchstart', beginDrag);
        $('html,body').bind('mouseup touchend', endDrag);
        
        //$(window).bind('mouseleave', endDrag);

        return {
            scrollToRatio: scrollToRatio,
            scrollByDelta: scrollByDelta,
            getContentRatio: getContentRatio,
            getScrollbarRatio: getScrollbarRatio,
            moveToSelector: function (selector, opts) {
                if (!selector) return false;
                var dest = $(selector, content);
                var destOffset = (dest.offset().left + scroller.scrollLeft()) - (startOf960 + 10);
                var destRatio =  destOffset / contentMaxScroll;
                scrollToRatio(destRatio, opts);
            },
            dragInProgress: function () {
                return dragInProgress;
            },
            destroy: function () {
                handle.unbind('mousedown touchstart', beginDrag);
                $(window).unbind('mouseup touchend', endDrag).unbind('mousemove touchmove', window_mouseMove);
            }
        };
    }

    function balanceNavArrows () {
        var navLinks = $('#primary-nav a');
        var seenCurrent = false;
        navLinks.each(function (idx, link) {
            var me = $(link);
            if (me.hasClass('current')) {
                seenCurrent = true;
                return;
            }
            if (seenCurrent) {
                me.removeClass('up');
                me.addClass('down');
            } else {
                me.removeClass('down');
                me.addClass('up');
            }
        });
    }

    var links = null;
    function updateProcessSubNav () {
        if (links == null) links = $('.subnav a');
        var seenCurrent = false;
        links.each(function (idx, elem) {
            var link = $(this);
            var target = $(link.attr('href'));
            if (!seenCurrent && target.offset().left > 0) {
                link.addClass('current');
                $('#position').text((idx + 1) + '/4');
                seenCurrent = true;
            } else {
                link.removeClass('current');
            }
        });
    }


    function lazyLoadImage (_idx, img) {
        img = $(img);
        img.wrap('<div style="position: relative"></div>');
        var placeholder = $('<div class="placeholder"></div>');
        placeholder.css({width: img.width() || "100%", left: img.css('margin-left') || 0});
        img.parent().append(placeholder);
        var url = img.attr('src');
        // img.attr('src', "/media/i/diagonal-line.png");
        var newImage = new Image();
        newImage.onload = function (e) {
            img.parent().find('div.placeholder').fadeOut();
        };
        newImage.src = url;
    }


    function perPageBindings () {
        
        $('#content img').each(lazyLoadImage);

        // "THE PROCESS" page bindings
        $('#the-process').each(function (idx, el) {
            calculateStartOf960();
            var leftPadding = (Math.max($(window).width() - 960, 0) / 2);
            $('#scroll-content').css({paddingLeft: leftPadding, paddingRight: leftPadding});
            scroller = Scroller({
                track: $('#track'),
                handle: $('#handle'),
                scroller: $('#scroll-container'),
                content: $('#scroll-content')
            });
            $('#handle').mouseover(function (e) {
                var me = $(this);
                me.animate({opacity: 0.6}).animate({opacity: 1.0});
            });
            $('#the-process a').click(function (e) {
                e.preventDefault();
                var link = $(this);
                var target = $(link.attr('href'));
                scroller.moveToSelector(target, {animate: true});
            });
            $('#scroll-container').bind('mousewheel', function (e, d, dX, dY) {
                scroller.scrollByDelta(-dX);
            }).bind('scroll', updateProcessSubNav);
            updateProcessSubNav();
        });

        // "CONTACT" page bindings
        $('#contact').each(function (_, el) {
            function initialize() {
                var map = new GMap2(document.getElementById("map-div"));
                map.addMapType(G_PHYSICAL_MAP);
                map.setCenter(new GLatLng(-33.896068, 151.179428), 16);
                map.addControl(new GMapTypeControl());
                map.addControl(new GLargeMapControl3D(), new GControlPosition(G_ANCHOR_TOP_RIGHT, new GSize(10, 50)));
                map.addOverlay(new GMarker(new GLatLng(-33.895468,151.182956)));
            }
            $('#show-map').click(function (e) {
                if (GBrowserIsCompatible()) {
                    e.preventDefault();
                    initialize();
                }
            });
            
        });
    }
/*
http://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=Studio+11,+12+Brown+Street,+Newtown+2042,+NSW,+Sydney,+Australia&sll=&sspn=0.011844,0.016243&g=Studio+11,+12+Brown+Street,+Newtown+2042,+Sydney,+Australia&ie=UTF8&hq=&hnear=11%2F12+Brown+St,+Newtown+New+South+Wales+2042,+Australia&ll=-33.895266,151.179428&spn=0.011684,0.020213&z=16


Address: -33.895468,151.182956
Map center: -33.895266,151.179428
*/

    IMAGES_TO_PRELOAD = [
        "/media/i/logo-85.gif",
        "/media/i/apps-schmapps.png",
        "/media/i/logo-home.png",
        "/media/i/diagonal-line.png",
        "/media/i/the-process.png",
        "/media/i/lets-break-it-down.png",
        "/media/i/our-story.png",
        "/media/i/say-hello.png",
        "/media/i/scroll-handle.png",
        "/media/i/map.jpg"
    ];
    IMAGES_DICT = {
        '': [
            "/media/i/apps-schmapps.png",
            "/media/i/logo-home.png",
            "/media/i/diagonal-line.png"
        ],
        '/pages/home': [
            "/media/i/apps-schmapps.png",
            "/media/i/logo-home.png",
            "/media/i/diagonal-line.png"
        ],
        '/pages/break-it-down': [
            "/media/i/lets-break-it-down.png"
        ],
        '/pages/the-process': [
            "/media/i/the-process.png",
            "/media/i/scroll-handle.png"
        ],
        '/pages/our-story': [
            "/media/i/our-story.png",
            "/media/i/logo-huge.png"
        ],
        '/pages/contact': [
            "/media/i/say-hello.png",
            "/media/i/map.jpg"
        ]
    };
    
    var key = window.location.hash.replace(/#!/, '');
    var PRELOAD_IMAGES = IMAGES_DICT[key].concat(IMAGES_TO_PRELOAD);
    
    var idx;
    var images = [];
    for (idx=0; idx < PRELOAD_IMAGES.length; idx++) {
        var img = new Image();
        img.src = PRELOAD_IMAGES[idx];
        images.push(img);
    }
    
    $(function () {

        // START PAGE TRANSITION CODE
        var PAGE_TRANSITION_SPEED = 600;
        var viewport = $('#viewport');

        $('nav a').click(function (e) {
            e.preventDefault();
            var me = $(this);

            if (me.hasClass('current')) return;
            $('nav a').removeClass('current');
            me.addClass('current');

            var animationTime = $('#content').hasClass('page-not-loaded')
                ? 0
                : PAGE_TRANSITION_SPEED;

            if ("home-link" == me.attr('id')) {
                $('nav').animate({top: 515}, animationTime);
                $('#home-link').css({opacity: 0}).slideUp(animationTime);
                $('#hello-link').animate({top: -495}, animationTime);
            } else {
                $('nav').animate({top: 0}, animationTime);
                $('#home-link').slideDown(animationTime).animate({opacity: 1.0}, animationTime / 2);
                $('#hello-link').animate({top: 0}, animationTime);
            }

            var direction = me.hasClass('up') ? 'up' : 'down';
            var content = $('#content');

            // START LOADING THE NEW PAGE
            var exitFinished = false;
            var url = me.attr('href').replace(/#!/, '');
            $.ajax({
                url: url + '?v3',
                // cache: false,
                dataType: 'html',
                success: function (text, status, request) {

                    function insertNewPage () {
                        // DON'T SLIDE IN THE NEW PAGE UNTIL THE OLD PAGE HAS GONE
                        if (!exitFinished) {
                            return window.setTimeout(insertNewPage, 10);
                        }
                        viewport.html('');

                        // SLIDE IN THE NEW PAGE
                        var newHTML = $(text);
                        var newContent = newHTML.find('#content').hide().css({position: 'relative', visibility: 'hidden'}).show();
                        var newHeight = newContent.height() || new Number(newContent.attr('data-fallback-height') || 0);
                        viewport.append(newContent);
                        if ('down' == direction) {
                            newContent.css({top: viewport.height()});
                        } else {
                            newContent.css({top: - newHeight});
                        }
                        newContent.css({visibility: 'visible'}).animate({top: 0}, animationTime, function () {
                            // $('body,html').animate({scrollTop: 0}, animationTime);
                        });
                        // alert(newHeight());
                        viewport.animate({height: newHeight});
                        if (typeof(setupDjangocms2000) != "undefined") {
                            tinyMCE.execCommand('mceRemoveControl', false, 'id_html-raw_content');
                            setupDjangocms2000();
                        }

                        // set up title and meta description (meta is probably useless here)
                        var newTitle = newHTML.find('#title').text();
                        var newDescription = newHTML.find('#meta-description').attr('content');
                        $('head meta[name=description]').attr('content', newDescription);
                        $('head title').text(newTitle);

                        perPageBindings();
                    }
                    insertNewPage();
                }
            });

            // SLIDE OUT THE OLD PAGE
            var contentHeight = Math.max(content.height(), new Number(content.attr('data-fallback-height') || 0));
            var targetHeight = Math.max(contentHeight, $(window).height());
            viewport.height(targetHeight);
            content.css({position: 'relative', height: contentHeight});
            var targetTop;
            if ('down' == direction) {
                targetTop = 0 - contentHeight;
            } else {
                targetTop = targetHeight;
            }
            content.animate({top: targetTop}, PAGE_TRANSITION_SPEED, function () {
                $(this).hide().remove();
                exitFinished = true;
            });

            balanceNavArrows();
            // if ("home-link" != me.attr('id')) {
                window.location.hash = '!' + url;
            // } else {
            //  window.location.hash = '!';
            // }
        });

        viewport.height($(window).height());

        if (window.location.hash && window.location.hash != '#') {
            var url = window.location.hash.match(/#!?(.*)/)[1];
            $('nav a[href=#!'+url+']').click();
        } else {
            $('#home-link').click();
        }
        // END PAGE TRANSITION CODE
    });

    })(jQuery);