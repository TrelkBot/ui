// Crear div.card
const ACCOUNTS_API_URL = `https://accounts.trelk.xyz`

function api(url, opts = {}) {
    return fetch(url, {
        method: 'POST', // form.getAttribute('data-tb-method') || 'POST',
        // form.getAttribute('data-tb-method'),
        credentials: 'include',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // 'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        ...opts
    })
}

const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(navLink => {
    navLink.addEventListener('click', function (event) {
        const href = this.getAttribute('href');
        const currentUrl = new URL(window.location);
        const splitUrl = currentUrl.pathname.split('/')
        splitUrl[2] = href.replace('#', '')
        console.log(splitUrl.join('/'))
        currentUrl.pathname = splitUrl.join('/')
        const state = { page_id: splitUrl };
        const title = "Pene";
        history.pushState(state, title, currentUrl);

    });
});


// tabEl.addEventListener('shown.bs.tab', event => {
//     console.log(event)
//     event.target // newly activated tab
//     event.relatedTarget // previous active tab
// })


// document.get

api(`${ACCOUNTS_API_URL}/users/notifications`).then((res) => res.json()).then(async (data) => {

    processNotification(data)
    // console.log(JSON.stringify(data, null, 2))
})

// processNotification({
//     countUnread: 0,
//     data: {
//         today: [
//             {
//                 category: "login",
//                 color: 'warning',
//                 type: 'Login attempend',
//                 parse_date: "Hoy a las 12:20",
//                 title: "¿Estás intentando iniciar sesión?",
//                 content: "Recientemente alguien intentó iniciar sesión en tu cuenta desde una computadora o un navegador de celular desconocidos.",
//                 login_data: {
//                     device_parse: "Chrome para Windows 10"
//                 },
//                 buttons: [
//                     {
//                         text: "Fui yo",
//                         callback: 'mbio59j9o5mokmobfe'
//                     },
//                     {
//                         text: "No fui yo",
//                         callback: "mvo94mcmoskflcksekc"
//                     }
//                 ]

//             }, {
//                 category: "login",
//                 color: 'warning',
//                 type: 'Login attempend',
//                 parse_date: "Hoy a las 12:20",
//                 title: "¿Estás intentando iniciar sesión?",
//                 content: "Recientemente alguien intentó iniciar sesión en tu cuenta desde una computadora o un navegador de celular desconocidos.",
//                 login_data: {
//                     device_parse: "Chrome para Windows 10"
//                 },
//                 buttons: [
//                     {
//                         text: "Fui yo",
//                         callback: 'mbio59j9o5mokmobfe'
//                     },
//                     {
//                         text: "No fui yo",
//                         callback: "mvo94mcmoskflcksekc"
//                     }
//                 ]

//             }
//         ],
//         yesterday: [
//             {
//                 category: "login",
//                 color: 'warning',
//                 type: 'Login attempend',
//                 parse_date: "Hoy a las 12:20",
//                 title: "¿Estás intentando iniciar sesión?",
//                 content: "Recientemente alguien intentó iniciar sesión en tu cuenta desde una computadora o un navegador de celular desconocidos.",
//                 login_data: {
//                     device_parse: "Chrome para Windows 10"
//                 },
//                 buttons: [
//                     {
//                         text: "Fui yo",
//                         callback: 'mbio59j9o5mokmobfe'
//                     },
//                     {
//                         text: "No fui yo",
//                         callback: "mvo94mcmoskflcksekc"
//                     }
//                 ]

//             }, {
//                 category: "login",
//                 color: 'warning',
//                 type: 'Login attempend',
//                 parse_date: "Hoy a las 12:20",
//                 title: "¿Estás intentando iniciar sesión?",
//                 content: "Recientemente alguien intentó iniciar sesión en tu cuenta desde una computadora o un navegador de celular desconocidos.",
//                 login_data: {
//                     device_parse: "Chrome para Windows 10"
//                 },
//                 buttons: [
//                     {
//                         text: "Fui yo",
//                         callback: 'mbio59j9o5mokmobfe'
//                     },
//                     {
//                         text: "No fui yo",
//                         callback: "mvo94mcmoskflcksekc"
//                     }
//                 ]

//             }
//         ]

//     }
// })

