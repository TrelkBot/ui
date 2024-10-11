/*
 * This part of code is used to initialize the demo app and set up the event handlers we need.
 */

Telegram.WebApp.onEvent('themeChanged', function () {
    document.getElementById('theme_data').innerHTML = JSON.stringify(Telegram.WebApp.themeParams, null, 2);
});

// if (DemoApp.initDataUnsafe.query_id) {
//     document.getElementById('main_btn').style.display = 'block';
// }

document.getElementById('theme_data').innerHTML = JSON.stringify(Telegram.WebApp.themeParams, null, 2);


document.getElementById('ver').innerHTML = Telegram.WebApp.version;
document.getElementById('platform').innerHTML = Telegram.WebApp.platform;

if (DemoApp.initDataUnsafe.receiver) {
    document.getElementById('peer_wrap').style.display = 'block';
    document.getElementById('peer_name').innerHTML = DemoApp.initDataUnsafe.receiver.first_name + ' ' + DemoApp.initDataUnsafe.receiver.last_name;
    if (DemoApp.initDataUnsafe.receiver.photo_url) {
        document.getElementById('peer_photo').setAttribute('src', DemoApp.initDataUnsafe.receiver.photo_url);
    } else {
        document.getElementById('peer_photo').style.display = 'none';
    }
} else if (DemoApp.initDataUnsafe.chat) {
    document.getElementById('peer_wrap').style.display = 'block';
    document.getElementById('peer_name').innerHTML = DemoApp.initDataUnsafe.chat.title;
    if (DemoApp.initDataUnsafe.chat.photo_url) {
        document.getElementById('peer_photo').setAttribute('src', DemoApp.initDataUnsafe.chat.photo_url);
    } else {
        document.getElementById('peer_photo').style.display = 'none';
    }
}

DemoApp.checkInitData();
DemoApp.init();

function setViewportData() {
    document.querySelector('.viewport-border').setAttribute('text', window.innerWidth + ' x ' + round(Telegram.WebApp.viewportHeight, 2))
    document.querySelector('.viewport-stable_border').setAttribute('text', window.innerWidth + ' x ' + round(Telegram.WebApp.viewportStableHeight, 2) +
        ' | is_expanded: ' + (Telegram.WebApp.isExpanded ? 'true' : 'false'));
}

Telegram.WebApp.setHeaderColor('secondary_bg_color');
Telegram.WebApp.onEvent('viewportChanged', setViewportData);
setViewportData();
Telegram.WebApp.onEvent('settingsButtonClicked', function () {
    alert('Settings opened!');
});

let prevBgColorVal = document.getElementById('bg_color_sel').value;
const bgColorInput = document.getElementById('bg_color_input');
const headerColorSel = document.getElementById('header_color_sel');

bgColorInput.value = Telegram.WebApp.backgroundColor;
document.body.setAttribute('style', '--bg-color:' + Telegram.WebApp.backgroundColor);
headerColorSel.value = 'secondary_bg_color';



Telegram.WebApp.onEvent('themeChanged', function () {
    bgColorInput.value = Telegram.WebApp.backgroundColor;
    document.body.setAttribute('style', '--bg-color:' + Telegram.WebApp.backgroundColor);
});
