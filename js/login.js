// lb(false, '_validate_user_submit');
// console.log((typeof grecaptcha))



const AUTH_URL = 'https://accounts.trelk.xyz';
var searchParams = new URLSearchParams(window.location.search);

searchParams.get = function (key) {
    // get url parameters
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has(key) ? urlParams.get(key) : null;
}

const hint = searchParams.get("login_hint")
var redi = searchParams.get("redirect") != null && searchParams.get("redirect") != '' ? searchParams.get("redirect") : '/dashboard';
var sub = searchParams.get("sub") != null && searchParams.get("sub") != '' ? searchParams.get("sub") + '.' : '';
// var intervalIds = [];
// var groups = {}
// intervalIds.push = function (id, groups){
//     if(groups){
//         if(groups[id]){
//             intervalIds.push(groups[id]);

//             clearInterval(groups[id]);
//         }
//     } else {
//         return Array.prototype.push.call(this, id);
//     }

// }
var intervalIds = [];
var groups = {};

intervalIds.push = function (id, groupName) {
    if (groupName) {
        // Si el grupo ya tiene un intervalo, eliminarlo
        if (groups[groupName]) {
            clearInterval(groups[groupName]);
        }

        // Guardar el nuevo intervalo en el grupo
        groups[groupName] = id;

        // Agregar el nuevo intervalo al array de intervalos
        return Array.prototype.push.call(this, id);
    } else {
        // Si no hay grupo, simplemente agregar el intervalo
        return Array.prototype.push.call(this, id);
    }
};

function clearAllIntervals() {
    // Limpiar todos los intervalos y vaciar el array
    intervalIds.forEach(function (intervalId) {
        clearInterval(intervalId);
    });
    intervalIds = [];
    groups = {}; // Limpiar también los grupos
}

function clearIntervalFromGroup(groupName) {
    if (groups[groupName]) {
        // Limpiar el intervalo del grupo y eliminar la referencia del grupo
        clearInterval(groups[groupName]);
        delete groups[groupName];
    }
}

var textinit = $("#_action_tittle").text();
var use_recovery = $("#_use_code_recovery").text();
if (hint) {
    $("#_validate_user").val(hint);
    $("#_validate_user_submit").click();
}
$("#_oauth_question_btn").click(function () {

    hd('_children_emauser_section', false)
    hd('_oauth_question', true)

})
var csrf = document.querySelector("meta[name='csrf-token']").getAttribute("content");
//  console.log(ist('grecaptcha.getResponse()'));


class trelkLogin {
    constructor() {
        this._init();

    }

    _init() {

    }
}






function _more_methods_init() {

    atype = $('input[name="methods_signin"]:checked').val();
    xhr('https://accounts.site.com/api/auth/helpers/sigin/' + atype, false, false)
    hd('_password_section', false)
    hd('_more_methods_login_section')
    hd('hellouser', 0)
    $("#_password_value").val('');
    $("#_password_value").attr('data-use-password', atype);
    console.log(atype)
}
// alerty()
function _more_methods_login_section() {
    atype = $('input[name="methods_signin"]:checked').val();
    hd('_password_section', true).slideUp(100)
    hd('_more_methods_login_section', false).slideDown(100)
    hd('hellouser', true)
    $("#_password_value").attr('data-use-password', atype);
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};


function useCodeRecovery(l) {

    if ($("#_2fa_code").attr('data') == 'code_recovery') {
        $("#_2fa_code").attr('data', 'code_normal');
        $("#_2fa_section").slideUp(150);
        $("#_2fa_section").slideDown(150);

        $("#2fa_code_label").text('Ingresa el codigo de autenticaciÃ³n');
        $("#_use_code_recovery").text('Usar codigo de recuperacÃ­on');

    } else {
        $("#_2fa_section").slideUp(150);
        $("#_2fa_section").slideDown(150);
        $("#_2fa_code").attr('data', 'code_recovery');
        $("#2fa_code_label").text('Ingresa el codigo de recuperaciÃ³n');
        $("#_use_code_recovery").text('Ya tengo el codigo');

    }

}

function turnstileRender(id, callback) {
    turnstile.ready(function () {
        console.log('ready')
        turnstile.render('#' + id, {
            sitekey: '0x4AAAAAAAReYvRmUyocoGP8',
            // size: esDispositivoMovil() ? 'normal' : 'compact',
            // appearance: 'interaction-only',
            callback: callback,
            'error-callback': function () {

            }
        });
    });
}
$('#_validate_user').focus()

function login(eventType, viaMethod, is2FAEnabled, isOAuth = false) {
    // Captura el valor del captcha
    const captchaValue = $('#captcha').val();

    // Captura los datos del usuario
    const userInputData = $("#_validate_user");

    // Determina el paso si la contraseña está presente
    let currentStep = $("#_password_value").val() !== '' ? 2 : '';

    if (userInputData.val() !== '' || viaMethod) {
        let step;
        if (eventType === 1) {
            step = 1;
        } else if (eventType === 2) {
            step = 2;
        } else if (is2FAEnabled) {
            step = 3;
        }

        // Mostrar loader (lb es una función que asumo muestra el loader)
        lb(true);

        let requestData;

        // Caso para login por email o autenticación normal
        if (!viaMethod) {
            requestData = buildEmailLoginData(captchaValue, userInputData, eventType, is2FAEnabled, step);
        }
        // Caso para login vía OAuth (por ejemplo, Google)
        else {
            requestData = buildOAuthLoginData(viaMethod);
        }

        // Combina los datos base
        let data = { ...requestData };

        // Añadir datos de 2FA si está habilitado
        if (is2FAEnabled) {
            const twoFactorData = build2FAData();
            data = { ...data, ...twoFactorData };
        }

        // Añadir el modo de autenticación si estamos en el paso 2
        if (step === 2) {
            const passwordData = buildPasswordModeData();
            data = { ...data, ...passwordData };
        }

        // Función antes de enviar la solicitud para validar 2FA
        const beforeRequest = function (xhr) {
            validate2FA(xhr, is2FAEnabled);
        };

        // Enviar la solicitud AJAX
        $.ajax({
            url: `${AUTH_URL}/users/login`,
            type: "POST",
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            xhrFields: {
                withCredentials: true
            },
            beforeSend: beforeRequest,
            success: function (response) {
                handleLoginSuccess(response, step, isOAuth);
            },
            error: function (errorResponse) {
                handleLoginError(errorResponse, step);
            }
        });
    } else {
        invalidInput('_validate_user');
        lb(false);
    }
}

