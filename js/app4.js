
/*
 * This is a demo code for Telegram WebApp for Bots
 * It contains basic examples of how to use the API
 * Note: all requests to backend are disabled in this demo, you should use your own backend
 */

const DemoApp = {

    initData: Telegram.WebApp.initData || '',
    initDataUnsafe: Telegram.WebApp.initDataUnsafe || {},
    MainButton: Telegram.WebApp.MainButton,

    init(options) {
        document.body.style.visibility = '';
        Telegram.WebApp.ready();
        Telegram.WebApp.MainButton.setParams({
            text: 'CLOSE WEBVIEW',
            is_visible: true
        }).onClick(DemoApp.close);
    },
    expand() {
        Telegram.WebApp.expand();
    },
    close() {
        Telegram.WebApp.close();
    },
    toggleMainButton(el) {
        const mainButton = Telegram.WebApp.MainButton;
        if (mainButton.isVisible) {
            mainButton.hide();
            el.innerHTML = 'Show Main Button';
        } else {
            mainButton.show();
            el.innerHTML = 'Hide Main Button';
        }
    },

    // actions
    sendMessage(msg_id, with_webview) {
        if (!DemoApp.initDataUnsafe.query_id) {
            alert('WebViewQueryId not defined');
            return;
        }

        document.querySelectorAll('button').forEach((btn) => btn.disabled = true);

        const btn = document.querySelector('#btn_status');
        btn.textContent = 'Sending...';

        DemoApp.apiRequest('sendMessage', {
            msg_id: msg_id || '',
            with_webview: !DemoApp.initDataUnsafe.receiver && with_webview ? 1 : 0
        }, function (result) {
            document.querySelectorAll('button').forEach((btn) => btn.disabled = false);

            if (result.response) {
                if (result.response.ok) {
                    btn.textContent = 'Message sent successfully!';
                    btn.className = 'ok';
                    btn.style.display = 'block';
                } else {
                    btn.textContent = result.response.description;
                    btn.className = 'err';
                    btn.style.display = 'block';
                    alert(result.response.description);
                }
            } else if (result.error) {
                btn.textContent = result.error;
                btn.className = 'err';
                btn.style.display = 'block';
                alert(result.error);
            } else {
                btn.textContent = 'Unknown error';
                btn.className = 'err';
                btn.style.display = 'block';
                alert('Unknown error');
            }
        });
    },
    changeMenuButton(close) {
        document.querySelectorAll('button').forEach((btn) => btn.disabled = true);
        const btnStatus = document.querySelector('#btn_status');
        btnStatus.textContent = 'Changing button...';

        DemoApp.apiRequest('changeMenuButton', {}, function (result) {
            document.querySelectorAll('button').forEach((btn) => btn.disabled = false);

            if (result.response) {
                if (result.response.ok) {
                    btnStatus.textContent = 'Button changed!';
                    btnStatus.className = 'ok';
                    btnStatus.style.display = 'block';
                    Telegram.WebApp.close();
                } else {
                    btnStatus.textContent = result.response.description;
                    btnStatus.className = 'err';
                    btnStatus.style.display = 'block';
                    alert(result.response.description);
                }
            } else if (result.error) {
                btnStatus.textContent = result.error;
                btnStatus.className = 'err';
                btnStatus.style.display = 'block';
                alert(result.error);
            } else {
                btnStatus.textContent = 'Unknown error';
                btnStatus.className = 'err';
                btnStatus.style.display = 'block';
                alert('Unknown error');
            }
        });
        if (close) {
            setTimeout(function () {
                Telegram.WebApp.close();
            }, 50);
        }
    },
    checkInitData() {
        const webViewStatus = document.querySelector('#webview_data_status');
        if (DemoApp.initDataUnsafe.query_id &&
            DemoApp.initData &&
            webViewStatus.classList.contains('status_need')
        ) {
            webViewStatus.classList.remove('status_need');

            setInterval(function () {
                DemoApp.apiRequest('checkInitData', {
                    query_id: DemoApp.initDataUnsafe.query_id,
                    hash: DemoApp.initDataUnsafe.hash
                }, async function (result) {
                    if (result.ok) {
                        const res = result
                        const { stats } = res.stats;
                        fetch(`/assets/app/langs/es.json`)
                            .then(response => response.json())
                            .then(l => {
                                // Ahora puedes usar el contenido del JSON
                                const titles = l.titles;
                                for (const key in titles) {
                                    if (titles.hasOwnProperty(key)) {
                                        const element = document.getElementById(key);
                                        if (element) {
                                            element.textContent = titles[key];
                                        }
                                    }
                                }
                                for (const key in l) {
                                    if (l.hasOwnProperty(key) && key !== "titles") {
                                        console.log('key', key);
                                        const element = document.getElementById(key);
                                        if (element) {
                                            element.textContent = l[key].replace('{value}', obtenerValorByKey(key));
                                        }
                                    }
                                }
    
    
                                function obtenerValorByKey(key) {
                                    return stats[key] || '';
                                }
                                // Asigna el contenido del JSON a la variable global window.idiomas
                                window.langs = l;
    
                                // Otros pasos después de cargar y asignar el JSON
                            })
                            .catch(error => {
                                console.error('Error al cargar el JSON:', error);
                            });
    
    
                        console.log('pene',);
    
                        document.getElementById('webview_data').textContent = JSON.stringify(stats, null, 2);
    
                        // g('total_reqs').innerHTML = '📈 Totales: ' + stats.requests;
                        // g('success_reqs').innerHTML = '📉 Exitosas: ' + stats.succesful_requests;
                        // g('failed_reqs').innerHTML = '📉 Fallidas: ' + stats.failed_requests;
                        var ctxSolicitudes = document.getElementById('solicitudesChart').getContext('2d');
    
                        new Chart(ctxSolicitudes, {
                            type: 'bar',
                            data: {
                                labels: ['Totales', 'Exitosas', 'Fallidas'],
                                datasets: [{
                                    label: 'Solicitudes',
                                    data: [stats.total_reqs, stats.success_reqs, stats.failed_reqs],
                                    backgroundColor: [
                                        'rgba(54, 162, 235, 0.2)',
                                        'rgba(75, 192, 192, 0.2)',
                                        'rgba(255, 99, 132, 0.2)',
                                    ],
                                    borderColor: [
                                        'rgb(54, 162, 235)',
    
                                        'rgba(75, 192, 192, 1)',
                                        'rgba(255, 99, 132, 1)',
    
                                    ],
                                    borderWidth: 1
                                }]
                            }
                        });
                        updateChartHtpp(stats.methods_stats);
                        updateChartCountry(stats.country_stats);
                        updateChartBlockedRequests(stats.blocked_reqs);
                        g('last_req_code').innerHTML = '📉 Código de estado: ' + stats.last_req.res_code;
                        g('last_req_country').innerHTML = '📉 País: ' + stats.last_req.country;
                        g('last_req_method').innerHTML = '📉 Método: ' + stats.last_req.method;
                        g('last_req_ip').innerHTML = '📉 IP: ' + stats.last_req.ip;
                        g('last_req_time').innerHTML = '📉 Tiempo de respuesta: ' + stats.last_req.res_time + 'ms';
                        g('last_req_date').innerHTML = '📉 Fecha: ' + new Date(stats.last_req.date).toLocaleString();
    
    
                        webViewStatus.textContent = 'Hash is correct (async)3333333';
                        webViewStatus.className = 'ok';
                    } else {
    
                        webViewStatus.textContent = JSON.stringify(result) + ' (async)';
                        webViewStatus.className = 'err';
                    }
                });
            }, 100);
        
        }
    },
    sendText(spam) {
        const textField = document.querySelector('#text_field');
        const text = textField.value;
        if (!text.length) {
            return textField.focus();
        }
        if (byteLength(text) > 4096) {
            return alert('Text is too long');
        }

        const repeat = spam ? 10 : 1;
        for (let i = 0; i < repeat; i++) {
            Telegram.WebApp.sendData(text);
        }
    },
    sendTime(spam) {
        const repeat = spam ? 10 : 1;
        for (let i = 0; i < repeat; i++) {
            Telegram.WebApp.sendData(new Date().toString());
        }
    },

    // Alerts
    showAlert(message) {
        Telegram.WebApp.showAlert(message);
    },
    showConfirm(message) {
        Telegram.WebApp.showConfirm(message);
    },
    requestWriteAccess() {
        Telegram.WebApp.requestWriteAccess(function (result) {
            if (result) {
                DemoApp.showAlert('Write access granted');
            } else {
                DemoApp.showAlert('Write access denied');
            }
        });
    },
    requestContact() {
        Telegram.WebApp.requestContact(function (result) {
            if (result) {
                DemoApp.showAlert('Contact granted');
            } else {
                DemoApp.showAlert('Contact denied');
            }
        });
    },
    showPopup() {
        Telegram.WebApp.showPopup({
            title: 'Popup title',
            message: 'Popup message',
            buttons: [
                { id: 'delete', type: 'destructive', text: 'Delete all' },
                { id: 'faq', type: 'default', text: 'Open FAQ' },
                { type: 'cancel' },
            ]
        }, function (buttonId) {
            if (buttonId === 'delete') {
                DemoApp.showAlert("'Delete all' selected");
            } else if (buttonId === 'faq') {
                Telegram.WebApp.openLink('https://telegram.org/faq');
            }
        });
    },
    showScanQrPopup: function (linksOnly) {
        Telegram.WebApp.showScanQrPopup({
            text: linksOnly ? 'with any link' : 'for test purposes'
        }, function (text) {
            if (linksOnly) {
                const lowerText = text.toString().toLowerCase();
                if (lowerText.substring(0, 7) === 'http://' ||
                    lowerText.substring(0, 8) === 'https://'
                ) {
                    setTimeout(function () {
                        Telegram.WebApp.openLink(text);
                    }, 50);

                    return true;
                }
            } else {
                DemoApp.showAlert(text);

                return true;
            }
        });
    },

    // Permissions
    requestLocation(el) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                el.nextElementSibling.innerHTML = '(' + position.coords.latitude + ', ' + position.coords.longitude + ')';
                el.nextElementSibling.className = 'ok';
            });
        } else {
            el.nextElementSibling.innerHTML = 'Geolocation is not supported in this browser.';
            el.nextElementSibling.className = 'err';
        }
        return false;
    },
    requestVideo(el) {
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(function (stream) {
                el.nextElementSibling.innerHTML = '(Access granted)';
            });
        } else {
            el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
            el.nextElementSibling.className = 'err';
        }
        return false;
    },
    requestAudio(el) {
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {
                el.nextElementSibling.innerHTML = '(Access granted)';
                el.nextElementSibling.className = 'ok';
            });
        } else {
            el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
            el.nextElementSibling.className = 'err';
        }
        return false;
    },
    requestAudioVideo(el) {
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(function (stream) {
                el.nextElementSibling.innerHTML = '(Access granted)';
                el.nextElementSibling.className = 'ok';
            });
        } else {
            el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
            el.nextElementSibling.className = 'err';
        }
        return false;
    },
    testClipboard(el) {
        Telegram.WebApp.readTextFromClipboard(function (clipText) {
            if (clipText === null) {
                el.nextElementSibling.innerHTML = 'Clipboard text unavailable.';
                el.nextElementSibling.className = 'err';
            } else {
                el.nextElementSibling.innerHTML = '(Read from clipboard: Â«' + clipText + 'Â»)';
                el.nextElementSibling.className = 'ok';
            }
        });
        return false;
    },

    // Other
    apiRequest(method, data, onCallback) {
        // DISABLE BACKEND FOR FRONTEND DEMO
        // YOU CAN USE YOUR OWN REQUESTS TO YOUR OWN BACKEND
        // CHANGE THIS CODE TO YOUR OWN
        // return onCallback && onCallback({error: 'This function (' + method + ') should send requests to your backend. Please, change this code to your own.'});

        const authData = DemoApp.initData || '';
        console.log('authData', authData);
        fetch('/api/apps/check?apikey=E6Uin8VBHo_taGhGeuKcMcZuoLY9H4sJ', {
            method: 'POST',
            body: JSON.stringify(Object.assign(data, {
                check_data: authData,
                method: method,
            })),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            console.log(response);
            return response;
        }).then(async function (result) {
            // alert(JSON.stringify(await result.json()));
            // DemoApp.close();
            onCallback && onCallback(await result.json());
        }).catch(function (error) {
            alert(error);
            onCallback && onCallback({ error: 'Server error' });
        });
    }
}