async function processNotification(notificationsData = { data: {} }) {

    notificationsData?.countUnread ? document.getElementById('_notifications_count').textContent = notificationsData.countUnread : '';
    Object.keys(notificationsData.data).forEach((key, i) => {
        var notificationcontainer = document.getElementById('_notifications_body')
        if (notificationsData.data[key].length) {
            var pToday = document.createElement('p')
            pToday.id = `_notifications_${key}`
            pToday.classList.add('text-span')
            // pToday.style.textTransform = 'uppercase'
            pToday.textContent = key
            notificationcontainer.append(pToday)
        }
        notificationsData.data[key].forEach((notification) => {
            // console.log(notification)
            {
                var cardDiv = document.createElement('div'); cardDiv.classList.add('card', 'mb-3');
                var cardBodyDiv = document.createElement('div'); cardBodyDiv.classList.add('p-4');
                var alignCenterDiv = document.createElement('div'); alignCenterDiv.classList.add('align-items-center', 'd-flex', 'flex-wrap', 'gap-2', 'mb-3');
                var badgeDiv = document.createElement('div'); badgeDiv.classList.add('badge', `bg-light-${notification.color}`, 'f-12'); badgeDiv.textContent = notification.type;
                var pTag = document.createElement('p'); pTag.classList.add('mb-0', 'text-muted'); pTag.textContent = notification.parse_date;
                var spanBadge = document.createElement('span'); spanBadge.classList.add('badge', 'dot', `bg-${notification.color}`);
                alignCenterDiv.appendChild(badgeDiv); alignCenterDiv.appendChild(pTag); alignCenterDiv.appendChild(spanBadge);
                cardBodyDiv.appendChild(alignCenterDiv);
                var h5Tag = document.createElement('h5'); h5Tag.classList.add('mb-3'); h5Tag.textContent = notification.title;
                var pTag2 = document.createElement('p'); pTag2.classList.add('text-muted'); pTag2.textContent = notification.content;
                var pTag3 = document.createElement('p'); pTag3.classList.add('text-muted'); pTag3.innerHTML = '<b>Dispositivo:</b> Chrome para Windows 10';
                cardBodyDiv.appendChild(h5Tag); cardBodyDiv.appendChild(pTag2); cardBodyDiv.appendChild(pTag3);
                var rowDiv = document.createElement('div'); rowDiv.classList.add('row');
                var col5Div1 = document.createElement('div'); col5Div1.classList.add('col-5');
                var dGridDiv1 = document.createElement('div'); dGridDiv1.classList.add('d-grid');

                var fuiYoLink = document.createElement('a'); fuiYoLink.classList.add('btn', 'btn-sm', 'btn-light-primary', 'btn-outline-primary');
                fuiYoLink.setAttribute('data-tb-apiPath', `users/approveSession`);
                fuiYoLink.id = notification.id
                fuiYoLink.setAttribute('data-tb-method', `post`)
                fuiYoLink.setAttribute('data-tb-key', `approve`)
                fuiYoLink.setAttribute('data-tb-value', notification.id)
                fuiYoLink.setAttribute('onclick', `ProcessingAction('${notification.id}')`)
                fuiYoLink.textContent = 'Fui yo';
                fuiYoLink.target = '_blank';
                dGridDiv1.appendChild(fuiYoLink);
                col5Div1.appendChild(dGridDiv1);
                var col5Div2 = document.createElement('div');
                col5Div2.classList.add('col-5');
                var dGridDiv2 = document.createElement('div');
                dGridDiv2.classList.add('d-grid');
                var noFuiYoLink = document.createElement('a');
                noFuiYoLink.classList.add('btn', 'btn-sm', 'btn-light-danger', 'btn-outline-danger');
                noFuiYoLink.href = 'https://1.envato.market/zNkqj6';
                noFuiYoLink.textContent = 'No fui yo';
                noFuiYoLink.target = '_blank';
                dGridDiv2.appendChild(noFuiYoLink);
                col5Div2.appendChild(dGridDiv2);

                // Agregar div.col-5 a div.row
                rowDiv.appendChild(col5Div1);
                rowDiv.appendChild(col5Div2);

                // Agregar div.row a div.card-body
                cardBodyDiv.appendChild(rowDiv);

                // Agregar div.card-body a div.card
                cardDiv.appendChild(cardBodyDiv);

                // document.getElementById('_notifications_' + key).appendChild(cardBodyDiv)
                const notificationsContainer = document.getElementById('_notifications_' + key);

                // Crear el elemento cardBodyDiv

                // Obtener el primer hijo del contenedor de notificaciones
                const firstChild = notificationsContainer.firstChild;

                // Insertar el elemento cardBodyDiv antes del primer hijo
                notificationsContainer.insertBefore(cardBodyDiv, firstChild);

                cardBodyDiv.classList.add('card', 'mt-3')
            }

        })

    })



}