// Construir datos para login por email o autenticación normal
function buildEmailLoginData(captchaValue, userInputData, eventType, is2FAEnabled, step) {
    const urlParams = new URLSearchParams(window.location.search);

    return {
        captcha: captchaValue,
        csrf: csrf,
        userdata: userInputData?.val()?.trim(),
        password: eventType === 2 || is2FAEnabled ? ($("#_password_value").val()) : '',
        login_type: window.login_type || 'password',
        step: step,
        via: 'email',
        unlock: $("#_unlock").val() === 'true',
        vincule_account: urlParams.get('vincule_account') && !urlParams.get('vinculation_token') ? true : urlParams.get('vinculation_token') ? true : false,
        account_token: urlParams.get('account_token') || false,
        vinculation_token: urlParams.get('vinculation_token') || false
    };
}

// Construir datos para login vía OAuth (ej. Google)
function buildOAuthLoginData(viaMethod) {
    return {
        via: 'google',
        y: viaMethod
    };
}

// Construir datos para 2FA
function build2FAData() {
    return {
        _2fa: $("#_2fa_code").val(),
        _2fa_type: $("#_2fa_code").attr('data')
    };
}

// Construir datos para el modo de contraseña en el paso 2
function buildPasswordModeData() {
    const passwordMode = $("#_password_value").attr('data-use-password');

    return {
        mode: passwordMode
    };
}

// Validar el código de 2FA antes de enviar la solicitud
function validate2FA(xhr, is2FAEnabled) {
    if (is2FAEnabled && $("#_2fa_code").val().length !== 6 && $("#_2fa_code").attr('data') !== 'code_recovery') {
        invalidInput('_2fa_code', 'error_password_incorrect', 6);
        xhr.abort();
        lb(false);
    }
}

// Manejar el éxito del login
function handleLoginSuccess(response, step, isOAuth) {
    lb(false);

    if (step === 1) {
        if (response.error) {
            handleLoginErrorResponse(response);
            return;
        }

        updateLoginUI(response);
    } else if (step === 2) {
        if (response.error) {
            invalidInput('_password_value', response.error, true);
            return;
        }

        handleSuccessfulLogin(response);
    }

    // Manejo para 2FA
    if (response['2fa'] && step === 2) {
        $("#_password_section").slideUp(100);
        $("#_2fa_section").removeAttr('class').slideDown(100);
        $("#_action_tittle").text('Autenticación de dos factores');
    }

    handleOAuthLogin(isOAuth, step, response);
}

// Manejar errores en el login
function handleLoginError(errorResponse, step) {
    lb(false);

    if (errorResponse.status === 429) {

        if (errorResponse.responseJSON.blocked_account) {

            // $("#_validate_user").val('');
            $('#_action_tittle').text('Your account has been blocked');
            $('#_welcome_message').text('Your account has been blocked. Please check your email for more information.');
            hd('_password_section', true);
            hd('_emauser_section', true);
            hd('_2fa_section', true);
            hd('_password_section', true);
            hd('_validate_user_submit', true);
            hd('_validate_password_submit', true);
            hd('_2fa_code_submit', true);
            hd('_validate_user', true);
            hd('_validate_password', true);
            hd('_2fa_code', true);
            hd('hellouserl', true);

        }
        renderCaptchaIfNeeded(errorResponse);
    }

    if (step === 2) {
        invalidInput('_password_value', "Password incorrect, please try again.");
    } else if (step === 1) {
        invalidInput('_validate_user', 'error_emauser_404');
    }
}

// Manejar la autenticación OAuth
function handleOAuthLogin(isOAuth, step, response) {
    const isAuthenticated = (isOAuth && step === 2 && !response['2fa'] && response['ok']) ||
        (isOAuth && response['2fa_valid'] && step === 3 && response['ok']);

    if (isAuthenticated) {
        console.log('authenticating');
        // Aquí puedes recargar la página o redirigir al usuario
    }
}
function handleSuccessfulLogin(response) {
    if (response.ok_for_vinculation) {
        const vinculationMessage = `
            <div class="card-header border-0 bg-primary py-4 d-flex justify-content-center position-sticky sticky-top z-1 mb-5">
                <div class="symbol-group symbol-hover">
                    <div class="symbol symbol-circle symbol-50px" style="border-color: transparent;">
                        <img style="background-color: #131212; padding: 15px; width: 60px; height: 60px;" src="assets/img/logo/favicon.png" alt="">
                    </div>
                    <div class="symbol symbol-circle symbol-50px" style="border-color: white;">
                        <img style="background-color: #fff; padding: 15px; width: 60px; height: 60px;" src="https://media.istockphoto.com/id/496603666/fr/vectoriel/ic%C3%B4ne-de-d%C3%A9part-%C3%A0.jpg?s=612x612&amp;w=0&amp;k=20&amp;c=-HsVLVbOyVSE1LzvgGt_6AlPewdXNKbDUQc69Ncqr1M=" alt="">
                    </div>
                    <div class="symbol symbol-circle symbol-50px bg-white" style="border-color: transparent;">
                        <img style="background-color: #070707; padding: 15px; width: 60px; height: 60px;" src="assets/img/svg-icon/${response.vincule_account_type}.svg" alt="">
                    </div>
                </div>
            </div>
            <h1 id="" class="text-dark mb-3">Vinculación exitosa</h1>!Súper! Ahora podrás iniciar sesión con tu cuenta de ${response.vincule_account_type} (${response.account}) en Trelk.<br><br>Serás redirigido al dash en <span id="couldomw_time">5</span> segundos<br><br><button class="btn btn-primary" onclick="window.location.href = '/login'">Ir al dashboard</button>
        `;

        $("#_welcome_message").html(vinculationMessage);

        let countdown = 5;
        const countdownInterval = setInterval(() => {
            countdown--;
            document.getElementById('couldomw_time').innerText = countdown;
            if (countdown === 0) {
                clearInterval(countdownInterval);
                // Redirige al dashboard cuando finalice el conteo
                // window.location.href = '/login';
            }
        }, 1000);

        // Ocultar las secciones irrelevantes
        hd('_emauser_section', true);
        hd('_password_section', true);
        hd('_vinculation_data', true);

        // Actualizar la URL para eliminar los tokens de vinculación
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.delete('vinculation_token');
        const newUrl = 'https://trelk.xyz/login/' + '?' + queryParams.toString();
        window.history.replaceState({}, '', newUrl);
    }
}


// Manejar respuesta de error de login
function handleLoginErrorResponse(response) {
    if (response.error_type === 'invalid_vinculation_token') {
        document.getElementById('alert').classList.remove('d-none');
        document.getElementById('alert_message').innerText = 'El token de vinculación es inválido o ha expirado. Serás redirigido a la página de inicio de sesión en 10 segundos.';
        bled('_validate_user_submit');
        setTimeout(() => {
            window.location.href = 'https://accounts.trelk.xyz/login';
        }, 10000);
    }

    invalidInput('_validate_user', response.error, true);
}