const DemoAppMenu = {
    init() {
        DemoApp.init();
        document.body.classList.add('gray');
        Telegram.WebApp.setHeaderColor('secondary_bg_color');
    }
};

const DemoAppInitData = {
    init() {
        DemoApp.init();
        Telegram.WebApp.onEvent('themeChanged', function () {
            document.getElementById('theme_data').innerHTML = JSON.stringify(Telegram.WebApp.themeParams, null, 2);
        });
        document.getElementById('webview_data').innerHTML = JSON.stringify(DemoApp.initDataUnsafe, null, 2);
        document.getElementById('theme_data').innerHTML = JSON.stringify(Telegram.WebApp.themeParams, null, 2);
        DemoApp.checkInitData();
    }
};

const DemoAppViewport = {
    init() {
        DemoApp.init();
        Telegram.WebApp.onEvent('viewportChanged', DemoAppViewport.setData);
        DemoAppViewport.setData();
    },
    setData() {
        document.querySelector('.viewport-border').setAttribute('text', window.innerWidth + ' x ' + round(Telegram.WebApp.viewportHeight, 2))
        document.querySelector('.viewport-stable_border').setAttribute('text', window.innerWidth + ' x ' + round(Telegram.WebApp.viewportStableHeight, 2) +
            ' | is_expanded: ' + (Telegram.WebApp.isExpanded ? 'true' : 'false'));
    }
};