function viewLoginDetails(data) {

    console.log(data)

    var animateModal = document.getElementById('_session_details');
    // animateModal.addEventListener('show.bs.modal', function (event) {
    //     var button = event.relatedTarget;
    //     var recipient = button.getAttribute('data-tb-animate');
    //     var modalTitle = animateModal.querySelector('.modal-title');
    //     // modalTitle.textContent = 'Animate Modal : ' + recipient;
    //     animateModal.classList.add('anim-' + recipient);
    //     if (recipient == 'let-me-in' || recipient == 'make-way' || recipient == 'slip-from-top') {
    //         document.body.classList.add('anim-' + recipient);
    //     }
    // });
    document.getElementById('_login_device').innerHTML = data.login_device
    document.getElementById('_account_modal_btn_html').innerHTML = ''
    document.getElementById('_account_modal_btn_html').innerHTML = '<button type="button" class="btn btn-light-danger btn-danger" id="_account_modal_btn" data-bs-dismiss="modal">Logout</button>'
    document.getElementById('_login_browser').innerHTML = data.browser
    document.getElementById('_login_geo').innerHTML = data.geo
    document.getElementById('_login_time').innerHTML = new Date(parseInt(data.created_at)).toLocaleString()
    document.getElementById('_account_modal_btn').setAttribute('onclick', `ProcessingAction(document.getElementById('_account_destroy_session_modal')); this.onclick = ''; this.innerHTML = "<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>"`)
    document.getElementById('_account_destroy_session_input').value = data.session_id
    animateModal.addEventListener('hidden.bs.modal', function (event) {
        removeClassByPrefix(animateModal, 'anim-');
        removeClassByPrefix(document.body, 'anim-');
    });

    function removeClassByPrefix(node, prefix) {
        for (let i = 0; i < node.classList.length; i++) {
            let value = node.classList[i];
            if (value.startsWith(prefix)) {
                node.classList.remove(value);
            }
        }
    }


}