// Actualizar la UI del login
function updateLoginUI(response) {

    let extraMessage = '';
    if (response.login_type == 'tlg') {
        extraMessage = `, ingresa el código de autenticación que te enviamos a tu cuenta de telegram. <a href="javascript:void(0)" onclick="$('#modal_info').modal('show')">¿Por qué esto?</a>`;
        window.login_type = 'tlg';
    }
    $("#_action_tittle").text('Iniciar sesión');
    hd("_emauser_section");
    $("#hellouserl").slideDown(50);
    hd("_password_section", false);
    $("#_welcome_message").html("¡" + login_welcome + "! " + response['name'] + extraMessage);
    $("#name").text(response['hello']);
    $("#avatar").attr("src", 'usercontent/' + response['avatar']);
    hd('hellouserl', false);
    hd("hellouser", false);
    hd("_validate_password_submit", false);
    bled("_validate_user");
    response['tl'] ? hd('_tl_option', 0) : hd('_tl_option');
    $("#_password_value").focus();
    response['captcha'] ? gcha() : '';

    if (isVinculation()) {
        document.getElementById('_vinculation_data').removeAttribute('hidden');
        document.getElementById('_account_trelk').innerHTML = response['hello'];
        processTokens(2);

        if (response.vincule_token) {
            updateURLWithVinculationToken(response.vincule_token);
        }
    }
}

// Manejar captcha si es necesario
function renderCaptchaIfNeeded(errorResponse) {
    if (errorResponse.responseJSON.render_captcha) {
        bled('_validate_password_submit');
        try {
            turnstile.ready(function () {
                // turnstile.remove('#captcha')

                // turnstile.render('#captcha', {
                //     sitekey: '0x4AAAAAAAReYvRmUyocoGP8',
                //     callback: function (token) {
                //         bled('_validate_password_submit', false);
                //         $("#captcha").val(token);
                //     }
                // });
            });
        } catch (e) { }
    }
}

// Actualizar la URL con el token de vinculación
function updateURLWithVinculationToken(vinculeToken) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('vinculation_token', vinculeToken);
    const newUrl = 'https://trelk.xyz/login/' + '?' + queryParams.toString();
    window.history.replaceState({}, '', newUrl);
}



var gcha = function () {
    try {
        turnstile.ready(function () {
            turnstile.render('#captcha', {
                sitekey: '0x4AAAAAAAReYvRmUyocoGP8',
                // size: esDispositivoMovil() ? 'normal' : 'compact',
                // appearance: 'interaction-only',
                callback: function (token) {
                    console.log(token);




                }


            });
        });



        // captchaContainer = grecaptcha.render('captcha', {
        //     'sitekey': '6Lcb1IsfAAAAADBhspHIPF4PNDdXuyo-s0_J8L8J',
        //     'data-expired-callback': function () {
        //         alert('hi')
        //     },
        //     'callback': function (response) {
        //         n = $("#_validate_user");
        //         if (n.val() == '') {
        //             n.focus();
        //         }
        //         bled('_validate_password_submit', false);
        //         $('#captcha').val(response)
        //     }

        // });

    } catch (x) {
    }
};
function actualizarContenido() {
    console.log('Inicio de la recarga del iframe');
    var iframe = document.getElementById('login_src');
    var currentSrc = iframe.src;

    iframe.remove();

    // Crear un nuevo elemento script
    var nuevoScript = document.createElement('script');

    // Establecer el atributo src del nuevo script
    nuevoScript.src = currentSrc;
    // Agregar el nuevo script al final del body
    document.body.appendChild(nuevoScript);
    console.log('Fin de la recarga del iframe');

}
// alert('hola')

// (function () {
//     var script = document.createElement("script");
//     script.text = `
//         var _pushState = history.pushState;
//         history.pushState = function (state, title, url) {
//             _pushState.call(this, state, title, url);
//             window.dispatchEvent(new CustomEvent("statechanged", { state }));
//         };
//     `;
//     document.head.appendChild(script);
//     script.parentNode.removeChild(script);
// })();

// remove the DOM script element

// And here content script listens to our DOM script custom events
// window.addEventListener("statechanged", function (e) {
//     if (location.pathname == '/password-reset') {
//         resetPassword('init');
//     } else if (location.pathname == '/login') {
//         login(1);
//         resetPassword('cancel');
//     }

//     console.log("History state changed", e.state, location.pathname);
// });