function byteLength(str) {
    if (window.Blob) {
        try {
            return new Blob([str]).size;
        } catch (e) {
        }
    }

    let s = str.length;
    for (let i = str.length - 1; i >= 0; i--) {
        const code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) {
            s++;
        } else if (code > 0x7ff && code <= 0xffff) {
            s += 2;
        }

        if (code >= 0xDC00 && code <= 0xDFFF) {
            i--;
        }
    }
    return s;
}

function round(val, d) {
    const k = Math.pow(10, d || 0);
    return Math.round(val * k) / k;
}

function g(element_id) {
    return document.getElementById(element_id);
}

function updateChartHtpp(data) {
    var ctxHtppStats = document.getElementById('httpStatsChart').getContext('2d');
    var labels = Object.keys(data)
    var exitosasData = labels.map(function (method) {
        return data[method].success_reqs || 0;
    });
    var fallidasData = labels.map(function (method) {
        return data[method].failed_reqs || 0;
    });

    new Chart(ctxHtppStats, {
        type: 'bar',
        data: {
            labels: labels.map(function (method) {
                return method.toUpperCase();
            }),
            datasets: [
                {
                    label: 'Totales',
                    data: labels.map(function (method) {
                        return data[method].total_reqs || 0;
                    }),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: 'Exitosas',
                    data: exitosasData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Fallidas',
                    data: fallidasData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }

            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateChartCountry(countryStats) {
    var countries = Object.keys(countryStats);
    var ctxCountryStatsChart = document.getElementById('countryStatsChart').getContext('2d');
    new Chart(ctxCountryStatsChart, {
        type: 'bar',
        data: {
            labels: countries,
            datasets: [
                {
                    label: 'Totales',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1,
                    data: countries.map(country => {
                        return countryStats[country].total_reqs
                    })
                },
                {
                    label: 'Exitosas',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    data: countries.map(country => {
                        return countryStats[country].success_reqs
                    })
                },
                {
                    label: 'Fallidas',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: countries.map(country => countryStats[country].failed_reqs)
                }
            ]
        },
        options: {
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        }
    });
}


function updateChartBlockedRequests(blockedRequestsData) {
    const keysAndName = {
        "for_limit": "Por límite",
        "for_ip": "Por IP",
        "for_method": "Por método",
        "for_country": "Por país",
        "for_auth": "Por autenticación",
        "total": "Total"
    };

    keyWithName = Object.keys(blockedRequestsData).map(function (key) {
        return keysAndName[key] || key;
    });
    // Configuración de datos para Chart.js
    var chartData = {
        labels: Object.values(keyWithName),
        datasets: [{
            data: Object.values(blockedRequestsData),
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)'
            ],
            borderWidth: 1
        }]
    };

    // Configuración del gráfico de dona
    var ctxBlockedRequestsChart = document.getElementById('blockedRequestsChart').getContext('2d');
    var blockedRequestsChart = new Chart(ctxBlockedRequestsChart, {
        type: 'doughnut',
        data: chartData
    });
}