const login = {
    login_device: "Xiaomi Redmi Note 8",
    ip: "192.233.32.23",
    country: 'CO',
    browser: "Chrome",
    geo_data: "Barranquilla - Atlantico",


}
async function md5(cadena) {
    const msgUint8 = new TextEncoder().encode(cadena);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
document.querySelectorAll('[data-tb-apiPath]').forEach(async (e) => {
    const submitBtn = e.querySelector('button[type="submit"]');
    const hash = await md5(e.innerHTML);
    let is_legal = false;
    e.setAttribute('data-hash', hash);
    if (submitBtn) {
        submitBtn.setAttribute('disabled', true);
        e.addEventListener('input', async (evt) => {
            const newHash = await md5(document.getElementById(evt.target.form.id).innerHTML);
            const oldHash = evt.target.form.getAttribute('data-hash');
            if (evt.target.getAttribute('data-validator') == 'true') {
                e.querySelectorAll('[maxlength]').forEach((el) => {
                    if (evt.target.value.length >= el.getAttribute('maxlength')) {
                        is_legal = true;
                    } else {
                        is_legal = false;
                    }
                })
            } else if (evt.target.tagName == 'SELECT') {
                is_legal = true;
            } else {
                is_legal = true;
            }


            // console.log(evt.target.id, evt.target.value, is_legal)
            if (is_legal) {
                submitBtn.removeAttribute('disabled')
            } else {
                submitBtn.setAttribute('disabled', true);

            }
            // if (newHash !== oldHash) {
            //     console.log('El hash ha cambiado.');
            //     submitBtn.removeAttribute('disabled');
            // } else {
            //     console.log('El hash es el mismo que antes.');
            //     submitBtn.setAttribute('disabled', true);
            // }
        });
    }
});

async function ProcessingAction(form_) {
    var form = document.getElementById(typeof form_ == 'object' ? form_.id : form_)
    const sendUrl = `${ACCOUNTS_API_URL}/${form.getAttribute('data-tb-apiPath')}`
    // console.log(form)
    var btnSubmitText = '';
    var submitBtn;
    if (form.tagName == 'FORM') {
        submitBtn = form.querySelector(`button[type="submit"]`) || form.querySelector(`a[type="submit"]`);
    }
    const rendCaptcha = form.querySelector('[data-insert-captcha-rendering="true"]');

    if (be = localStorage.getItem('blocked_endpoints')) {
        const blocked_endpoints = JSON.parse(be);
        const is_blocked = blocked_endpoints[sendUrl]
        if (is_blocked) {
            if (submitBtn) {
                btnSubmitText = submitBtn?.innerHTML;
                console.log('text', btnSubmitText, submitBtn?.innerText)
                submitBtn?.setAttribute?.('disabled', true);
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
            }
            // sleep(600);
            handlerNotOk(is_blocked)
            return
        }
        console.log(blocked_endpoints)
    }
    if (rendCaptcha) {
        rendCaptcha.setAttribute('data-insert-captcha-rendering', 'false')
        handlerCaptcha(form, submitBtn, { submit: true, deleted: true })
        return
    }
    if (submitBtn) {
        btnSubmitText = submitBtn?.innerHTML;
        console.log('text', btnSubmitText, submitBtn?.innerText)
        submitBtn?.setAttribute?.('disabled', true);
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    }
    var formData = {};
    var es = form?.elements || [];
    for (var i = 0; i < es.length; i++) {
        var e = es[i];
        if (e.tagName === "INPUT" || e.tagName === "SELECT") {
            if (e.role == 'switch') {
                e.value = e.checked == 'true' ? true : false;
            }
            if (e.type == 'file' && e.files[0]) {
                const file = e.files[0];
                const formData = new FormData();
                console.log(file)
                formData.append('avatar', file, 'imagen.jpg');
                const res = await api(`${ACCOUNTS_API_URL}/users/uploadAvatar`, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    method: "POST",
                    body: formData,
                }).then(data => {
                    console.log('Respuesta del servidor:', data);
                }).catch(error => {
                    console.error('Error al enviar la solicitud:', error);
                });
            }
            // invalidInput(e.id, 'Insert a email valid', true, e.type)
            if (e.required && !e.value) invalidInput(e.id, 'Insert a email valid', true);
            // formData.append(e.id, e.value);

            formData[e.getAttribute('data-tb-key') || e?.name?.replace(/-/g, '_') || e.id.replace('_', '_')] = e.getAttribute('data-tb-value') || e.value;
        }
    }
    form.getAttribute('data-tb-keys')?.split(',')?.forEach((v, i) => {
        const values = form?.getAttribute('data-tb-values')?.split(',');
        const match = values[i]?.match(/\{([^}]+)\}/g)?.map(match => match?.slice(1, -1)?.toLocaleLowerCase());
        if (match) {
            formData['_' + v] = form.getAttribute(`data-${match[0]}`);
        } else {
            formData['_' + v] = values[i];
        }
    });

    formData[form.getAttribute('data-tb-key') || undefined] = form.getAttribute('data-tb-value') || undefined;
    api(sendUrl, {
        method: form.getAttribute('data-tb-method') || 'POST',
        body: JSON.stringify(formData),
    }).then(response => response.json())
        .then(data => {
            document.querySelectorAll(`[data-tb-res-target="${form.id}"]`).forEach((e) => {
                e.innerText = data[e.getAttribute(`data-tb-res`)]
            });
            document.querySelectorAll(`[data-tb-res-status="${form.id}"],[data-tb-res-await="${form.id}"]`).forEach((e) => {
                e.role == 'status' ? e.setAttribute('hidden', true) : e.removeAttribute('hidden')
            });
            document.querySelectorAll(`[data-tb-res-set-target="${form.id}"]`).forEach((e) => {
                e.setAttribute(e.getAttribute('data-tb-res-set'), eval(e.getAttribute('data-tb-res-set-data')))
            });
            console.log('Success:', data);
            if (data.ok) {
                handlerOk(data);
            } else {
                handlerNotOk(data)
                if (data.captcha) {
                    submitBtn.setAttribute('disabled', true)
                    handlerCaptcha(form, submitBtn, { deleted: true })
                }
                if (data.blocked) {
                    if (!localStorage.getItem('blocked_endpoints')) {
                        localStorage.setItem('blocked_endpoints', JSON.stringify({}))
                    }
                    const blocked_endpoints = JSON.parse(localStorage.getItem('blocked_endpoints')); blocked_endpoints[sendUrl] = data; localStorage.setItem('blocked_endpoints', JSON.stringify(blocked_endpoints));
                }
            }
            const handlerOkfunc =  form.getAttribute('onload') || form.getAttribute('data-tb-on-ok') 
            if (handlerOkfunc) {
                console.log(handlerOkfunc)
                eval(`(${handlerOkfunc})()`);
                // const functionName = handlerOk.split('(')[0]; // Extraer el nombre de la función
                // const functionToCall = window[functionName]; // Buscar la función por su nombre en el ámbito global
                // // Verificar si la función existe y es una función
                // if (typeof functionToCall === 'function') {
                //     // Ejecutar la función
                //     console.log(functionToCall)
                //     functionToCall(data.codes);
                // } else {
                //     console.error('Function not found:', functionName);
                // }
            }
        })
        .catch((error) => {
            if (submitBtn) { submitBtn.innerHTML = btnSubmitText; submitBtn?.removeAttribute?.('disabled') }
            // handlerNotOk(data)

            console.log('Error:', error);
        });

    function handlerNotOk(data) {

        console.log('!ok', btnSubmitText)
        if (submitBtn) { submitBtn.innerHTML = btnSubmitText; submitBtn?.removeAttribute?.('disabled') };

        if (data.affected) {
            data.affected.forEach((id) => {
                invalidInput(id, false, true)
            })
        }
        if (data.error && data.notify) {
            toast_(data.error)
        }
        return;

    }

    function handlerOk(data) {
        if (submitBtn) { submitBtn.innerHTML = btnSubmitText; submitBtn?.removeAttribute?.('disabled') };

        if (data.deleted) {
            document.getElementById(data.deleted)?.remove()
        }

        if (data.redirect || data.reload) {
            window.href = data.redirect
            window.location.reload()
        }
        if (data.reload) {
            window.location.reload()
        }

        if (data.message && data.notify) {
            toast_(data.message)
        }
    }
}