function resetPassword(type) {
    // lb(true);
    if (type == 'init') {
        // slideDowm
        $("#_reset_password").slideDown(100);
        hd('_reset_password', false);
        hd('_reset_password_section', false);
        $("#_reset_password_section").slideDown(100);
        hd("hellouserl", true)
        hd('_password_section', true);
        $("#_action_tittle").text('Reset your password');
        $("#_welcome_message").text('Please select method to reset your password');
        const newURL = "https://trelk.xyz/password-reset";
        const newTitle = "Reset your password";
        document.title = newTitle;

        hd('parentContent');
        hd('spinnerStatus', 0);
        $.ajax({
            url: `${AUTH_URL}/users/password_reset`,
            type: "POST",
            data: JSON.stringify({
                action: 'init',
                userdata: $("#_validate_user").val(),

                csrf: csrf
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            success: function (response) {
                console.log(response);
                hd('parentContent', 0);
                hd('spinnerStatus', 1);
                if (response.ok) {
                    if (response.resetPassword.resetPasswordOptions) {
                        const resetPasswordOptions = response.resetPassword.resetPasswordOptions;
                        Object.keys(resetPasswordOptions).forEach((option, i) => {
                            const cooldown = resetPasswordOptions[option];
                            handleDisabledTypeMethod(cooldown, option);
                        });
                    }

                    const optionsNotAvailable = response.resetPassword.optionsNotAvailable;
                    if (optionsNotAvailable) {
                        optionsNotAvailable.forEach(option => {

                            const optionHtml = document.querySelector(`label[for="_${option}_option"`);
                            if (optionHtml) {
                                optionHtml.classList.add('d-none');
                            }
                        });
                    }

                    const availableOptions = response.resetPassword.availableOptions;
                    if (availableOptions) {
                        availableOptions.forEach(option => {
                            const optionHtml = document.querySelector(`label[for="_${option}_option"`);
                            if (optionHtml) {
                                optionHtml.classList.remove('d-none');
                            }

                        });
                    }
                }
            }
        });

    } else if (type == 'email' || type == 'tlg') {
        $('#_reset_password_submit').val(type);
        bled('_reset_password_submit', false);
    } else if (type == 'submit' || type == 'code' || type == 'direct' || type == 'resend') {
        // lb(true, '_reset_password_submit');
        var data = {
            userdata: $("#_validate_user").val(),
            type: type == 'code' ? type : $("#_reset_password_submit").val() || false,
            code: $("#_reset_password_code_input").val() || false,
            captcha: $("#captcha_code").val() || false,
            action: type == 'resend' ? 'resend' : type,
            csrf: csrf
        };

        lb(1)
        $.ajax({
            url: `${AUTH_URL}/users/password_reset`,
            type: "POST",
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                lb(false);
                console.log(res);
                if (res['ok']) {
                    // $("#_reset_password").slideUp(100);
                    // $("#_reset_password_success").slideDown(100);


                    if (res.disabled_type) {
                        handleDisabledTypeMethod(res, res.disabled_type, true);
                        return;
                    }


                    if (data.type == 'email') {
                        hd('_reset_password', false);
                        hd('_reset_password_section', true);
                        hd('_reset_password_code', false);
                        hd(['_reset_password_code_label', '_reset_password_code_submit', '_reset_password_code_input'])
                        $("#_action_tittle").text("Correo enviado exitosamente");
                        $("#_welcome_message").text("Se ha enviado un enlace y un código tu correo electronico, por favor revisa tu bandeja de entrada o spam.");
                        // clearAllIntervals();
                        handlerCooldownsUI(res.cooldown, 'email');
                        handleDisabledTypeMethod(res, 'email', false);
                    } else if (data.type == 'tlg') {

                        // setInterval(() => {
                        //     fetch('//api.trelk.xyz/auth/telegram_code', {
                        //         method: 'POST',
                        //         headers: {
                        //             'Content-Type': 'application/json'
                        //         },
                        //         body: JSON.stringify({
                        //             userdata: $("#_validate_user").val(),
                        //             type: $("#_reset_password_submit").val(),
                        //             action: type,
                        //             csrf: csrf
                        //         })
                        //     }).then(response => response.json()).then(data => { });
                        // }, 1000);

                        hd('_reset_password', false);
                        hd('_reset_password_section', true);
                        hd('_reset_password_code', false);

                        if (res.cooldown && !res.error) {
                            $("#_action_tittle").text("Mensaje enviado exitosamente");
                            $("#_welcome_message").text("Se ha enviado un enlace y un código a tu cuenta de telegram. Revisa tu cuenta de telegram.");
                            handlerCooldownsUI(res.cooldown, 'tlg');
                            handleDisabledTypeMethod(res, 'tlg', false);
                        } else if (res.error) {
                            $('#_telegram_text').text(`Has intentado demasiadas veces por este medio`);
                            bled('kt_radio_buttons_2_option_2')
                        }

                    } else if (data.type == 'code') {
                        console.log('code')
                        hd('_reset_password_code', true);
                        hd('_reset_password_new', false);


                        $("#_action_tittle").text("Reset your password");
                        $("#_welcome_message").text("Please enter your new password");
                        $('#_reset_password_new_submit').attr('onclick', 'resetPassword("new")');
                        $('#_reset_token_password').val(res.token);
                    }

                    if (data.action == 'direct') {
                        $("#_welcome_message").text("Please select method to reset your password");
                        hd('_emauser_section', true);
                        hd('_reset_password', false);
                        hd('_reset_password_section', false);
                        console.log('direct')
                    } else if (data.action == 'resend') {
                        if (data.type == 'tlg') {
                            if (res.cooldown && !res.error) {
                                handlerCooldownsUI(res.cooldown, 'tlg');
                                handleDisabledTypeMethod(res, 'tlg', false);
                            }

                            // if (res.error) {
                            //     $("#_action_tittle").text("Demasiados intentos");
                            //     $("#_welcome_message").text(`Has intentado demasiadas veces, espera ${res.cooldown ? convertSeconds(res.cooldown) : 'unos minutos'} para volver a intentarlo.`);
                            //     if (res.cooldown) {
                            //         clearAllIntervals();
                            //         let seconds_left = res.cooldown
                            //         const int_id = setInterval(() => {
                            //             if (seconds_left == 0) {
                            //                 document.getElementById('_reset_password_resend_button').style.pointerEvents = 'auto';
                            //                 document.getElementById('_reset_password_resend_button').innerHTML = 'Reenviar código';
                            //             } else {
                            //                 // document.getElementById('_reset_password_resend_button').style.pointerEvents = 'none';
                            //                 document.getElementById('_reset_password_resend_coldown').innerHTML = ` en ${convertSeconds(seconds_left)}`;
                            //             }
                            //             seconds_left--;
                            //         }, 1000);
                            //         intervalIds.push(int_id);
                            //         if (seconds_left == 0) {
                            //             clearInterval(int_id)
                            //         }
                            //     }
                            //     invalidInput('_reset_password_code_input', res.error);
                            // } else {
                            //     $("#_action_tittle").text("Mensaje reenviado");
                            //     $("#_welcome_message").text("Se ha reenviado el código a tu cuenta de telegram. Revisa tu cuenta de telegram.");
                            //     // bled('_reset_password_resend_button', true);
                            // }

                        }
                    }
                } else {
                    if (data.type == 'code') {
                        invalidInput('_reset_password_code_input', 'El código es incorrecto', true);
                        if (res.render_captcha) {
                            turnstileRender('captcha_code', function (token) {
                                $("#captcha_code").val(token);

                            });
                        }
                    }



                    // $("#error").html(res['message']);
                }
            },
            error: function (fail) {
                lb(false);
                console.log(fail);
                // $("#error").html(fail.responseText)
            }
        });
    } else if (type == 'cancel') {
        hd('_reset_password', false);
        hd('_password_section', false);
        hd('_reset_password_code', true);
        hd('hellouserl', false);
        hd('_reset_password', true);
        $("#_action_tittle").text("Iniciar sesion");
        $("#_welcome_message").text("¡Bienvenido!");
        // clearAllIntervals();
    }
    else if (type == 'new') {
        console.log('new');
        const new_password = $("#_reset_password_new_input").val();
        const new_password_confirm = $("#_reset_password_new_input2").val();

        if (new_password.length < 6) {
            invalidInput('_reset_password_new_input', 'La contraseña debe tener al menos 6 caracteres', true);
            return;
        }

        // if (new_password_confirm.length < 6) {
        //     invalidInput('_reset_password_new_input2', 'La contraseña debe tener al menos 6 caracteres');
        //     return;
        // }

        if (new_password != new_password_confirm) {
            invalidInput('_reset_password_new_input');
            invalidInput('_reset_password_new_input2', 'Las contraseñas no coinciden', true);
            return;
        }


        lb(true, '_reset_password_new_submit');
        var data = {
            userdata: $("#_validate_user").val(),
            token: $('#_reset_token_password').val() || null,
            type: $("#_reset_password_submit").val(),
            action: type,
            csrf: csrf,
            new_password: new_password_confirm
        };
        $.ajax({
            url: `${AUTH_URL}/users/password_reset`,
            type: "POST",
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                lb(false);
                console.log(res);
                if (res['ok']) {

                    // clear query token
                    const queryParams = new URLSearchParams(window.location.search);
                    queryParams.delete('token');
                    const newUrl = 'https://trelk.xyz/login/' + '?' + queryParams.toString();
                    // window.history.replaceState({}, '', newUrl);
                    loadScript('confetti').then(() => {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                        });
                    });
                    hd('_reset_password_section', true);
                    hd('_reset_password_new', true);
                    $("#_action_tittle").text("Contraseña actualizada");
                    $("#_welcome_message").html("Tu contraseña ha sido actualizada exitosamente.<br><br><button class='btn btn-primary' type='button' onclick='login(1)'>Iniciar sesion</button>");
                } else {

                    if (res.error_type == 'invalid_token') {
                        hd('_reset_password_section', true);
                        hd('_reset_password_new', true);
                        $("#_action_tittle").text("Token inválido.");
                        $("#_welcome_message").html(`El token ha expirado o es invalido<br><br>Serás redirigido a la página de inicio en 5 segundos<br><br><button class="btn btn-primary" onclick="window.location.href = \'/\'">Ir a la página de inicio</button>`);
                    }

                }
            },
            error: function (fail) {
                lb(false);



                console.log(fail);
                $("#error").html(fail.responseText)
            }
        });
    }

}


