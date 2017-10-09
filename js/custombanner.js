var countDownInterval;

onetwothree = {},
    onetwothree.adStatus = function () {
        return true;
    },
    onetwothree.adType = function () {
        return 1;
    },
    onetwothree.getRandom = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    onetwothree.addTag = function () {
        switch (onetwothree.adType()) {
            case 1:
                var banners = onetwothree.getDataBanners();
                var ad_html = '<div id="overlay-123plugin" style="position: absolute; bottom: 50%; left: 50%; margin-left: -150px; margin-bottom: -125px;"><a onclick="onetwothree.removeTag()" style="position: absolute; top: 10px; right: 10px; z-index: 997;"><img src="https://img.gocdn.online/2016/08/07/poster/close-ads.png" title="close ads" alt="close ads"></a><a href="' + banners.link + '" target="_blank" rel="nofollow" style="z-index: 996; position: relative; display: inline-block;"><div id="timer-close" style="position: absolute; top: 30px; right: 10px; z-index: 997;"><span id="timer-text" style="color: #fff; font-size: 13px; text-shadow: 0 0 4px #000;font-weight: bold;">This will be closed after 10 seconds</span></div><img src="' + banners.image + '" width="300" height="250"></a></div>';
                break;
            case 2:
                var frames = onetwothree.getDataIframe();
                var ad_html = '<div id="overlay-123plugin" style="position: absolute; bottom: 45px; left: 50%; margin-left: -364px; width:728px;height:90px; z-index: 996"><div id="remove-tag" style="position: absolute; top: 10px; right: 10px; z-index: 997; display: none;"><a onclick="onetwothree.removeTag()"><img src="https://img.gocdn.online/2016/08/07/poster/close-ads.png" title="close ads" alt="close ads"></a></div><div id="timer-close" style="position: absolute; top: 10px; right: 10px; z-index: 997;"><span id="timer-text" style="color: #fff; font-size: 13px; text-shadow: 0 0 4px #000;font-weight: bold;">This will be closed after 10 seconds</span></div><iframe src="' + frames + '" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" height="90" width="728" style="width: 100%; height: 100%; border: 0px; margin: 0px; padding: 0px;"></iframe></div>';
                break;
            default:
                break;
        }
        $("#overlay-goplugin-main").prepend(ad_html);
        clearInterval(countDownInterval);
        onetwothree.countDown(28, document.querySelector('#timer-text'));
    },
    onetwothree.getDataBanners = function () {

        var banners_1 = {
            images: ["https://cdn.movio.ga/images/ban/20170327145806-003319A_FGEX_18_ALL_EN_18762_L.gif"],
            links: ["https://goo.gl/CLwdG8"]
        };
        var random_1 = onetwothree.getRandom(0, 0);
        return {image: banners_1.images[random_1], link: banners_1.links[random_1]};

    },
    onetwothree.getDataIframe = function () {
        var frames = [
            // base_url + 'assets/invideo.html',
            'https://creative.wwwpromoter.com/19997?d=728x90'
        ];
        var random = onetwothree.getRandom(0, frames.length - 1);
        return frames[random];
    },
    onetwothree.removeTag = function () {
        $("#overlay-123plugin").remove();
    },
    onetwothree.adTime = function () {
        return {start: 5, end: 28};
    },
    onetwothree.mobileChecker = function () {
        if (!jQuery.browser.mobile) {
            // if ($.cookie("user_geo_2") == 1) {
                return false;
            // }
        }
        return true;
    },
    onetwothree.countDown = function (duration, display) {
        var timer = duration, minutes, seconds;
        countDownInterval = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = 'This will be closed after ' + seconds + ' seconds';

            if (--timer < 0) {
                onetwothree.btnCloseShow();
            }
        }, 1000);
    },
    onetwothree.btnCloseShow = function () {
        $("#remove-tag").show();
        $("#timer-close").hide();
    };