function handlerCaptcha(form, submitBtn, opts = {}) {
    opts.deleted ? document.querySelectorAll('[data-captcha]').forEach((el) => el.remove()) : '';

    var captchaDiv = document.createElement('div');
    captchaDiv.setAttribute('data-captcha', true);
    captchaDiv.classList.add('mt-3');
    // document.getElementById(data.affected[0]).appendChild(captchaDiv);
    var element = form.querySelector('[data-insert-captcha]');
    element.parentNode.insertBefore(captchaDiv, element.nextSibling);
    // return
    turnstile.ready(function () {
        turnstile.render(captchaDiv, {
            sitekey: '0x4AAAAAAAReYvRmUyocoGP8',
            // size: esDispositivoMovil() ? 'normal' : 'compact',
            callback: function (token) {
                console.log(token)
                submitBtn.removeAttribute('disabled');
                if (opts.submit) {
                    submitBtn.click()
                }
                // bled('_validate_password_submit', false);
                // $("#captcha").val(token);
            },
            'error-callback': function () {

            }
        });
    });
}
// verificamos si el usuario esta logueado cada 5 segundos
// setInterval(() => {
//     fetch(`${ACCOUNTS_API_URL}/auth/session`, {
//         method: 'GET',
//         credentials: 'include',
//         mode: 'cors',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-Requested-With': 'XMLHttpRequest',
//             'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
//         },
//     }).then(data => { })
//         .catch((error) => {
//             window.location.reload()
//             console.error('Error:', error);
//         });
// }, 5000);