function handlerCooldownsUI(seconds) {
    const resent_btn = document.getElementById('_reset_password_resend_button');
    const cooldown_text = document.getElementById('_reset_password_resend_coldown');

    clearIntervalFromGroup('ui');

    const int_id = setInterval(() => {
        if (seconds === 0) {
            resent_btn.style.pointerEvents = 'auto';
            resent_btn.querySelector('a').innerText = 'Reenviar código';
            cooldown_text.innerHTML = '';
            clearInterval(int_id);
            return;
        } else {
            resent_btn.style.pointerEvents = 'none';
            cooldown_text.innerHTML = ` en ${convertSeconds(seconds)}`;
            seconds--;
        }
    }, 1000);

    intervalIds.push(int_id, 'ui');
}

function handleDisabledTypeMethod(res, type, textChange = true) {
    const methodType = res.disabled_type || type;
    if (res.cooldown === 0) {
        clearIntervalFromGroup(methodType);
        const originalTexts = {
            'tlg': 'Se enviará un enlace de restablecimiento de contraseña a su cuenta de Telegram.',
            'email': 'Se enviará un enlace de restablecimiento de contraseña a su correo electrónico.'
        }
        const optionHtml = document.getElementById(`_${methodType}_option`);
        const label = document.querySelector(`label[for="_${methodType}_option"]`);
        if (optionHtml && label) {
            optionHtml.removeAttribute('disabled');
            optionHtml.style = ''
            label.style.removeProperty('--progress-percentage');
            label.style.removeProperty('background-image');
            label.style = ''
            document.getElementById(`_${methodType}_text`).innerHTML = originalTexts[methodType];
        }
        bled('_reset_password_cancel', false);
        return;
    }
    const typesStr = {
        'tlg': 'Telegram',
        'email': 'Email'
    }


    let seconds = res.cooldown;
    clearIntervalFromGroup(methodType);
    const _reset_password_section = document.getElementById('_reset_password_section');

    // if (textChange) {
    //     $('#_action_tittle').text('Demasiados intentos por este medio');
    //     $('#_welcome_message').html(`Has intentado demasiadas veces por ${typesStr[methodType]}, espera <span data-cooldowm="${methodType}">${convertSeconds(res.cooldown)}</span> para volver a intentarlo.`);
    // }

    $(`#_${methodType}_text`).html(`Espera <span data-cooldowm="${methodType}">${convertSeconds(res.cooldown)}</span> para volver a intentarlo por ${typesStr[methodType]}.`);

    bled(`_${methodType}_option`, true);

    const int_id = setInterval(() => {
        const cooldownText = document.querySelectorAll(`[data-cooldowm="${methodType}"]`);
        if (seconds === 0) {
            if (textChange) {
                $('#_action_tittle').text('Reset your password');
                $('#_welcome_message').text('Please select method to reset your password');
            }
            bled('_reset_password_submit', false);
            bled(`_${methodType}_option`, false);
            $(`#_${methodType}_text`).html(`Ya puedes volver a intentarlo por ${typesStr[methodType]}.`);
            clearInterval(int_id);
            return;
        }
        seconds--;
        const reset_cooldown = res.reset_cooldown; // Valor de reset_cooldown
        const last_attempt = res.start_cooldown;    // Valor de last_attempt
        const current_time = Math.floor(Date.now() / 1000); // Convierte milisegundos a segundos
        const diferencia_tiempo = reset_cooldown - last_attempt; // Tiempo total del cooldown
        const tiempo_transcurrido = current_time - last_attempt; // Tiempo que ha pasado
        const porcentaje = (tiempo_transcurrido / diferencia_tiempo) * 100;
        const progreso = Math.min(100, Math.max(0, porcentaje));
        UpdateBackgroundProgressUi(progreso.toFixed(2), `${methodType}`);

        cooldownText.forEach(el => { el.innerText = convertSeconds(seconds) })
    }, 1000);
    intervalIds.push(int_id, methodType);

    const availableMethods = _reset_password_section.querySelector('input:not([disabled])')

    if (availableMethods) {
        availableMethods.click();
    } else {
        _reset_password_section.querySelectorAll('input:checked').forEach(el => {
            el.checked = false;
        });
        _reset_password_section.querySelector('button').disabled = true;

        if (textChange) {

            $('#_action_tittle').text('Demasiados intentos');
            $('#_welcome_message').text('No hay métodos disponibles para restablecer la contraseña. Intenta más tarde.');
        }
    }
}

function UpdateBackgroundProgressUi(percentage, id) {
    const label = document.querySelector(`label[for="_${id}_option"]`);
    label.style.setProperty('--progress-percentage', percentage + '%');

    // Ajusta el gradiente según el porcentaje
    const backgroundGradient = `linear-gradient(to right, #212e48  ${percentage}%, transparent ${percentage}%)`;

    // Aplicar el fondo dinámicamente
    label.style.background = backgroundGradient; label.style.setProperty('background-color', 'unset', 'important');
}

function unlinkAccount() {
    lb(true);
    $.ajax({
        url: `${AUTH_URL}/users/unlink_account`,
        type: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            csrf: csrf,
            vinculation_token: searchParams.get('vinculation_token')

        }),
        success: function (res) {
            lb(false);
            console.log(res);
            if (res['ok']) {
                // window.location.href = 'https://trelk.xyz/login';
                // window.location.reload();
                document.getElementById('_action_tittle').innerHTML = 'Iniciar sesión';
                document.getElementById('_welcome_message').innerHTML = '¿Nuevo en Trelk? <a href="/signup">Regístrate</a>';



                // window.location.reload();
            } else {
                // $("#error").html(res['message']);
            }
        },
        error: function (fail) {
            lb(false);
            console.log(fail);
            $("#error").html(fail.responseText)
        }
    });
}

