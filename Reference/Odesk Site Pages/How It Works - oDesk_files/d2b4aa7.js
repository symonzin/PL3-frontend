(function ($) {
    var $w = $(window);
    $.fn.visible = function (partial, hidden, direction) {
        if (this.length < 1) return;
        var $t = this.length > 1 ? this.eq(0) : this,
            t = $t.get(0),
            vpWidth = $w.width(),
            vpHeight = $w.height(),
            direction = direction ? direction : "both",
            clientSize = hidden === true ? t.offsetWidth * t.offsetHeight : true;
        if (typeof t.getBoundingClientRect === "function") {
            var rec = t.getBoundingClientRect(),
                tViz = rec.top >= 0 && rec.top < vpHeight,
                bViz = rec.bottom > 0 && rec.bottom <= vpHeight,
                lViz = rec.left >= 0 && rec.left < vpWidth,
                rViz = rec.right > 0 && rec.right <= vpWidth,
                vVisible = partial ? tViz || bViz : tViz && bViz,
                hVisible = partial ? lViz || lViz : lViz && rViz;
            if (direction === "both") return clientSize && vVisible && hVisible;
            else if (direction === "vertical") return clientSize && vVisible;
            else if (direction === "horizontal") return clientSize && hVisible
        } else {
            var viewTop = $w.scrollTop(),
                viewBottom = viewTop + vpHeight,
                viewLeft = $w.scrollLeft(),
                viewRight = viewLeft + vpWidth,
                offset = $t.offset(),
                _top = offset.top,
                _bottom = _top + $t.height(),
                _left = offset.left,
                _right = _left + $t.width(),
                compareTop = partial === true ? _bottom : _top,
                compareBottom = partial === true ? _top : _bottom,
                compareLeft = partial === true ? _right : _left,
                compareRight = partial === true ? _left : _right;
            if (direction === "both") return !!clientSize && (compareBottom <= viewBottom && compareTop >= viewTop) && (compareRight <= viewRight && compareLeft >= viewLeft);
            else if (direction === "vertical") return !!clientSize && (compareBottom <= viewBottom && compareTop >= viewTop);
            else if (direction === "horizontal") return !!clientSize && (compareRight <= viewRight && compareLeft >= viewLeft)
        }
    }
})(jQuery);
(function ($) {
    $.fn.SwipeToSlide = function (options) {
        this.isScrolling = function (y1, y2) {
            var vertDiff = y1 - y2;
            if (vertDiff > 5) {
                return true
            } else if (vertDiff < -5) {
                return true
            }
            return false
        };
        this.getDelta = function (v1, v2) {
            var d = v1 - v2;
            if (d < 0) {
                d *= -1
            }
            return d
        };
        this.touchStart = function (elem, e) {
            var lastTouch = $(this).data("last-touch");
            var newTouch = {
                x: e.originalEvent.targetTouches[0].clientX,
                y: e.originalEvent.targetTouches[0].clientY,
                time: (new Date).getTime()
            };
            if (lastTouch) {
                var currentTime = (new Date).getTime();
                var diff = currentTime - lastTouch.time;
                if (diff <= 500) {
                    return this.findClickedItem(e.originalEvent.targetTouches[0].clientX)
                }
            }
            $(this).data("last-touch", newTouch)
        };
        this.touchMove = function (elem, e) {
            var lastTouch = $(this).data("last-touch");
            if (!lastTouch) {
                return false
            }
            var newTouch = {
                x: e.originalEvent.targetTouches[0].clientX,
                y: e.originalEvent.targetTouches[0].clientY,
                time: (new Date).getTime()
            };
            if (lastTouch.x > newTouch.x) {
                lastTouch.slidingDirection = "left";
                this.sliding = true
            } else if (lastTouch.x < newTouch.x) {
                lastTouch.slidingDirection = "right";
                this.sliding = true
            } else {
                lastTouch.slidingDirection = null;
                this.sliding = false
            } if (lastTouch.y > newTouch.y && this.isScrolling(lastTouch.y, newTouch.y)) {
                lastTouch.scrollingDirection = "down";
                this.scrolling = true
            } else if (lastTouch.y < newTouch.y && this.isScrolling(lastTouch.y, newTouch.y)) {
                lastTouch.scrollingDirection = "up";
                this.scrolling = true
            } else {
                lastTouch.scrollingDirection = null;
                this.scrolling = false
            }
            $(this).data("last-touch", lastTouch);
            if (this.scrolling && this.sliding) {
                var xDiff = this.getDelta(lastTouch.x, newTouch.x);
                var yDiff = this.getDelta(lastTouch.y, newTouch.y);
                if (xDiff < yDiff) {
                    this.sliding = false;
                    $(this).removeData("last-touch")
                } else {
                    this.scrolling = false
                }
            }
            if (!this.scrolling && !this.sliding) {
                this.scrolling == true;
                $(this).removeData("last-touch")
            }
            return this.scrolling
        };
        this.touchEnd = function (elem, e) {
            if (!this.sliding) {
                return
            }
            var lastTouch = $(this).data("last-touch");
            if (lastTouch && lastTouch.slidingDirection) {
                if (lastTouch.slidingDirection == "left") {
                    $(document).trigger("swipe-left")
                } else {
                    $(document).trigger("swipe-right")
                }
            }
        };
        this.makeTouchable = function (elem) {
            var that = this;
            elem.on("touchstart", function (e) {
                that.touchStart($(this), e);
                return true
            });
            elem.on("touchmove", function (e) {
                var isScrolling = that.touchMove($(this), e);
                if (!isScrolling) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false
                }
                return true
            });
            elem.on("touchend", function (e) {
                if (that.sliding) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.touchEnd($(this), e)
                }
                return true
            })
        };
        this.makeTouchable($(this))
    }
})(jQuery);
(function ($) {
    "use strict";
    var hiwClient = window.oDesk.HIWClient || {};
    hiwClient.HIWHeroSection = function () {
        var that = this;
        this.isBusy = false;
        this.FIRST_SECTION_BREAK_POINT = 1050;
        var init = function () {
            that.adjustHeights();
            initNavIconsDisplay();
            setupSlider()
        };
        this.removeAddeddCssClass = function (cssClass) {
            if (that[cssClass]) {
                $("head").find(that[cssClass]).remove();
                that[cssClass] = null
            }
        };
        this.adjustHeights = function () {
            if ($(window).width() >= that.FIRST_SECTION_BREAK_POINT) {
                var headerHeight = $("header").outerHeight();
                var viewPortHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                var viewPortWithoutHeader = viewPortHeight;
                var heroFooterHeight = 170;
                var requiredHeight = viewPortWithoutHeader - heroFooterHeight - 40;
                that.removeAddeddCssClass("heroHeightClass");
                that.heroHeightClass = $("<style type='text/css'> .oHowItWorksHeroHeight{height:" + (viewPortWithoutHeader - 82) + "px !important;} </style>");
                that.heroHeightClass.appendTo("head");
                $(".oHowItWorksHero").addClass("oHowItWorksHeroHeight");
                that.removeAddeddCssClass("slideHeightClass");
                that.slideHeightClass = $("<style type='text/css'> .oSlideHeight{height:" + requiredHeight + "px !important;} </style>");
                that.slideHeightClass.appendTo("head");
                $(".oSlide, .oSliderContainer, .oSliderControl, .oSlideLeft, .oSlideRight").addClass("oSlideHeight");
                that.removeAddeddCssClass("navTopClass");
                that.navTopClass = $("<style type='text/css'> .oHowItWorksHeroNavULTop{top:" + Math.ceil(viewPortWithoutHeader / 4.5) + "px !important;} </style>");
                that.navTopClass.appendTo("head");
                $(".oHowItWorksHeroNav ul").addClass("oHowItWorksHeroNavULTop");
                that.removeAddeddCssClass("navBorderClass");
                that.navBorderClass = $("<style type='text/css'> .oHowItWorksHeroNavBorderTop{top:" + (Math.ceil(viewPortWithoutHeader / 4.5) + 121) + "px !important;} </style>");
                that.navBorderClass.appendTo("head");
                $(".oHowItWorksHeroNav .oNavBorder").addClass("oHowItWorksHeroNavBorderTop");
                that.removeAddeddCssClass("ctaPositionClass");
                that.ctaPositionClass = $("<style type='text/css'> .oHeroCTATop{top:" + (Math.ceil(viewPortWithoutHeader / 4.5) + 220) + "px !important;} </style>");
                that.ctaPositionClass.appendTo("head");
                $(".oHeroCTA").addClass("oHeroCTATop");
                that.removeAddeddCssClass("slideContainerClass");
                that.slideContainerClass = $("<style type='text/css'> .oSlideContainerHeight{height:" + Math.ceil(requiredHeight / 1.8) + "px !important;} </style>");
                that.slideContainerClass.appendTo("head");
                $(".oSlideContainer").addClass("oSlideContainerHeight")
            } else {
                $(".oHowItWorksHero").removeClass("oHowItWorksHeroHeight");
                that.removeAddeddCssClass("heroHeightClass");
                $(".oSlide, .oSliderContainer, .oSliderControl, .oSlideLeft, .oSlideRight").removeClass("oSlideHeight");
                that.removeAddeddCssClass("slideHeightClass");
                $(".oHowItWorksHeroNav ul").removeClass("oHowItWorksHeroNavULTop");
                that.removeAddeddCssClass("navTopClass");
                $(".oHowItWorksHeroNav .oNavBorder").removeClass("oHowItWorksHeroNavBorderTop");
                that.removeAddeddCssClass("navBorderClass");
                $(".oHeroCTA").removeClass("oHeroCTATop");
                that.removeAddeddCssClass("ctaPositionClass");
                $(".oSlideContainer").removeClass("oSlideContainerHeight");
                that.removeAddeddCssClass("slideContainerClass")
            }
            $(".oHowItWorks").show()
        };
        this.goAnim = function (box) {
            var animClass = "oPopupable";
            box.addClass(animClass);
            box.prev(".oNavText").addClass(animClass)
        };
        var initNavIconsDisplay = function () {
            window.setTimeout(function () {
                $(".popitup").each(function (i) {
                    var box = $(this);
                    var delay = i * 400;
                    window.setTimeout(function () {
                        that.goAnim(box)
                    }, delay)
                })
            }, 1200)
        };
        var setupSlider = function () {
            $(".oHowItWorksHeroNav ul li").click(function (e) {
                if (that.isBusy) {
                    return
                }
                var target = $(e.target);
                if (target.prop("tagName") != "LI") {
                    target = target.parent()
                }
                that.showHeroSlide(target.data("slide"))
            });
            $(".oSliderControl").click(function (e) {
                var target = $(e.target);
                var direction = target.data("direction");
                var add = 0;
                if (direction == "forward") {
                    add = 1
                } else {
                    add = -1
                }
                that.triggerHeroSlide(add)
            });
            window.setTimeout(function () {
                $(".oSlide0 .oSlideContent *").addClass("oSliding oSliddedFromRight")
            }, 400);
            $(".oSliderContainer").SwipeToSlide();
            $(document).on("swipe-right", function () {
                that.triggerHeroSlide(-1)
            });
            $(document).on("swipe-left", function () {
                that.triggerHeroSlide(1)
            })
        };
        this.triggerHeroSlide = function (add) {
            var current = parseInt($(".oHowItWorksSlider").data("current"));
            var target = current + add;
            if (target < 0) {
                target = $(".oSlide:not(.static)").length - 1
            }
            if (target >= $(".oSlide:not(.static)").length) {
                target = 0
            }
            that.showHeroSlide(target)
        };
        this.setActiveHeroNavIcon = function (slideIndex) {
            $(".oHowItWorksHeroNav ul li .oNavIcon").removeClass("active");
            $(".oHowItWorksHeroNav ul li[data-slide='" + slideIndex + "'] .oNavIcon").addClass("active")
        };
        this.markActiveHeroItem = function (slideIndex, currentIndex) {
            var newLeft = 0;
            var resetLeft = false;
            if (slideIndex == 0) {
                if (currentIndex == 1) {
                    newLeft = 20 * -1
                } else {
                    newLeft = 100;
                    resetLeft = true
                }
            } else {
                newLeft = slideIndex + (slideIndex - 1);
                newLeft = newLeft * 10
            }
            $(".oHowItWorksHeroNav ul li.oActiveNavItem").animate({
                left: newLeft + "%"
            }, {
                duration: 300,
                complete: function () {
                    that.setActiveHeroNavIcon(slideIndex);
                    if (resetLeft) {
                        $(".oHowItWorksHeroNav ul li.oActiveNavItem").css({
                            left: "-20%"
                        });
                        resetLeft = false
                    }
                }
            })
        };
        this.showHeroSlide = function (slideIndex) {
            if (that.isBusy) {
                return false
            }
            var current = parseInt($(".oHowItWorksSlider").data("current"));
            if (current == slideIndex) {
                return false
            }
            that.isBusy = true;
            that.markActiveHeroItem(slideIndex, current);
            var currentSlide = $(".oSlide:not(.static)[data-index='" + current + "']");
            var targetSlide = $(".oSlide:not(.static)[data-index='" + slideIndex + "']");
            $(".oHowItWorksSlider").data("current", slideIndex);
            var targetTriggered = false,
                currentTriggered = false;
            targetSlide.find(".oSlideContent").on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function (e) {
                if (targetTriggered) {
                    return
                }
                targetTriggered = true;
                targetSlide.find(".oSlideContent *").removeClass("oSliding oHiding")
            });
            currentSlide.find(".oSlideContent").on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function (e) {
                if (currentTriggered) {
                    return
                }
                currentTriggered = true;
                targetSlide.animate({
                    opacity: 1
                }, {
                    duration: 300,
                    complete: function () {
                        currentSlide.animate({
                            opacity: 0
                        }, {
                            duration: 200,
                            complete: function () {
                                currentSlide.find(".oSlideContent *").removeClass("oSliding oHiding oSliddedToLeft oSliddedFromRight");
                                that.isBusy = false
                            }
                        })
                    }
                });
                targetSlide.find(".oSlideContent *").addClass("oSliding oSliddedFromRight")
            });
            currentSlide.find(".oSlideContent *").removeClass("oSliding").addClass("oHiding oSliddedToLeft")
        };
        init();
        return this
    };
    hiwClient.HIWStickyNav = function () {
        this.lastScrollTop = null;
        this.lastActiveItem = 0;
        this.navCreated = false;
        this.isBusy = false;
        this.eventsBound = false;
        var that = this;
        var init = function () {
            if ($(window).width() < 1055) {
                return
            } else if (!that.navCreated) {
                that.navCreated = true;
                that.bindEvents()
            }
        };
        var scrollEventHandler = function (e) {
            if ($(window).scrollTop() < 500) {
                $(window).trigger("sections-slide-button:hide")
            }
            if (window.IgnoreBrowserScrolls) {
                return false
            }
            if ($(window).scrollTop() == 0) {
                $(window).trigger("sections:current", {
                    index: 0
                });
                return
            }
            var sections = $(".oHIWSection:not(.show-for-small-only)");
            var visibleSections = [];
            for (var i = 0, j = sections.length; i < j; i++) {
                var section = $(sections[i]);
                var sectionOffset = section.offset().top - $(".oHowItWorksNav").height();
                if (section.visible(true)) {
                    visibleSections.push({
                        index: parseInt(section.data("index")),
                        top: sectionOffset
                    })
                }
            }
            if (visibleSections.length < 0) {
                $(window).trigger("sections:current", {
                    index: 0
                });
                $(window).trigger("sections-slide-button:hide");
                return
            }
            visibleSections.sort(function (a, b) {
                return a.top - b.top
            });
            var itemIndex = visibleSections.length - 1;
            var item = visibleSections[itemIndex];
            if (!item) {
                return
            }
            var itemToActivate = item.index;
            if (itemToActivate == $(".oHIWSection:not(.show-for-small-only)").length) {
                $(window).trigger("sections-slide-button:hide")
            }
            if (!that.lastActiveItem || that.lastActiveItem != itemToActivate) {
                that.lastActiveItem = itemToActivate;
                that.setActiveItem(itemToActivate)
            }
        };
        this.setActiveItem = function (targetIndex, showSlideDownBtn) {
            if (that.isBusy) {
                return false
            }
            var currentActive = $(".oHowItWorksNav ul li.active");
            var currentActiveIndex = currentActive.data("index");
            if (!targetIndex || targetIndex < 0 || targetIndex === parseInt(currentActiveIndex)) {
                return false
            }
            var item = $(".oHowItWorksNav ul li:not(.static)[data-index='" + targetIndex + "']");
            currentActive.removeClass("active");
            item.addClass("active");
            var width = $(".oHowItWorksNav .oActiveNavItem").outerWidth();
            var newLeft = (targetIndex - 1) * width;
            that.isBusy = true;
            if (targetIndex === $(".oHIWSection:not(.show-for-small-only)").length) {
                $(window).trigger("sections-slide-button:hide")
            } else {
                $(window).trigger("sections-slide-button:show")
            }
            $(".oHowItWorksNav .oActiveNavItem").animate({
                left: newLeft + "px"
            }, {
                duration: 250
            }).promise().done(function () {
                that.isBusy = false
            })
        };
        this.bindEvents = function () {
            if (that.eventsBound) {
                return
            }
            that.eventsBound = true;
            $(".oHowItWorksNav ul li").unbind("click").bind("click", function (e) {
                var target = $(e.target);
                var targetSection = target.data("target");
                var targetIndex = target.data("index");
                if (!targetSection) {
                    return true
                }
                $(window).trigger("sticky-header:select", {
                    index: targetIndex,
                    callback: function () {
                        that.setActiveItem(targetIndex)
                    }
                });
                return false
            });
            $(window).unbind("sections:move-next").bind("sections:move-next", function (e, data) {
                that.setActiveItem(data)
            });
            $(window).bind("scroll", function (e) {
                scrollEventHandler(e)
            })
        };
        this.unbindEvents = function () {
            if (!that.eventsBound) {
                return
            }
            that.eventsBound = false;
            $(window).unbind("scroll");
            $(window).unbind("sections:move-next");
            $(".oHowItWorksNav ul li").unbind("click")
        };
        this.setActiveItemMarker = function () {
            var item = $(".oHowItWorksNav ul li.active");
            var targetIndex = item.data("index");
            var width = $(".oHowItWorksNav .oActiveNavItem").width();
            var newLeft = (targetIndex - 1) * width;
            $(".oHowItWorksNav .oActiveNavItem").css({
                left: newLeft + "px"
            })
        };
        init();
        return this
    };
    hiwClient.HIWSections = function () {
        this.currentSection = {
            index: 0
        };
        this.support = "onwheel" in document.createElement("div") ? "wheel" : document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";
        this.isBusy = false;
        this.eventsBound = false;
        var that = this;
        var init = function () {
            that.setupScenes();
            $(window).unbind("sticky-header:select").bind("sticky-header:select", function (e, data) {
                that.currentSection.index = data.index;
                that.moveToSection(data.index, data.callback)
            });
            $(window).unbind("sections:current").bind("sections:current", function (e, data) {
                that.currentSection.index = data.index
            })
        };
        this.moveToSection = function (sectionIndex, cb) {
            var section = $(".oHIWSection[data-index='" + sectionIndex + "']");
            var length = section.offset().top - $(".oHowItWorksNav").height();
            that.currentSection.index = sectionIndex;
            window.IgnoreBrowserScrolls = true;
            that.isBusy = true;
            $(window).trigger("sections-slide-button:hide");
            $("html, body").animate({
                scrollTop: length
            }, 1e3, "easeInOutExpo").promise().done(function () {
                window.IgnoreBrowserScrolls = false;
                that.isBusy = false;
                if (cb) {
                    cb()
                }
            })
        };
        this.setupScenes = function () {
            that.scenes = $(".oHIWSection:not(.show-for-small-only)");
            if ($(window).width() <= 1055) {
                that.scenes.removeClass("oHIWSectionHeight");
                if (that.sectionHeightClass) {
                    $("head").find(that.sectionHeightClass).remove()
                }
                that.ubindEvents()
            } else {
                that.sectionHeightClass = $("<style type='text/css'> .oHIWSectionHeight{height:" + $(window).height() + "px !important;} </style>");
                that.sectionHeightClass.appendTo("head");
                that.scenes.addClass("oHIWSectionHeight");
                that.bindEvents()
            }
        };
        var mouseWheelHandler = function (e) {
            if (!that.currentSection || that.isBusy) {
                return
            }
            var deltaY = null;
            if (that.support == "mousewheel") {
                deltaY = e.originalEvent.wheelDelta
            } else {
                deltaY = -40 * e.originalEvent.deltaY
            }
            var nextIndex = null;
            if (deltaY > 0) {
                if (that.currentSection.index <= 1) {
                    that.currentSection.index = 0;
                    $(window).trigger("sections-slide-button:hide");
                    return true
                } else {
                    e.preventDefault();
                    nextIndex = that.currentSection.index - 1
                }
            } else {
                if (that.currentSection.index >= $(".oHIWSection:not(.show-for-small-only)").length) {
                    that.currentSection.index = $(".oHIWSection:not(.show-for-small-only)").length;
                    return true
                } else {
                    e.preventDefault();
                    nextIndex = that.currentSection.index + 1
                }
            }
            that.moveToSection(nextIndex, function () {
                if (nextIndex == 1) {
                    $(window).trigger("sections-slide-button:show");
                    $(window).trigger("sections:move-next", nextIndex)
                } else {
                    $(window).trigger("sections:move-next", nextIndex)
                }
            })
        };
        this.bindEvents = function () {
            if (that.eventsBound) {
                return
            }
            that.eventsBound = true;
            $(".oHIWSectionsBottomNav .oSlideDownButton").unbind("click").bind("click", function (e) {
                var currentActive = $(".oHowItWorksNav ul li.active");
                var currentActiveIndex = parseInt(currentActive.data("index"));
                var targetSectionIndex = currentActiveIndex + 1;
                if (!$(".oHowItWorksNav").is(":visible")) {
                    targetSectionIndex = 1
                }
                that.moveToSection(targetSectionIndex, function () {
                    if (targetSectionIndex == 1) {
                        $(window).trigger("sections-slide-button:show")
                    }
                    $(window).trigger("sections:move-next", targetSectionIndex)
                })
            });
            $(window).unbind(that.support).bind(that.support, function (e) {
                mouseWheelHandler(e)
            })
        };
        this.ubindEvents = function () {
            if (!that.eventsBound) {
                return
            }
            that.eventsBound = false;
            $(window).unbind(that.support)
        };
        init();
        return this
    };
    hiwClient.HIWFaqSection = function () {
        var that = this;
        var init = function () {
            $(".question").click(function (e) {
                var target = $(e.target);
                var currentOpened = $(".question.opened");
                if (currentOpened.length > 0) {
                    if (target.is($(currentOpened[0]))) {
                        currentOpened.next(".answer").slideToggle(400, function () {
                            target.removeClass("opened")
                        })
                    } else {
                        currentOpened.next(".answer").slideToggle(400, function () {
                            $(".question").removeClass("opened");
                            target.addClass("opened");
                            target.next(".answer").slideToggle(400)
                        })
                    }
                    return
                }
                $(".question").removeClass("opened");
                target.addClass("opened");
                target.next(".answer").slideToggle(400)
            })
        };
        init();
        return this
    };
    hiwClient.HIWSectionsSlideButton = function () {
        this.selector = $(".oHIWSectionsBottomNav");
        var that = this;
        var init = function () {
            that.handleEvents();
            that.adjustPosition()
        };
        this.handleEvents = function () {
            $(window).bind("sections-slide-button:show", function () {
                that.selector.addClass("visible")
            });
            $(window).bind("sections-slide-button:toggle", function () {
                that.selector.toggleClass("visible")
            });
            $(window).bind("sections-slide-button:hide", function () {
                that.selector.removeClass("visible")
            })
        };
        this.adjustPosition = function () {
            var viewPortHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            that.selector.css({
                top: viewPortHeight - 40 + "px"
            })
        };
        init();
        return this
    };
    $(document).ready(function () {
        var STICKY_NAV_BREAK_POINT = 1055;
        var hero = new hiwClient.HIWHeroSection;
        var pageSections = new hiwClient.HIWSections;
        var slidingArrow = new hiwClient.HIWSectionsSlideButton;
        var nav = new hiwClient.HIWStickyNav;
        var faqSection = new hiwClient.HIWFaqSection;
        $(window).resize(function () {
            hero.adjustHeights();
            pageSections.setupScenes();
            slidingArrow.adjustPosition();
            if ($(window).width() <= STICKY_NAV_BREAK_POINT) {
                $(window).trigger("stick-header:stop");
                nav.unbindEvents()
            } else {
                $(window).trigger("stick-header:start");
                nav.bindEvents();
                nav.setActiveItemMarker()
            } if (!nav.navCreated) {
                nav = new hiwClient.HIWStickyNav
            }
        })
    })
})(jQuery);