function invalidInput(i, y = false, event = false, validators) {
    const e = document.getElementById(i)


    if (validators) {
        switch (validators) {
            case 'email':
                var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (regex.test(e.value)) {
                    return invalidInput(arguments)
                }
                break;

            default:
                break;
        }
    }
    // text ?  $("#" + x + '_invalid').text(text) : '';


    const invalidDiv = document.createElement('div');
    invalidDiv.id = `${i}_invalid`;
    invalidDiv.classList.add('invalid-feedback');
    invalidDiv.textContent = y ? y : '';
    if (e.parentNode.querySelector(`#${i}_invalid`)) e.parentNode.querySelector(`#${i}_invalid`).remove();

    e.parentNode.appendChild(invalidDiv);
    e.classList.add('is-invalid');
    e.style.borderColor = "#dc3545"
    e.style.borderWidth = "2px"
    // $("#" + i).addClass('is-invalid').css("border-color", "#dc3545");

    // $("#" + i + "-label").css("color", "#dc3545");

    if (y) {
        const inv = document.getElementById(`${i}_invalid`)
        inv.textContent = y;
        // $("#" + i + "_invalid").text(y);
    }
    if (event) {
        const handleEvent = (handle) => {
            if (!e.value.length) {
                e.style.border = "1px solid rgb(220, 53, 67)";
                e.classList.add('is-invalid');
            } else {
                e.style.border = "";
                e.classList.remove('is-invalid');
            }
        }
        e.addEventListener("keyup", handleEvent);
        e.addEventListener("keydown", handleEvent);
        e.addEventListener("change", handleEvent);
        // e.addEventListener("click", handleEvent);
        // $('#element').bind("keyup keydown change click", function () {
        //     if (!g.val().length) {
        //         g.attr("style", "border:1px solid rgb(220 53 67);").addClass('is-invalid')
        //     } else {
        //         g.removeAttr('style').removeClass('is-invalid')

        //     }
        // });
    }
}


function obtenerLabel(inputId) {
    // Buscar el label asociado al input por su atributo 'for'
    var label = formulario.querySelector('label[for="' + inputId + '"]');
    // Verificar si se encontró un label
    if (label) {
        return label.textContent || label.innerText;
    } else {
        return null; // Si no se encontró un label, retornar null
    }
}

function nameo() {
    li = document.querySelector("#_init_r_c").querySelectorAll('[data="recovery-code"]');
    f = "1. " + li[0].innerText + " 		 " + "5. " + li[4].innerText + '\n' + "2. " + li[1].innerText + " 		 6. " + li[5].innerText + '\n' + "3. " + li[2].innerText + " 		 7. " + li[6].innerText + '\n' + "4. " + li[3].innerText + " 		 8. " + li[7].innerText + '\n\n';
    r = 'CÓDIGOS DE RECUPERACIÓN\n(' + 'data[email]' + ')\nMantén estos códigos en un lugar muy seguro.\n\n' + f + '* Cada código de verificación solo se puede usar una vez.\n*  Nuestro equipo de soporte nunca te solicitara este dato ¡No lo compartas!.';
    a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    blob = new Blob([r], {
        type: "data:attachment/text"
    }),
        url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'recovery-codes.txt';
    a.click();
}

document.querySelectorAll('[maxlength]').forEach((e) => { e.addEventListener('input', function () { let code = this.value.toString(); if (code.length > e.getAttribute('maxlength')) { this.value = code.slice(0, e.getAttribute('maxlength')); } }); })


async function clipinit() {
    const e = document.querySelectorAll('[data-clipboard-target]');
    for (let i = 0; i < e.length; i++) {
        e[i].addEventListener("click", function () {
            const copy = document.querySelector(e[i].getAttribute('data-clipboard-target'))
            copy.classList.add('text-success');
            copyToClickBoard(copy.innerText);
            setTimeout(function () {
                copy.classList.remove('text-success');
            }, 1500)

        });
    }
}
clipinit()
function copyToClickBoard(e) {

    navigator.clipboard.writeText(e)
        .then(() => {
            toast_("El codigo se ha copiado al portapapeles.")
        })
        .catch(err => {
            console.log('Something went wrong', err);
        })

}

function sleep(ms) {
    const inicio = Date.now();
    let tiempoTranscurrido = 0;
    while (tiempoTranscurrido < ms) {
        tiempoTranscurrido = Date.now() - inicio;
    }
}

function toast_(text) {
    document.getElementById('_alert_message').textContent = text
    var f = document.getElementById('liveToast')
    var a = new bootstrap.Toast(f);
    a.show();
}