function setLoginSuccess(res) {
    // setCookie('auth_token', auth_token, 1);
    let url = new URL(window.location);
    let params = new URLSearchParams(url.search);
    try {
        turnstile.remove('#captcha');
    } catch (error) {

    }

    console.log(res)
    // if (res.approve) {

    //     // $("#_action_tittle").text('Aprueba el inicio de sesión');
    //     // $("#_welcome_message").text('Tu cuenta tiene activada la aprobación de sesiones, por lo que se requiere este paso adicional para iniciar sesión.');
    //     // hd("_password_section", true);


    //     setInterval(() => {
    //         $.ajax({
    //             url: `${AUTH_URL}/session`,
    //             type: "POST",
    //             data: data,
    //             xhrFields: {
    //                 withCredentials: true
    //             }
    //         })
    //     }, 5000)

    //     return
    // }

    const login_type = params.get("login_type");
    switch (login_type) {
        case 'readme': {
            const url = new URL(window.location);
            url.searchParams.set('auth_token', res.auth_token);
            window.opener.location = url.searchParams.get('redirect') + `?auth_token=` + res.auth_token;
            window.close();
        }
            break;

        default:

            if (params.get("continue")) {
                window.location.href = params.get("continue");

            } else {
                window.location.reload();
            }



            break;
    }

}

async function oauthController(response, service) {

    if (response.credential) {
        service = 'google'
    }

    fetch(`https://auth.trelk.xyz/oauth/${service}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + response.credential
        },
        credentials: 'include',
        body: JSON.stringify({
            token: btoa(response.credential),
            type: 'web'
        })
    }).then(res => res.json())
        .then(data => {
            if (data.signup_token) {
                // window.location.href = `https://trelk.xyz/signup?signup_token=${data.signup_token}`;
            }

            if (data.ok) {

                setLoginSuccess(data);
            }
            // setLoginSuccess(data.auth_token);
            // if (data.status == 200) {
            //     window.location.href = data.url;
            // }
        })
}
function loginWithServices(s) {

    if (typeof s != 'object') {
        e = document.querySelectorAll('[name-service=' + s + ']')[0].getAttribute('service');
        console.log(s, e);

    } else {
        e = s.getAttribute('service');
        console.log(s);
    }
    // Abrir el popup
    var width = 600; var height = screen.height - 50; var left = (screen.width - width) / 2;

    hd('parentContent');
    hd('spinnerStatus', 0);
    var popup__ = window.open(e, 'popup', 'width=' + width + ',height=' + height + ',left=' + left + ',top=0');

    // Listener para recibir mensajes SOLO del popup que se abrió
    function handleMessage(event) {
        if (event.source === popup__) {
            hd('parentContent', 0);
            hd('spinnerStatus', 1);
            if (event.data.ok === false) {
                if (event.data.signup_token) {
                    window.location.href = `https://trelk.xyz/signup?signup_token=${event.data.signup_token}`;
                }


                alertShow(event.data.error, 'danger');
            } else {

                console.log('Mensaje correcto recibido:', event.data);
            }

            // Puedes remover el listener si solo esperas un mensaje:
            window.removeEventListener('message', handleMessage);
        } else {
            console.warn('Mensaje recibido de una fuente desconocida:', event.source);
        }
    }

    // Añadir el listener
    window.addEventListener('message', handleMessage, false);

    // Listener para detectar el cierre del popup


    popup__.addEventListener('unload', function () {
        console.log('La ventana emergente se ha cerrado.');

        // hd('parentContent', 0);
        // hd('spinnerStatus', 1);
    });

    // return false;" onscroll="alert('hola')"  class="Button Button_sm APIAuth-button2J-DE8WTO2n5 Button_full-width Button_primary">
    //     <span>Iniciar sesión</span><i class="icon-arrow-up-right"></i></a>
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; domain=.trelk.xyz";
}

function urlParams() {
    var url = new URL(window.location.href);
    var params = new URLSearchParams(url.search);
    return params;
}



// document.addEventListener('DOMContentLoaded', function () {

// });

function statusSpinner(hidden = false) {
    hidden ? hd('spinnerStatus', 0) : hd('spinnerStatus', 1);
    hidden ? hd('parentContent', 1) : hd('parentContent', 0);
}

function bled(x, y = true) {

    const element = document.getElementById(x);
    element.style.pointerEvents = y ? 'none' : 'auto';
    y ? $("#" + x).attr("disabled", true) : $("#" + x).removeAttr('disabled');
}

function forgotPassword() {
    // window.location.href = "password-reset?email=" + btoa($("#email").val());
}

function lb(x = true, y = false) {
    x && !y ? $("#_loading_bar").removeAttr("hidden") : $("#_loading_bar").attr("hidden", true)
    y ? $("#" + y).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
        : false
}

function hd(x, y = true) {
    // y ? $("#" + x).attr("hidden", true) : $("#" + x).removeAttr("hidden")
    // is object []
    if (typeof x == 'object') {
        x.forEach(e => {
            y ? $("#" + e).slideUp(200).attr("hidden", true).addClass('d-none') : $("#" + e).removeAttr("hidden").removeClass('d-none').slideDown("slow")
        });
    }

    return y ? $("#" + x).slideUp(200).attr("hidden", true).addClass('d-none') : $("#" + x).removeAttr("hidden").removeClass('d-none').slideDown("slow")

}

function val(id, v) {
    return $("#" + id).val(v);
}





function loadMoreServices(e = true) {

    if (e) {
        hd('_emauser_section');
        hd('_more_method_sigin', false);
        $("#_action_tittle").text('Login with');
        document.querySelectorAll('[name-service]').forEach(e => {
            // get svg node 
            let service = e.getAttribute('name-service');
            let svg = e.querySelector('svg');
            const element_svg = document.getElementById(`${service}_svg`)
            if (element_svg) {
                element_svg.classList.add('me-3')
                element_svg.innerHTML = svg.outerHTML;
            }

            console.log(svg)
        })

    }
    else {
        hd('_more_method_sigin')
        $("#_action_tittle").text('Iniciar sesion');
        hd('_emauser_section', false)

    }

}
insertParam('hhuu', 'hh');
function insertParam(key, value) {
    key = encodeURIComponent(key); value = encodeURIComponent(value);
    var kvp = document.location.search.substr(1).split('&'); let i = 0; for (; i < kvp.length; i++) {
        if (kvp[i].startsWith(key + '=')) { let pair = kvp[i].split('='); pair[1] = value; kvp[i] = pair.join('='); break; }
    } if (i >= kvp.length) { kvp[kvp.length] = [key, value].join('='); }
    let params = kvp.join('&');
}


