jwplayer.key = "HOv9YK6egpZgk5ccBiZpYfIAQx3Q5boGV7tiGw==";
var loc = window.location;
var temp = loc.pathname.split('/');
temp = temp[2].split('-');
var mid = temp[temp.length - 1];
mid = mid.split('.')[0];
var sv;
var player = jwplayer("media-player");
var playlist;
var eid;
var sv_error = [];
var sv_default = 7;
var eb_default = 14;
var first_load = true, player_ready = false, load_backup = false, setup_error = false, auto_next = true,
    ad_is_shown = false;
function get_episodes() {
    $.ajax({
        url: '/ajax/movie_episodes/' + mid,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (res) {
            $('#list-eps').html(res.html);
        }
    })
}
function load_server() {
    if ($('#sv-' + sv_default).length > 0) {
        sv = sv_default;
    } else {
        $('.server-item').each(function (index) {
            if (index === 0) {
                sv = $(this).attr('data-id');
                return false;
            }
        })
    }
    $('#sv-' + sv + ' .les-content a').first().click();
}

function player_error() {
    if (sv_error.indexOf(sv) < 0) {
        sv_error.push(sv);
    }
    var ok = false;
    // console.log(sv_error);
    $('.server-item.vip').each(function (index) {
        if (sv_error.indexOf($(this).attr('data-id')) < 0) {
            sv = $(this).attr('data-id');
            ok = true;
            $('#sv-' + sv + ' .ep-item[data-index=' + get_ep_index() + ']').click();
            return false;
        }
    });

    if (!ok && !load_backup) {
        // // console.log('load backup');
        if ($('.server-item.backup').length > 0) {
            // console.log("backup ok");
            ok = true;
            load_backup = true;

            eid = $('#sv-69 .ep-item[data-index=' + get_ep_index() + ']').attr('data-id');
            get_sources();
        }
    }

    if (!ok) {
        load_embed();
    }
}

function load_embed() {
    // console.log('load embed');
    if ($('#sv-' + eb_default).length > 0) {
        sv = eb_default;
    } else {
        $('.server-item.embed').each(function (index) {
            if (index == 0) {
                sv = $(this).attr('data-id');
                return false;
            }
        });
    }
    $('#sv-' + sv + ' .ep-item[data-index=' + get_ep_index() + ']').click();
}

function change_url() {
    var url = loc.protocol + '//' + loc.hostname + loc.pathname + '?ep=' + eid;
    history.pushState({}, '', url);
}

function get_sources() {
    if (player_ready) {
        player.stop();
    }
    first_load = true;
    $.getScript("/ajax/movie_token?eid=" + eid + "&mid=" + mid, function () {
        $.ajax({
            url: '/ajax/movie_sources/' + eid + '?x=' + _x + '&y=' + _y,
            method: 'GET',
            dataType: 'json',
            success: function (res) {
                playlist = res.playlist;
                if (player_ready && !setup_error) {
                    player.load(playlist);
                } else {
                    setup_player();
                }
            }, error: function () {
                $('#pop-error').modal('show');
            }
        });
    });
}

function get_embed() {
    $.ajax({
        url: '/ajax/movie_embed/' + eid,
        method: 'GET',
        dataType: 'json',
        success: function (res) {
            $('#iframe-embed').attr('src', res.src);
        }
    });
}

function get_ep_index() {
    return parseInt($('#ep-' + eid).attr('data-index'));
}