function changeUser(e) {

    // $("#")
    console.log(processTokens);

    clearInput('_password_value');
    $('#_password_value').val('');
    $("#_password_section").slideUp('slow');
    $("#hellouserl").slideUp('slow');
    $("#_action_tittle").text(textinit);

    $("#_2fa_section").slideUp(100);
    hd('_reset_password_section', true);

    hd("_password_section")
    hd("_emauser_section", false)
    document.title = 'Iniciar sesión en Trelk';
    // hd("hellouser")
    // clearInput("_validate_user", false, true);
    hd("_validate_user_submit", false);
    bled("_validate_user", false);
    $("#_validate_user").focus();
    !processTokens() ? q("_welcome_message").html('<div id="_welcome_message" class="text-gray-700 fw-bold fs-4">' + login_new_here + ' <a href="../../dasboard/disty/authentication/layouts/aside/sign-up.html" class="link-primary fw-bolder">Create an Account</a></div>') : '';

}
function invalidInput(i, y = false, event = false) {
    let g = $("#" + i);

    // text ?  $("#" + x + '_invalid').text(text) : '';
    $("#" + i).addClass('is-invalid').css("border-color", "#dc3545");
    $("#" + i + "-label").css("color", "#dc3545");
    if (y) {
        $("#" + i + "_invalid").text(y);
    }
    if (event) {
        g.bind("keyup keydown change click", function () {
            if (!g.val().length) {
                g.attr("style", "border:1px solid rgb(220 53 67);").addClass('is-invalid')
            } else {
                g.removeAttr('style').removeClass('is-invalid')

            }
        });
    }
}




// function clearAllIntervals() {
//     intervalIds.forEach(function (intervalId) {
//         clearInterval(intervalId);
//     }); intervalIds = [];
// }


// function convertSeconds(seconds, returning = 'h:m:s') {
//     // Calculate minutes and remaining seconds
//     var minutes = Math.floor(seconds / 60);
//     var remainingSeconds = seconds % 60;

//     // Build the result string
//     var result = '';
//     if (minutes > 0) {
//         result += minutes + ' minute';
//         if (minutes !== 1) {
//             result += 's'; // Add 's' if there's more than one minute
//         }
//     }
//     if (remainingSeconds > 0) {
//         if (result !== '') {
//             result += ' and '; // Add 'and' if there are both minutes and seconds
//         }
//         result += remainingSeconds + ' second';
//         if (remainingSeconds !== 1) {
//             result += 's'; // Add 's' if there's more than one second
//         }
//     }


//     const results = {
//         toString: function () {
//             return result;
//         },
//         percentage: function () { Math.floor((remainingSeconds * 100) / 60) }

//     };

//     return results;
// }

function convertSeconds(seconds) {
    // Calculate hours, minutes, and remaining seconds
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;

    // Format each unit to always show two digits (e.g., "02", "09")
    var formattedHours = hours > 0 ? String(hours).padStart(2, '0') + ':' : '';
    var formattedMinutes = String(minutes).padStart(2, '0');
    var formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Build the result string in "HH:MM:SS" or "MM:SS" format
    var result = formattedHours + formattedMinutes + ':' + formattedSeconds;

    // Return the result as a string
    return result;
}


function clearInput(x, y = false) {

    $("#" + x).removeAttr("style").removeClass('is-invalid').val('');

    $("#" + x + "-label").removeAttr("style");
}

function json_decode(e) {

    return JSON.parse(e);

}


function ist(e) {
    return window[e] !== undefined;

    //   return  typeof $("#"+e) == 'undefined' ? false : true
}


function q(q) {
    return $("#" + q);
}



function alertShow(message, type = 'success') {
    let alert = document.getElementById('alert');
    alert.innerHTML = message;
    alert.classList.add('alert-' + type);
    alert.classList.remove('d-none');
    // setTimeout(() => {
    //     alert.classList.add('none');
    // }, 5000);
}

var delete_cookie = function (name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};


// function setCookie(cName, cValue, expDays) {
//     let date = new Date();
//     date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
//     const expires = "expires=" + date.toUTCString();
//     document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
// }



function m(d) { var r = M(V(Y(X(d), 8 * d.length))); return r.toLowerCase() }; function M(d) { for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++)_ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _); return f } function X(d) { for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++)_[m] = 0; for (m = 0; m < 8 * d.length; m += 8)_[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32; return _ } function V(d) { for (var _ = "", m = 0; m < 32 * d.length; m += 8)_ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255); return _ } function Y(d, _) { d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _; for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) { var h = m, t = f, g = r, e = i; f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e) } return Array(m, f, r, i) } function md5_cmn(d, _, m, f, r, i) { return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m) } function md5_ff(d, _, m, f, r, i, n) { return md5_cmn(_ & m | ~_ & f, d, _, r, i, n) } function md5_gg(d, _, m, f, r, i, n) { return md5_cmn(_ & f | m & ~f, d, _, r, i, n) } function md5_hh(d, _, m, f, r, i, n) { return md5_cmn(_ ^ m ^ f, d, _, r, i, n) } function md5_ii(d, _, m, f, r, i, n) { return md5_cmn(m ^ (_ | ~f), d, _, r, i, n) } function safe_add(d, _) { var m = (65535 & d) + (65535 & _); return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m } function bit_rol(d, _) { return d << _ | d >>> 32 - _ }

// var value = 'test';

// var result = m(value);

// document.body.innerHTML = 'hash -  normal words: ' + result;


// 
function theme_(theme) {
    // var e = document.body;
    // e.classList.toggle("dark"),
    //  localStorage.setItem("theme", e.classList.contains("dark") ? "dark" : "light")
    if (theme == 'dark') {
        // hd('_logo_dark', false);
        // hd('_logo', true);
    } else {
        // hd('_logo_dark', false);
        // hd('_logo', true);
    }

}
// $("#_validate_user_submit").click( function(){
// var url = "http://localhost/catcha/get_captcha.php?";

// var xhr = new XMLHttpRequest();
// xhr.open("POST", url);

// xhr.onreadystatechange = function () {
//    if (xhr.readyState === 4) {
//       console.log(xhr.status);
//       console.log(xhr.responseText);
//    }};

// xhr.send();