function setup_player() {
    player_ready = true;
    var config = {
        playlist: playlist,
        allowfullscreen: true,
        width: "100%",
        aspectratio: '16:9',
        autostart: true,
        cast: {},
        captions: {
            color: '#f3f378',
            fontSize: 16,
            backgroundOpacity: 0,
            fontfamily: "Helvetica",
            edgeStyle: "raised"
        },
        skin: {
            name: "five",
            active: "#50afcb",
            inactive: "#ccc",
            background: "#141414"
        }
    };
    player.setup(config);
    player.on('setupError', function (e) {
        // console.log('player setup error');
        player_error();
        setup_error = true;
    });
    player.on('ready', function () {
        // console.log('player ready');
        setup_error = false;
        var isMobile = onetwothree.mobileChecker();
        if (!isMobile) {
            $("#media-player").prepend('<div id="overlay-goplugin-main" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"></div>');
        }
    });
    player.on('complete', function () {
        if ($('#sv-' + sv + ' .ep-item').length > 1 && auto_next) {
            var ep_index = get_ep_index();
            ep_index += 1;
            $('#sv-' + sv + ' .ep-item[data-index=' + ep_index + ']').click();
        }
    });
    player.on('play', function () {
        sv_error = [];
    });
    player.on('firstFrame', function () {
        if (first_load && localStorage.getItem(eid) && localStorage.getItem(eid) > 30) {
            // // console.log('resume');
            first_load = false;
            player.pause();
            $('#time-resume').text(convert_time(localStorage.getItem(eid)));
            $('#pop-resume').modal('show');
        }
    });
    player.on('time', function () {
        if (!load_backup) {
            localStorage.setItem(eid, player.getPosition());
        }
        var isMobile = onetwothree.mobileChecker();
        if (!isMobile) {
            var adTime = onetwothree.adTime();
            if (parseInt(player.getPosition()) === adTime.start && !ad_is_shown) {
                onetwothree.addTag();
                ad_is_shown = true;
            }

            if (parseInt(player.getPosition()) === adTime.end && ad_is_shown) {
                onetwothree.removeTag();
            }
        }
    });
    player.on('error', function (e) {
        // console.log('player error');
        player_error();
    });
}

function convert_time(sec) {
    var d = new Date(0, 0, 0);
    d.setSeconds(+sec);
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    return (hours < 10 ? ("0" + hours) : hours) + ":" + (minutes < 10 ? ("0" + minutes) : minutes) + ':' + (seconds < 10 ? ("0" + seconds) : seconds);
}

$('#yes-resume').click(function () {
    $('#pop-resume').modal('hide');
    player.seek(localStorage.getItem(eid));
});

$('#no-resume').click(function () {
    $('#pop-resume').modal('hide');
    player.play();
});

$('.bp-btn-autonext').click(function () {
    if (auto_next) {
        auto_next = false;
        $('#state-auto-next').text('OFF');
    } else {
        auto_next = true;
        $('#state-auto-next').text('ON');
    }
});

$(document).on('click', '.ep-item', function () {
    eid = $(this).attr('data-id');
    sv = $(this).attr('data-server');

    $('.ep-item').removeClass('active');
    $('#ep-' + eid).addClass('active');

    if ($('#sv-' + sv).hasClass('embed')) {
        $('#content-embed').show();
        $('#media-player').hide();
        player.stop();
        get_embed();
    } else {
        $('#media-player').show();
        $('#content-embed').hide();
        get_sources();
    }

    change_url();
});

$(document).ready(function () {
    get_episodes();
    if (loc.search !== '') {
        eid = loc.search.split('=');
        eid = eid[1];
        if ($('#ep-' + eid).length > 0) {
            sv = $('#ep-' + eid).attr('data-server');
            $('#sv-' + sv).click();
            $('#ep-' + eid).click();
        } else {
            window.location.href = loc.protocol + '//' + loc.hostname + loc.pathname;
        }
    } else {
        load_server();
    }

    setTimeout(function () {
        if (!$.cookie("view-" + mid)) {
            $.ajax({
                url: '/ajax/movie_view',
                type: 'POST',
                dataType: 'json',
                data: {id: mid},
                success: function (res) {
                    var date = new Date();
                    var minutes = 10;
                    date.setTime(date.getTime() + (minutes * 60 * 1000));
                    $.cookie("view-" + mid, true, {expires: date, path: loc.pathname});
                }
            });
        }
    }, 5000);

    $("#report-form").submit(function (e) {
        $('#report-error').hide();
        if (($("#report-form input[name*='issue']:checked").length) <= 0) {
            $('#report-error').show();
        } else {
            if (!$.cookie('report-' + eid)) {
                $("#report-submit").prop("disabled", true);
                $("#report-loading").show();
                var data = $(this).serializeArray();
                data.push({'name': 'movie_id', 'value': mid});
                data.push({'name': 'episode_id', 'value': eid});
                $.ajax({
                    url: '/ajax/movie_report',
                    type: "POST",
                    data: data,
                    dataType: "json",
                    success: function (res) {
                        report_success();
                    }
                });
            } else {
                report_success();
            }
        }
        e.preventDefault();
    });

    function report_success() {
        $('#report-alert').show();
        setTimeout(function () {
            $('#report-alert').hide();
        }, 5000);
        $("#report-submit").removeAttr("disabled");
        $("#report-loading").hide();
        $(".bp-btn-report").remove();
        $.cookie('report-' + movie.id, true, {path: '/', expires: 1});
        document.getElementById("report-form").reset();
        $('#pop-report').modal('hide');
    }
});