// });

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};
var searchParams = new URLSearchParams(window.location.search);
var url = new URL(window.location.href);
function processTokens(step) {
    const vincule_account = searchParams.get('vincule_account');
    const token = searchParams.get('account_token') || searchParams.get('token');
    console.log(123, vincule_account, token);
    if (vincule_account && token) {
        // hd('parentContent')
        // hd('parentContent');
        // hd('spinnerStatus', true)

        // validate token
        fetch(`https://auth.trelk.xyz/users/validate_vinculation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token
            })
        }).then(response => response.json()).then(data => {
            console.log(data);
            if (data.ok) {
                hd('parentContent', false)
                hd('spinnerStatus', 1)
                hd('other_options')
                const { email, name, picture, type } = data.tokenData;
                const typeCapitalize = type.charAt(0).toUpperCase() + type.slice(1);
                if (step == 2) {
                    document.getElementById('_action_tittle').innerHTML = "Vincular cuenta"
                    document.getElementById('_welcome_message').innerHTML = `Estas a punto de vincular tu cuenta con <span style="text-transform: capitalize">${type}</span>`;
                    document.getElementById('hellouserl').setAttribute('hidden', true)

                } else {
                    document.getElementById('_action_tittle').innerHTML = "Vincular cuenta";
                    document.getElementById('_welcome_message').innerHTML = `Para vincular tu cuenta con ${typeCapitalize} (${email}) primero deberás iniciar sesión<span class="text-start mb-5">
                                        <a onclick="unlinkAccount()" class="fs-6 fw-bolder">Cancelar</a>
                                    </span>`;

                }
                document.getElementById('_account_service').innerHTML = type;
                document.getElementById('_account_service_email').innerHTML = email;
            } else {
                hd('parentContent', false)
                hd('spinnerStatus', 1)
                const errmessage = 'Your vinculation token is invalid or has expired';
                alertShow(errmessage, 'danger');

                // clear query params
                // url.searchParams.delete('vincule_account');
                // url.searchParams.delete('account_token');
                // window.history.replaceState({}, document.title, url);
            }



        })



        // hd('spinnerStatus', 0)
        return;
        // const payload = parseJwt(token);
        // console.log(payload);
        // const { email, name, picture, type } = payload;
        // const typeCapitalize = type.charAt(0).toUpperCase() + type.slice(1);


        // if (step == 2) {
        //     document.getElementById('_action_tittle').innerHTML = "Vincular cuenta"
        //     document.getElementById('_welcome_message').innerHTML = `Estas a punto de vincular tu cuenta con <span style="text-transform: capitalize">${type}</span>`;
        //     document.getElementById('hellouserl').setAttribute('hidden', true)

        // } else {
        //     document.getElementById('_action_tittle').innerHTML = "Vincular cuenta";
        //     document.getElementById('_welcome_message').innerHTML = `Para vincular tu cuenta con ${typeCapitalize} (${email}) primero deberás iniciar sesión`;

        // }
        document.getElementById('_account_service').innerHTML = type;
        document.getElementById('_account_service_email').innerHTML = email;
        // alert("Para vincular tu cuenta con " + email + "");
        return true;
    } else if (token) {
        var hash = window.location.hash.substring(1);
        const location_hash = urlParams().get('location_hash');
        switch (location_hash) {
            case 'reset-password': {
                if (!token) {
                    $("#_action_tittle").text('Reset your password');
                    $("#_welcome_message").text('Escribe tu correo electronico o tu nombre de usuario');
                    $("#_validate_user_submit").attr('onclick', 'resetPassword("direct")');
                    // hd('_emauser_section', true);
                    // hd('_reset_password', false);
                    // hd('_reset_password_section', false);

                } else {
                    $("#_action_tittle").text('Reset your password');
                    $("#_welcome_message").text('Please select method to reset your password');
                    hd('_emauser_section', true);
                    hd('_reset_password', false);
                    hd('_reset_password_section', false);
                }


            }
        }
        // console.log(location_hash); // Esto imprimirá "reset-password" en la consola
        // console.log(token)
        if (token) {

            // if (token.length < 30) {
            //     console.log('token invalido')
            //     return;
            // }

            statusSpinner(1);
            fetch('//accounts.trelk.xyz/users/validate_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token
                })
            }).then(response => response.json()).then(data => {
                if (data.ok) {

                    const { type } = data.tokenData;

                    if (type == 'reset_password') {
                        document.title = 'Reset your password';
                        hd('_reset_password', false);
                        hd('_reset_password_section', true);
                        hd('_emauser_section', true);
                        hd('_reset_password_new', false);
                        hd("hellouserl", true)
                        hd('_password_section', true);
                        $("#_action_tittle").text('Reset your password');
                        $("#_welcome_message").text('Please enter your new password');
                        $('#_reset_password_new_submit').attr('onclick', 'resetPassword("new")');
                        $('#_reset_token_password').val(data.tokenData.token);
                        $('#_validate_user').val(data.tokenData.login);
                        // $('#_invalid_token').removeClass('none')
                        // const urlLimpia = window.location.origin + window.location.pathname;
                        // window.history.replaceState({}, document.title, urlLimpia);
                    } else if (type == 'unlock_account') {
                        document.title = 'Unlock your account';
                        hd('_reset_password', false);
                        hd('_reset_password_section', true);
                        hd('_emauser_section', true);
                        hd('_reset_password_new', false);
                        hd("hellouserl", true)
                        hd('_password_section', true);
                        $("#_action_tittle").text('Unlock your account');
                        $("#_welcome_message").text('You are about to unlock your account. Please enter your new password');
                        $('#_reset_password_new_submit').attr('onclick', 'resetPassword("new")');
                        $('#_reset_token_password').val(data.tokenData.unlocked_token);
                        $('#_validate_user').val(data.tokenData.login);
                        // $('#_invalid_token').removeClass('none')
                        // const urlLimpia = window.location.origin + window.location.pathname;
                        // window.history.replaceState({}, document.title, urlLimpia);
                    }



                } else {
                    $("#_action_tittle").text('Token invalido');

                    let time = 5;
                    // setTimeout(() => {
                    //     // window.location.href = '/login';
                    // }, 5000);
                    $("#_welcome_message").html(`El token ha expirado o es invalido<br><br>Serás redirigido a la página de inicio en 5 segundos<br><br><button class="btn btn-primary" onclick="window.location.href = \'/\'">Ir a la página de inicio</button>`);
                    setInterval(async () => {
                        time--;
                        if (time === 0) {
                            // window.location.href = '//trelk.xyz/login';
                        }
                        $("#_welcome_message").html(`El token ha expirado o es invalido<br><br>Serás redirigido a la página de inicio en ${time} segundos<br><br><button class="btn btn-primary" onclick="window.location.href = \'/\'">Ir a la página de inicio</button>`);

                    }, 1000);
                    hd('_emauser_section', true);
                    // document.getElementById('_invalid_token').classList.remove('none');
                }

                statusSpinner(0);
            })
        }
    } else {
        statusSpinner(0);
    }
    return false;


};

processTokens()

function isVinculation() {
    const vincule_account = searchParams.get('vincule_account');
    const token = searchParams.get('account_token');
    if (vincule_account && token) {
        return true;
    }
    return false;
}

async function loadScript(url) {

    const scriptsList = {
        'confetti': 'https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.0.3/tsparticles.confetti.bundle.min.js',
    }

    if (scriptsList[url]) {
        url = scriptsList[url];
    }

    return new Promise((resolve, reject) => {
        // Verifica si el script ya está en el documento
        if (document.querySelector(`script[src="${url}"]`)) {
            resolve();
            return;
        }

        var script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = () => {
            resolve();
        };
        script.onerror = () => {
            reject();
        };
        document.head.appendChild(script);
    });
}
