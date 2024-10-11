var ACCOUNTS_API_URL = `https://api.trelk.xyz`

// const ACCOUNTS_API_URL = `http://localhost:8080/_accounts`

function api(url, opts = {}) {
    const fetchRes = fetch(url, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        // redirect: 'error',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Tb-Ray': localStorage.getItem('cf-ray') || '',
            // 'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document?.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        ...opts
    });
    // fetchRes.catch((error) => {
    //     console.log('Error:', error.redirect);
    // });
    return fetchRes;

}


String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


async function ProcessingAction(form_) {

    return new Promise(async (resolve, reject) => {

        var form = form_ instanceof HTMLElement ? form_ : document.getElementById(typeof form_ == 'object' ? form_.id : form_);
        if (!form) { console.log('no compatible', form_); return };


        Object.keys(form.attributes).forEach((attr) => {
            // if (attName.startsWith('data-tb-')) {
            // console.log(attr)
            // form.setAttribute(attName, attValue);
            // }
        });

        const domain = form.getAttribute('data-tb-subdomain');
        ACCOUNTS_API_URL = domain ? `https://${domain}.trelk.xyz` : ACCOUNTS_API_URL;

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
                if (e.required && !e.value) {
                    invalidInput(e.id, e.getAttribute('data-tb-invalid'), true);
                    if (submitBtn) { submitBtn.innerHTML = btnSubmitText; submitBtn?.removeAttribute?.('disabled') };

                };

                // formData.append(e.id, e.value);

                formData[e.getAttribute('data-tb-key') || e?.name?.replace(/-/g, '_') || e.id.replace('_', '_')] = e.getAttribute('data-tb-value') || e.value;
            }
        }
        form.getAttribute('data-tb-keys')?.split(',')?.forEach((v, i) => {
            const values = form?.getAttribute('data-tb-values')?.split(',').filter((word) => word.length > 0);
            // console.log('values',values, form)
            // values.filter((word) => word == 'true')
            const match = values[i]?.match(/\{([^}]+)\}/g)?.map(match => match?.slice(1, -1)?.toLocaleLowerCase());
            if (match) {
                formData['_' + v] = form.getAttribute(`data-${match[0]}`);
            } else {
                formData['_' + v] = values[i];
            }
        });

        formData[form.getAttribute('data-tb-key') || undefined] = form.getAttribute('data-tb-value') || undefined;

        const request_hash = await md5(sendUrl + JSON.stringify(formData));

        // if (localStorage.getItem(request_hash)) {
        //     const data = JSON.parse(localStorage.getItem(request_hash));
        //     globalHandler(data) (e.classList.add('d-none'), e.setAttribute('hidden', true))
        //     return;
        // }

        const useData = form.getAttribute('data-tb-use');
        var tb_id = form.getAttribute('data-tb-id') || form.getAttribute('id');
        if (useData) {
            // console.log(useData);
            const data = JSON.parse(useData);
            globalHandler(data)
            resolve(data)
            return data;
        }


        const useCache = form.getAttribute('data-tb-cache');
        const cacheKey = form.getAttribute('data-tb-cache-key');
        if (useCache == 'true') {
            if (cacheKey) {
                const collection = JSON.parse(localStorage.getItem(cacheKey));
                // console.log(collection)
                if (collection?.[request_hash]) {
                    const data = JSON.parse(collection[request_hash]);
                    resolve(data)
                    globalHandler(data)
                    return data;
                }
            }
        }


        if (tb_id) {
            document.querySelectorAll(`[data-tb-res-status="${tb_id}"],[data-tb-res-await="${tb_id}"]`).forEach((e) => {
                e.role == 'status' ? (e.classList.remove('d-none'), e.removeAttribute('hidden')) : (e.classList.add('d-none'), e.setAttribute('hidden', true));
            });
            document.querySelectorAll(`[data-tb-res-false="true"][data-tb-res-status="${tb_id}"]`).forEach((e) => {
                hd(e);
            });
        };


        api(sendUrl, {
            method: form.getAttribute('data-tb-method') || 'POST',
            body: JSON.stringify(formData),
        }).then(response => {
            localStorage.setItem('cf-ray', response.headers.get('cf-ray'));
            return response.json()
        })
            .then(data => {
                if (data.ok) {
                    if (form.getAttribute('data-tb-cache') == 'true') {
                        if (cacheKey) {
                            if (!localStorage.getItem(cacheKey)) {
                                localStorage.setItem(cacheKey, JSON.stringify({}))
                            }
                            const collection = JSON.parse(localStorage.getItem(cacheKey));
                            collection[request_hash] = JSON.stringify(data);
                            localStorage.setItem(cacheKey, JSON.stringify(collection));
                        } else {
                            localStorage.setItem(request_hash, JSON.stringify(data));
                        }
                        // localStorage.setItem(request_hash, JSON.stringify(data));
                    };
                }
                globalHandler(data)
                resolve(data)
                return data;
            })
            .catch((error) => {
                if (submitBtn) { submitBtn.innerHTML = btnSubmitText; submitBtn?.removeAttribute?.('disabled') }
                // handlerNotOk(data)

                console.log('Error:', error);
            });

        function globalHandler(data) {

            // console.log('Success:', data);
            if (data.ok) {

                document.querySelectorAll(`[data-tb-proccessed="true"],[data-tb-proccessed="nodata"]`).forEach((e) => {
                    e.remove();
                });
                document.querySelectorAll(`[data-tb-res-foreach="${tb_id}"]`).forEach((e) => {
                    const object = eval('data.' + e.getAttribute(`data-tb-res`));
                    const objectKeys = Object.keys(object);
                    const p = e.querySelector('[data-tb-proccessed="false"]');


                    if (objectKeys.length == 0) {
                        hd(e.querySelector(':first-child'))
                        const noData = document.createElement('span');
                        noData.classList.add('py-2');
                        noData.setAttribute('data-tb-proccessed', 'nodata')
                        noData.innerHTML = `<code class="text-dark f-14 fw-14">${e.getAttribute('data-tb-noData')}</code>`;
                        e.appendChild(noData);
                        return;
                    } else {
                        hd(e.querySelector(':first-child'), false)
                    }

                    let tempHTML = '';
                    if (p) {
                        tempHTML = p.innerHTML;
                        e.innerHTML = '';
                        p.remove();
                    } else {

                        // const existsTable = e.querySelector('table tbody tr');
                        // if (existsTable) {
                        //     tempHTML = existsTable?.outerHTML;
                        // } else {
                        tempHTML = e.innerHTML;
                        e.innerHTML = '';
                        // }
                    }

                    objectKeys.forEach((key) => {
                        const value = object[key];
                        const tempDiv = document.createElement('div');
                        tempDiv.setAttribute('data-tb-proccessed', true)
                        tempDiv.innerHTML = tempHTML;
                        const html = tempDiv.innerHTML;
                        tempDiv.innerHTML = eval('`' + html + '`');
                        e.appendChild(tempDiv);
                    });

                    const initDiv = document.createElement('div');
                    initDiv.innerHTML = tempHTML;
                    initDiv.setAttribute('data-tb-proccessed', false);
                    initDiv.setAttribute('hidden', true);
                    e.appendChild(initDiv);

                });


                document.querySelectorAll(`[data-tb-res-target="${tb_id}"][data-type="json"]`).forEach((e) => {
                    e.innerHTML = '';
                    const object = eval('data.' + e.getAttribute(`data-tb-res`));
                    const jsonViewer = document.createElement("andypf-json-viewer");
                    // jsonViewer.expanded = true
                    jsonViewer.indent = 2
                    jsonViewer.showDataTypes = true
                    jsonViewer.theme = AppConfig.settings.theme == 'dark' ? 'default-dark' : 'default-ligth'
                    jsonViewer.showToolbar = true
                    jsonViewer.showSize = true
                    jsonViewer.showCopy = true
                    jsonViewer.expandIconType = "square"
                    jsonViewer.data = object
                    e.appendChild(jsonViewer)

                });


                // console.log(tb_id)
                if (form.getAttribute('data-tb-target-parent')) {
                    const exportDiv = document.querySelector(`[data-tb-target-export="__actual"],[data-tb-action="export"]`)
                    exportDiv.setAttribute('data-tb-export-data', JSON.stringify(data))
                    exportDiv.setAttribute('data-tb-export-name', data.request_id)
                    document.querySelectorAll(`[data-tb-res-target="${tb_id}"]`).forEach((e) => {
                        // console.log(e)
                        // if (e.getAttribute('data-type') == 'forEach') {
                        //     console.log('forEach', e);
                        //     const object = eval('data.' + e.getAttribute(`data-tb-res`));
                        //     const container = e.closest('ul'); // Obtener el contenedor de la lista
                        //     // console.log(container.innerHTML)
                        //     container.innerHTML = '';
                        //     if (!object) return;
                        //     const entries = Object?.entries?.(object);
                        //     if (entries.length == 0) {
                        //         const noData = document.createElement('span');
                        //         // noData.classList.add('list-group-item', 'px-0', 'pt-0');
                        //         noData.innerHTML = `<code>${e.getAttribute('data-tb-noData')}</code>`;
                        //         container.appendChild(noData);
                        //     } else {
                        //         // console.log()

                        //         const html = e.innerHTML;
                        //         entries.forEach(([key, value]) => {

                        //             // console.log(key, value)
                        //             // Crear un nuevo elemento <li>
                        //             const listItem = document.createElement('li');
                        //             listItem.classList.add('list-group-item', 'px-0', 'pt-0', 'p-0');
                        //             // Crear la estructura HTML dentro del <li>

                        //             // console.log(e.getAttribute(`data-tb-res`), html, key, value)

                        //             // listItem.innerHTML = eval('`' + html + '`');
                        //                 listItem.innerHTML = `
                        //                 <div class="row">
                        //                     <div class="col-md-12">
                        //                         <p class="mb-1 text-muted">
                        //                             <span data-as="header" data-type="key">${key}</span>
                        //                         </p>
                        //                         <h6 class="mb-0">
                        //                             <span data-as="header" data-type="value">${value}</span>
                        //                         </h6>
                        //                     </div>
                        //                 </div>
                        //             `;

                        //             // Agregar el nuevo elemento <li> a la lista
                        //             container.appendChild(listItem);
                        //         });
                        //     }
                        // } else {
                        if (!e.getAttribute('data-type')) {
                            try {
                                if (e.getAttribute(`data-tb-res`) && (eval('data.' + e.getAttribute(`data-tb-res`))).toString()) {
                                    const format = e.getAttribute('data-tb-format');
                                    // console.log(format)
                                    if (format) {
                                        let parsed = '';

                                        switch (format) {
                                            case 'size': {
                                                parsed = formatSize(parseInt(eval('data.' + e.getAttribute(`data-tb-res`))), true, false, 0)
                                                break;
                                            }

                                            default:
                                                {
                                                    // console.log('default, format', format, e)
                                                    parsed = moment(eval('data.' + e.getAttribute(`data-tb-res`))).fromNow();
                                                }
                                                break;

                                        }
                                        e.innerText = parsed
                                    } else {
                                        e.innerText = (eval('data.' + e.getAttribute(`data-tb-res`))).toString()

                                    }
                                }
                            }
                            catch (error) {

                            }
                        }

                    });
                }
                document.querySelectorAll(`[data-tb-res-status="${form.id}"],[data-tb-res-await="${form.id}"]`).forEach((e) => {
                    e.role == 'status' ? e.setAttribute('hidden', true) : e.removeAttribute('hidden')
                });

                if (tb_id) {
                    document.querySelectorAll(`[data-tb-res-status="${tb_id}"],[data-tb-res-await="${tb_id}"]`).forEach((e) => {
                        e.role == 'status' ? (e.classList.add('d-none'), e.setAttribute('hidden', true)) : (e.classList.remove('d-none'), e.removeAttribute('hidden'))
                    });
                }

                document.querySelectorAll(`[data-tb-res-set-target="${tb_id}"]`).forEach((e) => {
                    // console.log(e)

                    const set = e.getAttribute('data-tb-res-set');
                    const sets = set.split(',');

                    const datas = e.getAttribute('data-tb-res-set-data');
                    const datasVal = datas.split(',');


                    sets.forEach((attr, i) => {
                        const attrVal = datasVal[i];
                        const groups = attrVal.split(/(?<=\)),/).map(grupo => grupo.replace(/^[(]|[)]$/g, ''));
                        // console.log(groups)

                        // const dataVal = eval(`${datas[sets.indexOf(set)]}`);
                        // try {
                        //     console.log('set', attr, eval('`' + attrVal + '`'))
                        //     e.setAttribute(attr, eval('`' + attrVal + '`'));
                        // } catch (error) {
                        //     console.log('EVAL', 'data.' + attrVal)
                        // }
                        // e.setAttribute(attr, eval('`' + attrVal  + '`'));

                        // e.setAttribute(set, data)
                    });


                    e.setAttribute(e.getAttribute('data-tb-res-set'), eval(e.getAttribute('data-tb-res-set-data')))
                });
                handlerOk(data);
            } else {
                document.querySelectorAll(`[data-tb-res-false="true"][data-tb-res-status="${tb_id}"]`).forEach((e) => {
                    hd(e, false);
                });
                document.querySelectorAll(`[data-tb-res-await="${tb_id}"][data-tb-res-status="${tb_id}"]`).forEach((e) => {
                    hd(e);
                });
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
            const handlerOkfunc = form.getAttribute('onload') || form.getAttribute('data-tb-on-ok')
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

        }

        function handlerNotOk(data) {

            console.log('!ok', btnSubmitText)
            if (submitBtn) { submitBtn.innerHTML = btnSubmitText; submitBtn?.removeAttribute?.('disabled') };

            if (data.redirect || data.reload) {
                window.href = data.redirect
                window.location.reload()
            }

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
    });
}


async function md5(cadena) {
    const msgUint8 = new TextEncoder().encode(cadena);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function exportController(data, type) {

    const exportDiv = data.closest('div');
    // const exportData = JSON.parse(exportDiv.getAttribute('data-tb-export-data'))
    // const reqId = data.getAttribute('data-tb-req_id');
    // var exportData = JSON.parse(document.querySelector(`[data-tb-export-name="${reqId}"]`).getAttribute('data-tb-export-data'));
    console.log(data)
    return
    // exports as json and dowload
    if (type == 'json') {
        // const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
        // const downloadAnchorNode = document.createElement('a');
        // downloadAnchorNode.setAttribute("href", dataStr);
        // downloadAnchorNode.setAttribute("download", `${data.closest('div').getAttribute('data-tb-export-name')}.json`);
        // document.body.appendChild(downloadAnchorNode); // required for firefox
        // downloadAnchorNode.click();
        // downloadAnchorNode.remove();
        // create a blob object
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportDiv.getAttribute('data-tb-export-name') + '.json';
        a.click();
        URL.revokeObjectURL(url);
    } else if (type == 'csv') {
        const jsonData = [
            exportData
        ];
        const csv = Papa.unparse(jsonData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'data.csv');
        link.click();
    } else if (type == 'pdf') {
        // console.log(window)
        // const doc = new  jspdf.jsPDF();
        // doc.text(JSON.stringify(exportData, null, 2));
        // doc.save(exportDiv.getAttribute('data-tb-export-name') + '.pdf');

        // cdn pdf
        // const pdf = new PDFDocument();
    } else if (type == 'print') {

        var contenidoDiv = document.getElementById('_request_details').outerHTML;

        // Abrir una nueva ventana para imprimir
        var ventanaImpresion = window.open('', '_blank');

        // Agregar el contenido del div a la ventana de impresión
        ventanaImpresion.document.write(`${document.head.outerHTML}<body data-pc-preset="preset-1"  data-pc-sidebar-caption="true" data-pc-direction="ltr" data-pc-theme_contrast="" data-pc-theme="dark">${contenidoDiv}</body>`);

        ventanaImpresion.addEventListener('DOMContentLoaded', () => {
            ventanaImpresion.print();

        })
        // Imprimir la ventana de impresión
        // console.log(exportDiv)
    }
}

async function downloadFile(e) {
    // download any file

}

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
    // text ?  $_("#" + x + '_invalid').text(text) : '';


    const invalidDiv = document.createElement('div');
    invalidDiv.id = `${i}_invalid`;
    invalidDiv.classList.add('invalid-feedback');
    invalidDiv.textContent = y ? y : '';
    if (e.parentNode.querySelector(`#${i}_invalid`)) e.parentNode.querySelector(`#${i}_invalid`).remove();

    e.parentNode.appendChild(invalidDiv);
    e.classList.add('is-invalid');
    e.style.borderColor = "#dc3545"
    e.style.borderWidth = "2px"
    // $_("#" + i).addClass('is-invalid').css("border-color", "#dc3545");

    // $_("#" + i + "-label").css("color", "#dc3545");

    if (y) {
        const inv = document.getElementById(`${i}_invalid`)
        inv.textContent = y;
        // $_("#" + i + "_invalid").text(y);
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
        // e.addEventListener("keyup", handleEvent);
        e.addEventListener("keydown", handleEvent);
        e.addEventListener("change", handleEvent);
        // e.addEventListener("click", handleEvent);
        // $_('#element').bind("keyup keydown change click", function () {
        //     if (!g.val().length) {
        //         g.attr("style", "border:1px solid rgb(220 53 67);").addClass('is-invalid')
        //     } else {
        //         g.removeAttr('style').removeClass('is-invalid')

        //     }
        // });
    }
}

async function toast_(text, sound = false) {
    const toast = document.getElementById('_live_toast')
    if (!toast) {
        const containerHTML = `<div class="position-fixed top-0 end-0 p-3" style="z-index: 99999" data-tb-toast="true"><div id="_live_toast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header"><img src="../assets/images/favicon.svg" class="img-fluid m-r-5" alt="images" style="width: 17px">
        <strong class="me-auto">Trelk</strong><small>Ahora</small><button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div><div class="toast-body" id="_toast_message"></div></div>
  </div>`
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = containerHTML;
        var container = tempDiv.firstChild;
        document.body.appendChild(container);
    }
    document.getElementById('_toast_message').innerHTML = text
    var f = document.getElementById('_live_toast')
    var a = new bootstrap.Toast(f);
    a.show();


    if (sound) {
        const existAudio = document.querySelector('[data-tb-audio]');
        if (existAudio) {
            existAudio.play();
        } else {
            try {
                const audio = document.createElement('audio');
                audio.setAttribute('data-tb-audio', true);
                audio.src = 'https://cdn.pixabay.com/download/audio/2024/04/01/audio_29531e88bf.mp3?filename=notification.mp3';
                await audio.play();
                document.body.appendChild(audio);
            } catch (error) {
                var audio2 = new Audio('https://cdn.pixabay.com/download/audio/2024/04/01/audio_29531e88bf.mp3?filename=notification.mp3');
                audio2.play();
            }

        }
    }




}

function lang_change(lang) {

    $_("modalChangeLang").modal(true)
    document.cookie = `lang=${lang};path=/;max-age=31536000`;
    const elementos = document.querySelectorAll('[i18n]');



    // set placeholder in change lang modal

    // elementos.forEach(elemento => {
    //     elemento.innerHTML = `<div class="col"><p class="placeholder-glow">
    //     <span class="placeholder col-auto"></span>
    //   </p></div>`
    // });

    const textosI18n = {
        "hook_no_req_title": "Aquí recibirás tus solicitudes de gancho en tiempo real.",
        "copy_button": "Copiar",
        "hook_url": "Esta es tu URL de gancho. Puedes usar esta URL para recibir datos de fuentes externas.",
        "external_link_button": "Enlace externo",
        "view_all_requests_button": "Ver todas las Solicitudes",
        "webhook_setup_instructions": "Una vez que tu gancho esté configurado, comenzarás a recibir solicitudes aquí. Cada solicitud se mostrará en tiempo real, lo que te permitirá ver y responder a los datos entrantes rápidamente.",
        "happy_webhook_monitoring_message": "¡Feliz monitoreo de gancho!",
    };
    elementos.forEach(elemento => {
        const key = elemento.getAttribute('i18n');
        if (textosI18n.hasOwnProperty(key)) {
            elemento.textContent = textosI18n[key];
        }
    });

    $_("modalChangeLang").modal(false)

    // window.location.reload();
}
document.querySelectorAll('[data-tb-apiPath]').forEach(async (e) => {
    const submitBtn = e.querySelector('button[type="submit"]');
    // const hash = await md5(e.innerHTML);
    let is_legal = false;
    // e.setAttribute('data-hash', hash);
    if (submitBtn) {
        submitBtn.setAttribute('disabled', true);
        e.addEventListener('input', async (evt) => {
            const validators_messages = {
                'email': 'Insert a email valid',
                'minlength': 'Enter a value of at least {{val}} characters',
                'maxlength': 'Enter a value of at most {{val}} characters',
                'required': 'This field is required'
            }
            // const newHash = await md5(document.getElementById(evt.target.form.id).innerHTML);
            // const oldHash = evt.target.form.getAttribute('data-hash');
            if (evt.target.getAttribute('data-validator') == 'true') {
                e.querySelectorAll('[maxlength]').forEach((el) => {
                    if (evt.target.value.length >= el.getAttribute('maxlength')) {
                        is_legal = true;
                    } else {
                        is_legal = false;
                    }
                })
                e.querySelectorAll('[minlength]').forEach((el) => {
                    if (evt.target.value.length >= el.getAttribute('minlength')) {
                        is_legal = true;
                    } else {

                        is_legal = false;
                    }
                });
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


const AsyncFunction = (async () => { }).constructorg;

function isAsync(fn) {
    return fn instanceof AsyncFunction;
}

var initsfuncs = {
    // localStorage.getItem('sortingAs') ||
    // init: async () => {
    //     async function loadCSS(url) {
    //         return new Promise((resolve, reject) => {
    //             const link = document.createElement('link');
    //             link.rel = 'stylesheet';
    //             link.href = url;
    //             link.onload = () => resolve(link);
    //             link.onerror = (error) => reject(error);
    //             document.head.appendChild(link);
    //         });
    //     }

    //     // Array de URLs de las hojas de estilos
    //     const cssUrls = [
    //         '../assets/fonts/inter/inter.css',
    //         'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
    //         'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/css/fontawesome.min.css',
    //         '../assets/fonts/material.css'
    //     ];

    //     // Cargar las hojas de estilos de forma asíncrona
    //     Promise.all(
    //         cssUrls.map(async url => await loadCSS(url))
    //     )

    //     function loadScriptAsync(scriptObj) {
    //         return new Promise((resolve, reject) => {
    //             const script = document.createElement('script');
    //             script.src = scriptObj.src;
    //             script.async = scriptObj.async || false;
    //             // Manejar el evento onload del script
    //             script.onload = () => {
    //                 if (scriptObj.onload) {
    //                     scriptObj.onload();
    //                 }
    //                 resolve(script);
    //             };

    //             // Manejar el evento onerror del script
    //             script.onerror = (error) => {
    //                 if (scriptObj.onerror) {
    //                     scriptObj.onerror(error);
    //                 }
    //                 reject(error);
    //             };

    //             document.head.appendChild(script);
    //         });
    //     }

    //     // Array de objetos de scripts
    //     const scripts = [
    //         {
    //             src: 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js',
    //             async: true,
    //         },
    //         {
    //             src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js',
    //             async: true,
    //         },
    //         {
    //             src: '../assets/js/fonts/custom-font.js',
    //             async: true,
    //             onload: () => console.log('custom-font.js cargado correctamente'),
    //             onerror: (error) => console.error('Error al cargar custom-font.js:', error)
    //         },
    //         {
    //             src: '../assets/js/pcoded.js',
    //             async : true,
    //             onload: () => console.log('pcoded.js cargado correctamente'),
    //             onerror: (error) => console.error('Error al cargar pcoded.js:', error)
    //         },
    //         {
    //             src: 'https://cdn.jsdelivr.net/npm/sweetalert2@latest',
    //             async: true,
    //             onload: () => console.log('SweetAlert2 cargado correctamente'),
    //             onerror: (error) => console.error('Error al cargar SweetAlert2:', error)
    //         },
    //         {
    //             src: 'https://cdn.jsdelivr.net/npm/moment/moment.min.js',
    //             async: true,
    //             onload: () => {
    //                 initsfuncs.formatDates().run();
    //             },
    //             onerror: (error) => console.error('Error al cargar Moment.js:', error)
    //         },
    //         {
    //             src: 'https://cdn.jsdelivr.net/npm/clipboard@latest/dist/clipboard.min.js',
    //             async: true,
    //             onload: () => {
    //                 new ClipboardJS('[data-clipboard=true]').on('success', function (e) {
    //                     e.clearSelection();
    //                     alert('Copied!');
    //                 });
    //             },
    //             onerror: (error) => console.error('Error al cargar Clipboard.js:', error)
    //         },
    //         {
    //             src: 'https://cdn.jsdelivr.net/npm/@andypf/json-viewer',
    //             async: true,
    //             onload: () => console.log('JSON Viewer cargado correctamente'),
    //             onerror: (error) => console.error('Error al cargar JSON Viewer:', error)
    //         },
    //         {
    //             src: 'https://cdn.jsdelivr.net/npm/xmlserializer',
    //             async: true,
    //             onload: () => console.log('XML Serializer cargado correctamente'),
    //             onerror: (error) => console.error('Error al cargar XML Serializer:', error)
    //         },
    //         {
    //             src: '../assets/js/emiter.js',
    //             onload: () => console.log('Emiter.js cargado correctamente'),
    //             onerror: (error) => console.error('Error al cargar Emiter.js:', error)
    //         },
    //         {
    //             src: '../assets/js/timereal.js',
    //             onload: () => console.log('Timereal.js cargado correctamente'),
    //             onerror: (error) => console.error('Error al cargar Timereal.js:', error)
    //         }
    //     ];

    //     // Cargar los scripts de forma asíncrona
    //     Promise.all(
    //         scripts.map(scriptObj => loadScriptAsync(scriptObj))
    //     )
    //         .then(() => {
    //             console.log('Todos los scripts cargados correctamente');
    //         })
    //         .catch((error) => {
    //             console.error('Error al cargar los scripts:', error);
    //         });
    // },
    dinamicList: () => {
        document.querySelectorAll('[role="list"][data-tb-dinamic="true"]').forEach((e) => {
            e.addEventListener('click', (evt) => {
                const active = evt.currentTarget.querySelectorAll('.active');
                active.forEach((el) => {
                    el.classList.remove('active');
                });
                const li = evt.target.closest('li');
                li.style.backgroundColor = '';
                li.classList.add('active');
            });
        });
    },
    sortingList: () => {
        var list, i, switching, b, shouldSwitch;
        list = document.querySelector("[data-tb-sort]");
        const iconIndicator = document.querySelector('[data-tb-toggle="sorting"] i');
        const sortingAs = list.getAttribute('data-tb-sorting-as') || 'asc';
        if (sortingAs == 'asc') {
            iconIndicator.classList.remove('ti-sort-descending')
            iconIndicator.classList.add('ti-sort-ascending')
        } else {
            iconIndicator.classList.remove('ti-sort-ascending')
            iconIndicator.classList.add('ti-sort-descending')
        }

        // localStorage.setItem('sortingAs', sortingAs);
        switching = true;
        while (switching) {
            switching = false;
            b = list.getElementsByTagName("li");
            for (i = 0; i < (b.length - 1); i++) {
                shouldSwitch = false;
                // console.log( b[i])
                if (sortingAs == 'asc') {
                    if (b[i].querySelector('[data-tb-sorting=true]').getAttribute('data-tb-timestamp').toLowerCase() > b[i + 1].querySelector('[data-tb-sorting=true]').getAttribute('data-tb-timestamp').toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else {
                    if (b[i].querySelector('[data-tb-sorting=true]').getAttribute('data-tb-timestamp').toLowerCase() < b[i + 1].querySelector('[data-tb-sorting=true]').getAttribute('data-tb-timestamp').toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
                // if (b[i].querySelector('[data-tb-sorting=true]').getAttribute('data-tb-timestamp').toLowerCase() < b[i + 1].querySelector('[data-tb-sorting=true]').getAttribute('data-tb-timestamp').toLowerCase()) {
                //     shouldSwitch = true;
                //     break;
                // }
            }
            if (shouldSwitch) {
                b[i].parentNode.insertBefore(b[i + 1], b[i]);
                switching = true;
            }
        }
    },
    core: () => {
        var handlerToggle = (evt) => {
            const elController = document.querySelector(`${evt.currentTarget.getAttribute('data-tb-controller')}`);
            const elToggleType = evt.currentTarget.getAttribute('data-tb-toggle');
            const el = evt.currentTarget;
            const toggleStatus = el.getAttribute('data-tb-toggle-status');
            switch (elToggleType) {
                case 'sorting': {
                    if (elController.tagName == 'UL') {
                        elController.getAttribute('data-tb-sorting-as') == 'asc' ? elController.setAttribute('data-tb-sorting-as', 'desc') : elController.setAttribute('data-tb-sorting-as', 'asc');
                        initsfuncs.sortingList();
                    } else {
                        throw new Error('The element is not a list');
                    }
                    break;
                }
                case 'ui.check': {
                    const oldHtml = el.innerHTML;
                    const onCheck = el.getAttribute('data-tb-on-check');
                    const onUncheck = el.getAttribute('data-tb-on-uncheck');
                    const isOnly = el.getAttribute('data-tb-toggle-only');
                    let currentstate = 'unchecked';
                    const isChecked = el.getAttribute('data-tb-status') == 'checked';

                    if (isOnly) {
                        const parent = el.closest('ul');
                        parent.querySelectorAll('[data-tb-status="checked"]').forEach((e) => {
                            e.querySelector('i')?.remove();
                            e.setAttribute('data-tb-status', 'unchecked');
                        });
                    }
                    if (el.querySelector('i')?.classList?.contains('ti-checks')) {
                        el.querySelector('i')?.remove();
                        currentstate = 'unchecked';
                        el.setAttribute('data-tb-status', currentstate);
                        if (el.eval) eval(onUncheck);
                        return
                    }
                    currentstate = 'checked';
                    if (el.eval) eval(onCheck);
                    el.setAttribute('data-tb-status', currentstate);
                    if (!isChecked) {
                        el.innerHTML = '<i class="ti ti-checks"></i>' + oldHtml;
                    } else {
                        el.innerHTML = oldHtml;
                    }
                    break;
                }

                case 'ui.expand': {
                    elController.classList.toggle('w-100');
                    break;
                }

                case 'hook.req.open': {
                    // const reqId = evt.currentTarget.getAttribute('data-tb-req');
                    // if (!(evt.target.parentElement.getAttribute('data-tb-toggle') == 'hook.req.remove' || evt.target.parentElement.getAttribute('aria-label') == 'Delete')) {

                    //     const hookRequest = new HookRequest(reqId.split('_')[1]);
                    //     hookRequest.open();
                    // }

                    break
                }

                case 'hook.req.remove': {
                    // const reqId = evt.currentTarget.getAttribute('data-tb-req');
                    // if (evt.target.parentElement.getAttribute('data-tb-toggle') == 'hook.req.remove' || evt.target.parentElement.getAttribute('aria-label') == 'Delete') {
                    //     removeHookRequest(reqId);
                    // }
                    break;
                }

            }
            // console.log(elController, evt.currentTarget.getAttribute('data-tb-toggle'))
        }
        var contadorClicks = {};
        var tiempoEspera = 3000; // en milisegundos (0.3 segundos)
        var ultimoClic = {};
        function manejarClics(event) {
            var toggleValue = event.currentTarget.getAttribute('data-tb-toggle');
            var onTrending = event.currentTarget.getAttribute('data-tb-on-trending');
            if (!contadorClicks[toggleValue]) {
                contadorClicks[toggleValue] = 0;
            }
            var tiempoActual = new Date().getTime();
            if (tiempoActual - ultimoClic[toggleValue] < tiempoEspera) {
                contadorClicks[toggleValue]++;
            } else {
                contadorClicks[toggleValue] = 1;
            }
            ultimoClic[toggleValue] = tiempoActual;
            if (contadorClicks[toggleValue] === 5) {
                contadorClicks[toggleValue] = 0;
                if (onTrending) {
                    eval(onTrending);
                }
            }
        }
        document.querySelectorAll('[data-tb-toggle]').forEach((e) => {

            if (e.getAttribute('data-tb-listener')) return;
            const toggleStatus = e.getAttribute('data-tb-toggle-status');
            if (toggleStatus == 'true') {
                e.eval = false;
                handlerToggle({ currentTarget: e, target: e })
            }
            e.eval = true;
            e.setAttribute('data-tb-listener', 'true')
            e.addEventListener('click', handlerToggle)
            if (e.getAttribute('data-tb-on-trending')) {
                e.addEventListener('click', manejarClics)
            }
        })
        /**
         * Handler dropdown 
         * @param {HTMLElement} e 
         */
        var handlerDropdown = (e) => {
            const isProccessed = e.getAttribute('data-tb-proccessed') == 'select';
            if (isProccessed) return;
            const btn = e.querySelector('[data-bs-toggle="dropdown"]');
            const menu = e.querySelector('.dropdown-menu');
            const activeSearch = e.getAttribute('data-search') || false;

            e.addEventListener('onchange', (evt) => {
                // console.log('change', evt.currentTarget)
                const onchange = e.getAttribute('onchange');
                // console.log(onchange)
                if (onchange) {
                    eval(onchange);
                }

            });
            // console.log('activeSearch', activeSearch)

            if (activeSearch == 'true') {
                const inputSearch = document.createElement('input');
                inputSearch.classList.add('form-control', 'sticky-top', 'border-2', 'rounded-bottom-0', 'rounded-end-0');
                inputSearch.type = 'search';
                inputSearch.setAttribute('placeholder', e.getAttribute('data-placeholder') || 'Search');
                inputSearch.setAttribute('data-tb-search', 'true');
                menu.classList.add('pt-0', 'px-0');
                menu.prepend(inputSearch);
                inputSearch.addEventListener('input', (evt) => {
                    const value = evt.target.value.toLowerCase();
                    const items = e.querySelectorAll('.dropdown-item');
                    let count = 0;
                    items.forEach((el) => {
                        const text = el.textContent.toLowerCase();
                        if (text.includes(value)) {
                            count++;
                            el.style.display = 'block';
                        } else {
                            el.style.display = 'none';
                        }
                    });
                    if (count == 0) {
                        const noResults = document.createElement('div');
                        noResults.classList.add('text-center', 'text-muted', 'fw-bold', 'py-2');
                        noResults.setAttribute('data-tb-no-results', 'true');
                        noResults.setAttribute('disabled', true);
                        noResults.innerText = 'No results';
                        const noResults2 = menu.querySelectorAll('[data-tb-no-results]');
                        noResults2.forEach((el) => {
                            el.remove();
                        });
                        menu.appendChild(noResults);
                    } else {
                        const noResults = menu.querySelectorAll('[data-tb-no-results]');
                        noResults.forEach((el) => {
                            el.remove();
                        });
                    }
                });
            }
            var handlerDropdownClick = (evt) => {
                const elSelected = evt instanceof Event ? evt.currentTarget : evt;
                const activeItem = e.querySelector('.active');
                const storageSet = e.getAttribute('set');
                if (activeItem) {
                    activeItem.classList.remove('active');
                }
                elSelected.classList.add('active');
                btn.innerHTML = elSelected.innerHTML.replace('<i class="ti ti-checks"></i>', '');
                e.setAttribute('value', elSelected.getAttribute('value'))
                if (storageSet) {
                    storage.set(storageSet, elSelected.getAttribute('value'));
                }
                e.dispatchEvent(new Event('onchange'));
            }

            // set value item 
            e.setAttribute('data-tb-proccessed', 'select')
            const defaultItem = e.querySelector(`.dropdown-item[value="${e.getAttribute('value')}"]`);
            if (defaultItem) {
                handlerDropdownClick(defaultItem);
            }
            e.querySelectorAll('.dropdown-item').forEach(async (el) => {
                el.classList.add('px-3')
                el.addEventListener('click', (evt) => {
                    handlerDropdownClick(evt);
                });
            });
        }

        document.querySelectorAll('.dropdown[role="select"]').forEach(async (e) => {
            handlerDropdown(e);
        });

        document.querySelectorAll('[data-tb-ui]').forEach((e) => {
            const ui = e.getAttribute('data-tb-ui');
            switch (ui) {
                case 'select': {
                    const select = e
                    const options = select.querySelectorAll('option');
                    const dropdown = document.createElement('div');
                    const dropdownBtn = document.createElement('button');
                    const dropdownMenu = document.createElement('div');
                    const dropdownItems = document.createElement('div');
                    dropdown.classList.add('dropdown', 'dropdown-select', 'w-auto');
                    dropdownBtn.classList.add('btn', 'btn-secondary', 'dropdown-toggle', 'rounded-1', 'w-auto');
                    dropdownBtn.setAttribute('type', 'button');
                    dropdownBtn.setAttribute('data-bs-toggle', 'dropdown');
                    dropdownBtn.setAttribute('aria-expanded', 'false');
                    dropdownBtn.innerText = (select.querySelector('option[selected]')?.innerText || options[0]?.innerText).replace(/<br>/g, '');
                    dropdownMenu.classList.add('dropdown-menu');
                    dropdownItems.classList.add('dropdown-items');

                    dropdown.setAttribute('data-search', select.getAttribute('data-search') || false);
                    dropdownBtn.classList.add(...select.getAttribute('class').split(' '));
                    dropdown.setAttribute('data-tb-search', select.getAttribute('data-search') || false);
                    dropdown.id = select.id || `dropdown_${Math.random().toString(36).substring(7)}`;
                    dropdown.appendChild(dropdownBtn);
                    dropdown.appendChild(dropdownMenu);
                    dropdownMenu.appendChild(dropdownItems);
                    // e.nextElementSibling.appendChild(dropdown);
                    options.forEach((option) => {
                        const dropdownItem = document.createElement('button');
                        dropdownItem.classList.add('dropdown-item');
                        dropdownItem.setAttribute('type', 'button');
                        dropdownItem.setAttribute('value', option.value);
                        dropdownItem.innerHTML = option.innerHTML.trim();
                        // console.log('dropdownItem', option.innerHTML)
                        dropdownItems.appendChild(dropdownItem);
                        // dropdownItem.addEventListener('click', (evt) => {
                        //     dropdownBtn.innerText = evt.currentTarget.innerText;
                        //     select.value = evt.currentTarget.getAttribute('value');
                        //     select.dispatchEvent(new Event('change'));
                        // });
                    }
                    );

                    const container = select.parentNode;
                    // console.log('container', dropdown.prototype)


                    container.replaceChild(dropdown, select);
                    handlerDropdown(dropdown);
                    break;
                }
            }

            document.dispatchEvent(new Event('ui.loaded'));
        });

        document.querySelectorAll('[data-tb-clipboard]').forEach((e) => {
            const clipboard = new ClipboardJS(e);
            clipboard.on('success', function (e) {
                toast_('Copied!');
                e.clearSelection();
            });
        });


    },
    extraVars: () => {
        const extraVars = AppConfig.extra;
        const breadcrumb = document.querySelector('.breadcrumb');
        Object.keys(extraVars).forEach((key) => {
            if (key == 'showAlert') {
                // toast_(extraVars[key].message)
                console.log('showAlert', extraVars[key])
                const alert = document.createElement('div');
                alert.innerHTML = `<div class="alert alert-${extraVars[key].type || 'warning'} text-dark  alert-dismissible d-flex align-items-center fade show" role="alert"><i class="ti ti-alert-triangle f-18 me-3"></i><strong
                id="alertTitle" class="me-1 fw-bold"></strong><span id="alertMessage"></span>
            <button type="button" class="btn-close" data-bs-dismiss="alert"
                aria-label="Close"></button>
        </div>`;
                alert.setAttribute('data-tb-ui', 'alert')
                alert.querySelector('#alertTitle').innerText = extraVars[key].title;
                alert.querySelector('#alertMessage').innerText = extraVars[key].message;
                breadcrumb.before(alert);
                EE.on('hook.req.open', (reqId) => {
                    hd(alert)
                    console.log('reqId', reqId)
                });
            } else if (key == 'autoOpenReq') {
                console.log('autoOpenReq', extraVars[key].id)
                openHookRequest('req_' + extraVars[key].id);
            }
        });

    },
    formatDates: () => {
        return {
            run: async () => {
                const init = () => {
                    document.querySelectorAll('[data-tb-format][data-tb-timestamp]').forEach(async (e) => {
                        // if (e.getAttribute('data-tb-interval') == 'false') return;
                        const time = e.getAttribute('data-tb-timestamp');
                        const format = e.getAttribute('data-tb-format');
                        if (format == 'fromNow') {
                            let parseDate = moment(parseInt(time)).fromNow();
                            e.innerText = parseDate;
                        } else {
                            let parseDate = moment(parseInt(time)).format(format);
                            e.innerText = parseDate;
                        }

                        // if(e.innerText == 'Invalid date') {
                        //     e.removeAttribute('data-tb-timestamp');
                        // }   
                        // moment().format('LLL');
                        // let parseDate = moment(parseInt(time)).fromNow();
                        // e.innerText = parseDate;
                    });
                }
                init();

                setInterval(() => {
                    init();
                }, 1000);
            }
        }
    }
}

class TrelkCore {

    constructor() {
        this.version = '1.0.0';
    }




}


class TrelkUI extends TrelkCore {
    constructor() {
        super();
        this.version = '1.0.0';

    }


    // async eachRendering()        

    async ifProcessing() {
        document.querySelectorAll('[data-tb-if]').forEach((e) => {
            const data = e.getAttribute('data-tb-if');
            const onTrue = e.getAttribute('data-tb-true');

            const dataSplit = e.innerText.split(':');

            if (data != 0 && data != 'false' && data != 'null' && data != 'undefined' && data != '') {

                var _this = e;
                eval(onTrue)

                const result = dataSplit[0].replace(/\$_(\w+)/g, (match, variable) => {
                    if (!AppConfig.vars[variable]) {
                        console.log('Variable no encontrada:', variable);
                        var valorVariable = AppConfig.settings[variable] || match;
                    } else {
                        var valorVariable = AppConfig.vars[variable];
                    }
                    return valorVariable !== undefined ? valorVariable : match;
                });
                e.innerHTML = result;
                e.style.display = 'block';
            } else {
                e.style.display = 'block';
                e.innerHTML = dataSplit[1];
            }



        });
    }

    getTheme() {
        return document.body.getAttribute('data-pc-theme') == 'dark' ? 'dark' : 'light';
    }

    async init() {
        // this.eachRendering();
        this.ifProcessing();

    }

}

class TrelkUX {
    constructor() {
        this.version = '1.0.0';

    }

    async notificationPermission() {
        if (Notification.permission !== 'granted') {
            return Notification.requestPermission();
        }
    }

    async checkNotificationPermission() {
        return Notification.permission;
    }

    /**
     * 
     * @param {String} text 
     * @param {NotificationOptions} opts 
     * @param {boolean} sound 
     * @returns 
     */

    notification(text, opts, sound = false) {
        if (Notification.permission == 'granted') {
            var notification = new Notification(text, {
                opts
            })
            return notification;
        } else {
            toast_(text, sound);
        }
    }

    async toast(text, sound = false) {
        return toast_(text, sound);
    }



}




function getTheme() {
    return document.body.getAttribute('data-pc-theme') == 'dark' ? 'dark' : 'light';
}


window.addEventListener('load', async () => {
    {
        /**
     * Renderiza el contenido de un each.
     * @param {Object} options - Las opciones de renderizado.
     * @param {HTMLElement} options.each - El elemento sobre el que se realizará la acción.
     * @param {any} options.val_ - El valor a renderizar.
     * @param {HTMLElement} options.initHtml - El HTML inicial.
     * @param {HTMLElement} options.oldEl - El elemento original.
     * @param {string} options.objKey - La clave del objeto.
     * @param {string} options.asKey - La clave de la variable.
     * @param {Object} options.obj - El objeto.
     * @param {string} options.func - La función.
     * @param {string} options.set - El set.
     */
        renderController = ({ each, key_, val_, initHtml, objKey, asKey, obj, func, set }) => {
            eval(`${asKey} = val_;   ${set}`);
            const [key, val] = set.split('=');
            const newEl = document.createElement('div');
            newEl.setAttribute('data-tb-each', true);

            newEl.innerHTML = initHtml.replace(/(?<!\$)\{\{([^{}]+)\}\}/g, (match, var_) => {
                try {
                    // console.log('replacer', match, var_, eval(`${var_}`));
                    if (match.includes('$')) { return match }
                    return eval(`${var_}`);
                } catch (error) {

                }
            })
            // console.log(15, newEl.innerHTML);
            // each.prepend(newEl);

            each.appendChild(newEl);
            return newEl;
            // each.parentNode.insertBefore(newEl, each);
        };

        /**
        * Calcula el área de un rectángulo.
        * @param {HTMLElement} each - El elemento sobre el que se realizará la acción.
        */

        function processingEach(each, AppConfig_) {
            const objKey = each.getAttribute('data-tb-obj');
            const asKey = each.getAttribute('as');

            const obj = AppConfig_?.vars?.[objKey] || AppConfig.vars[objKey];
            const objParsed = obj;
            const func = each.getAttribute('data-tb-func');
            const set = each.getAttribute('set');
            const oldEl = each.querySelector(':first-child');
            oldEl.setAttribute('data-tb-ignore', true);
            oldEl.setAttribute('data-tb-original-tag', oldEl.tagName);
            return {
                init: () => {
                    if (func === 'entries') {
                        // var entries = Object.entries(objParsed);
                        // // entries = Object.entries(objParsed);

                        // // entries=  entries.sort((a, b) => a[1].timestamp < b[1].timestamp);
                        // // console.log('sortend entries', entries);
                        // // entries = Object.fromEntries(entries);
                        // // entries = Object.entries(entries);

                        // const initHtml = each.querySelector(':first-child').outerHTML;
                        // oldEl.outerHTML = oldEl.outerHTML.replace(/^<li/, '<div').replace(/li>$/, 'div');
                        // const batchSize = 15;

                        // // console.log(15, entries.length);
                        // if (entries.length > batchSize * 3) {
                        //     let batchIndex = 0;
                        //     const renderedKeys = new Set();

                        //     renderNextBatch();
                        //     const scrollableElement = document.querySelector('.navbar-content');
                        //     const scrollTimeout = 500;
                        //     let isScrolling;

                        //     // Función que se llama cuando el usuario deja de hacer scroll
                        //     function handleScrollEnd() {
                        //         hd('hookPageIndicator', true);
                        //     }

                        //     function handleScroll(event) {
                        //         const element = event.target;
                        //         const height = document.querySelector('.pc-navbar');
                        //         const rects = height.getClientRects();
                        //         const diff = height.scrollHeight - Math.abs(Math.floor(rects[0].y));
                        //         const isAtBottom = diff <= 2000;

                        //         if (isAtBottom) {
                        //             renderNextBatch();
                        //         }
                        //         hd('hookPageIndicator', false);
                        //         clearTimeout(isScrolling);
                        //         isScrolling = setTimeout(handleScrollEnd, scrollTimeout);

                        //     }
                        //     // En el evento de scroll
                        //     scrollableElement.addEventListener('scroll', (event) => {
                        //         console.log('scrolling');
                        //         handleScroll(event);
                        //     });

                        //     document.addEventListener('deleteAllRequests', () => {
                        //         console.log('Se han eliminado todas las solicitudes');
                        //         renderedKeys.clear();
                        //         batchIndex = 0;
                        //         scrollableElement.removeEventListener('scroll', handleScroll, false);
                        //     });

                        //     function renderNextBatch() {
                        //         const remainingEntries = entries.length - batchIndex * batchSize;
                        //         if (remainingEntries > 0) {
                        //             const nextBatch = entries.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
                        //             nextBatch.forEach(([key_, val_]) => {
                        //                 if (!renderedKeys.has(key_)) {
                        //                     renderController({ each, key_, val_, initHtml, objKey, asKey, obj, func, set });
                        //                     document.dispatchEvent(new CustomEvent('eachEntryRendered', { detail: { id: key_, value: val_ } }));
                        //                     renderedKeys.add(key_);
                        //                     let showing = batchIndex * batchSize + 1;
                        //                     let showingAt = (batchIndex + 1) * batchSize > entries.length ? entries.length : (batchIndex + 1) * batchSize;
                        //                     let total = entries.length;
                        //                     $_('hookPageIndicatorShowing').text(`Showing ${showing} - ${showingAt} of ${total}`);
                        //                 }
                        //             });
                        //             batchIndex++;
                        //         }
                        //         // console.log (`Se han renderizado ${batchIndex * batchSize} entradas de un total de ${entries.length}`);
                        //     }
                        //     each.querySelector(':first-child').setAttribute('hidden', true);
                        //     each.querySelector(':first-child').setAttribute('data-tb-each', 'init');
                        // } else {
                        if (func === 'entries') {
                            var entries = Object.entries(objParsed);
                            var entriesCup = entries;
                            const initHtml = each.querySelector(':first-child').outerHTML;
                            oldEl.outerHTML = oldEl.outerHTML.replace(/^<li/, '<div').replace(/li>$/, 'div>');

                            // console.log(15, initHtml);
                            if (entries.length >= 100) {
                                entriesCup = entries.slice(0, 100);
                            }
                            entriesCup.forEach(([key_, val_]) => {
                                renderController({ each, key_, val_, initHtml, objKey, asKey, obj, func, set });
                            });
                            console.log(15, entriesCup.length,);
                            if (entries.length == 0) {
                                // el.setAttribute('hidden', true);
                            } else {
                                // el.remove();
                            }
                            each.querySelector(':first-child').setAttribute('hidden', true);
                            each.querySelector(':first-child').setAttribute('data-tb-each', 'init');
                            document.querySelector('.navbar-content').addEventListener('scroll', (event) => {
                                const element = event.target;
                                const height = document.querySelector('.pc-navbar');
                                const rects = height.getClientRects();
                                const diff = height.scrollHeight - Math.abs(Math.floor(rects[0].y));
                                const isAtBottom = diff <= 2000;
                                if (isAtBottom) {


                                    console.log('You have reached the bottom of the scroll');
                                }

                            })

                        }
                        // }
                    }

                },
                processNewEntrie: (newEntrie) => {

                    each.querySelector(':first-child').removeAttribute('hidden');
                    each.querySelector(':first-child').setAttribute('data-tb-each', 'init');
                    each.querySelector(':first-child').removeAttribute('data-tb-listener')
                    let initHtml = each.querySelector(':first-child').outerHTML;
                    initHtml = initHtml.replace(/^<div/, '<li').replace(/div>$/, 'li>');
                    const returningEl = renderController({ each, val_: newEntrie, initHtml, objKey, asKey, obj, func, set });
                    each.querySelector(':first-child').setAttribute('hidden', true);
                    return returningEl;
                }
            }

        }
        window.processingEach = processingEach;
        document.querySelectorAll('each').forEach((each) => {
            (processingEach(each)).init();
        });

        document.dispatchEvent(new Event('eachCompletedRendering'));

    }
    const trelkUI = new TrelkUI();
    await trelkUI.init();

    for (const key in initsfuncs) {
        initsfuncs[key]()?.run?.();
    }
    // document.querySelector('.simplebar-content-wrapper').addEventListener("scroll", (event) => {
    //     const element = event.target;
    //     console.log(element.scrollHeight - element.scrollTop === element.clientHeight, element.clientHeight - 20);
    //     // if (element.scrollHeight - element.scrollTop === element.clientHeight) {
    //     //     document.getElementById('nextBtn').click();
    //     // }
    //     // if (element.scrollTop === 0) {
    //     //     document.getElementById('prevBtn').click();
    //     // }

    // });
});


function hd(e, hidden = true) {

    //     if(typeof e === 'object') {
    //         console.log(JSON.stringify(e))
    //         e.forEach((els) => {
    //             console.log(els)
    //         })
    //     }
    // return
    if (hidden) {
        if (e instanceof HTMLElement) {
            e.classList.add('d-none');
            e.setAttribute('hidden', true);
        } else {
            const El = document.getElementById(e);
            El.classList.add('d-none');
            El.setAttribute('hidden', true);
        }
    } else {
        if (e instanceof HTMLElement) {
            e.classList.remove('d-none');
            e.removeAttribute('hidden');
        } else {
            const El = document.getElementById(e);
            // console.log('El', El)
            El.classList.remove('d-none');
            El.removeAttribute('hidden');
        }
    }
}

HTMLElement.prototype.hd = function (hidden = true) {
    hd(this, hidden);
}

// console.log('AppConfig', _$_('vars.hookId'))

function _$_(var_) {
    return eval(`AppConfig.${var_}`);
}

var intervalsManager = {
    intervals: [],
    add: (interval) => {
        intervalsManager.intervals.push(interval);
    },
    clear: () => {
        intervalsManager.intervals.forEach((interval) => {
            clearInterval(interval);
        });
    },
    clearOne: (interval) => {
        clearInterval(interval);
    },
    clearAll: () => {
        intervalsManager.intervals.forEach((interval) => {
            clearInterval(interval);
        });
    }
}


function $_(selector) {

    // console.log('selector', selector)

    if (selector == 'document') {
        let originalTitle = AppConfig.page.title;
        document.body.setAttribute('data-tb-title', originalTitle);
        return {
            title: (title) => {
                if (title) {
                    document.title = title;
                } else {
                    return {
                        add: (position, text, opts = {}) => {
                            const split = originalTitle.split('|');
                            const actualPosition = split[position - 1].trim();
                            let statusNumber = $_('document').title().get().status(position, { start: '(', end: ')' }) || 0
                            if (opts.decStatus) {
                                statusNumber = statusNumber - 1;
                            }
                            let finalStatus = statusNumber == 0 || statusNumber < 0 ? '' : `(${$_('document').title().get().status(position, { start: '(', end: ')' }) || 0})`;
                            if (opts.decStatus) {
                                finalStatus = finalStatus - 1;
                            }
                            const finalText = text.replace(/\${currentPositionText}/g, actualPosition).trim().replace(/\${statusNumber}/g, finalStatus).trim();
                            split[position - 1] = finalText;
                            document.title = split.join(' | ').trim();
                        },
                        interval: (position, text, opts = { interval: 750, repeat: 2 }) => {
                            const split = originalTitle.split('|');
                            const actualPosition = split[position - 1].trim();
                            const finalText = text.replace(/\${currentPositionText}/g, actualPosition).trim();
                            split[position - 1] = finalText;
                            document.title = split.join(' | ').trim();
                            let counter = 0;
                            intervalsManager.clearAll();
                            const interval = setInterval(() => {
                                if (counter < opts.repeat) {
                                    document.title = originalTitle;
                                    setTimeout(() => {
                                        document.title = split.join(' | ').trim();
                                    }, opts.interval);
                                } else {
                                    clearInterval(interval);
                                    if (opts.finalTitile) {
                                        document.title = $_('document').title().replace(opts.finalTitile);
                                    } else {
                                        document.title = originalTitle;

                                    }
                                }
                                counter++;
                            }, opts.interval * 2);
                            intervalsManager.add(interval);
                            return {
                                stop: () => {
                                    clearInterval(interval);
                                    document.title = originalTitle;
                                },
                                setFinal: (position, text) => {
                                    this.title().add(position, text);
                                }
                            }
                        },
                        replace: (title) => {
                            const replacers = {
                                '${currentTitle}': document.title,
                                '${originalTitle}': originalTitle,
                                '${statusNumber}': $_('document').title().get().status(1, { start: '(', end: ')' }) - 1 || 0,
                                '${currentPositionText}': $_('document').title().get().position(1),
                            }

                            let newTitle = title;
                            // for (const key in replacers) {
                            //     newTitle = newTitle.replace(key, replacers[key]);
                            // }
                            document.title = newTitle;
                        },
                        get: () => {
                            return {
                                original: () => {
                                    return originalTitle;
                                },
                                current: () => {
                                    return document.title;
                                },
                                position: (position) => {
                                    const split = document.title.split('|');
                                    return split[position - 1]?.trim();
                                },
                                status: (position, delimiters = { start: '(', end: ')' }) => {
                                    const split = document.title.split('|');
                                    const text = split[position - 1]?.trim();
                                    const start = text.indexOf(delimiters.start);
                                    const end = text.indexOf(delimiters.end);
                                    return text.substring(start + 1, end);
                                },
                                setStatus: (position, status, delimiters = { start: '(', end: ')' }) => {
                                    const split = document.title.split('|');
                                    const text = split[position - 1]?.trim();
                                    const start = text.indexOf(delimiters.start);
                                    const end = text.indexOf(delimiters.end);
                                    const newText = text.replace(text.substring(start, end + 1), `(${status}) `);
                                    split[position - 1] = newText;
                                    document.title = split.join(' | ').trim();
                                },
                                decStatus: (position, delimiters = { start: '(', end: ')' }) => {
                                    const split = document.title.split('|');
                                    const text = split[position - 1]?.trim();
                                    const start = text.indexOf(delimiters.start);
                                    const end = text.indexOf(delimiters.end);
                                    const status = parseInt(text.substring(start + 1, end));
                                    let newText = '';
                                    if (status == 0 || isNaN(status)) {
                                        newText = text.replace(text.substring(start, end + 1), ``);
                                    } else {
                                        newText = text.replace(text.substring(start, end + 1), `(${status - 1})`);
                                    }
                                    // const newText = text.replace(text.substring(start, end + 1), `(${status - 1})`);
                                    split[position - 1] = newText;
                                    document.title = split.join(' | ').trim();
                                },
                                all: () => {
                                    return document.title.split('|').map((el) => el.trim());
                                }

                            }
                        },

                        reset: () => {
                            document.title = AppConfig.page.title;
                        }
                    }
                }
            },
            ...document
        }
    }


    if (!selector.startsWith('#')) {
        key = '#';
    } else {
        key = '#';
    }


    // if (key == "#") {
    try {
        var el = document.querySelector('#' + selector);

    } catch (error) {

    }
    // } else {
    //     var el = document.querySelector(selector);
    // }

    if (!el) {
        return false;
    }
    let add = {};

    if (el.tagName == 'NUM') {
        let value = parseInt(el.textContent);
        add = {
            get: () => {
                return value;
            },
            update: (val) => {
                value = val;
                el.textContent = value;
            },
            inc: () => {
                value++;
                el.textContent = value;
            },
            dec: () => {
                value--;
                el.textContent = value;
            },
            reset: () => {
                value = 0;
                el.textContent = value;

            }
        }
    } else if (el.tagName == 'UL') {
        const listaItems = el.querySelectorAll('li');
        let currentIndex = -1;
        listaItems.forEach((item, index) => {
            if (item.classList.contains('active')) {
                currentIndex = index;
            }
        });

        if (currentIndex == -1) {
            currentIndex = 0;
        } else if (currentIndex >= listaItems.length) {
            currentIndex = 0;
        } else {
            currentIndex++;
        }


        add = {
            active: (e) => {
                const active = el.querySelectorAll('.active');
                active.forEach((el) => {
                    el.classList.toggle('active');
                });
                document.getElementById(e).classList.toggle('active');
            },
            next: () => {
                if (listaItems.length == 0) {
                    throw new Error('No items in list');
                }
                if (currentIndex == 0) {
                    add.active(listaItems[currentIndex].id);
                } else if (currentIndex >= listaItems.length) {
                    currentIndex = 0;
                    add.active(listaItems[currentIndex].id);
                } else {
                    add.active(listaItems[currentIndex].id);
                }
                return {
                    active: () => {
                        return add.active(listaItems[currentIndex].id);
                    },
                    id: listaItems[currentIndex].id,
                    data: listaItems[currentIndex].dataset,
                    ...listaItems[currentIndex]
                };
            },
            prev: () => {
                if (listaItems.length == 0) {
                    throw new Error('No items in list');
                }
                currentIndex = currentIndex - 2;
                console.log(currentIndex, listaItems.length)
                if (currentIndex == -1 || currentIndex == -2) {
                    currentIndex = listaItems.length - 1;
                    add.active(listaItems[currentIndex].id);
                } else {
                    add.active(listaItems[currentIndex].id);
                }

                return {
                    id: listaItems[currentIndex].id,
                    data: listaItems[currentIndex].dataset,
                    ...listaItems[currentIndex]
                };
            },
            getNext: () => {
                currentIndex = currentIndex + 1;
                if (currentIndex == 0) {
                    return {
                        id: listaItems[currentIndex].id,
                        data: listaItems[currentIndex].dataset,
                        ...listaItems[currentIndex]
                    }
                } else if (currentIndex >= listaItems.length) {
                    currentIndex = 0;
                    return {
                        id: listaItems[currentIndex].id,
                        data: listaItems[currentIndex].dataset,
                        ...listaItems[currentIndex]
                    }
                } else {
                    return {
                        id: listaItems[currentIndex].id,
                        data: listaItems[currentIndex].dataset,
                        ...listaItems[currentIndex]
                    }
                }

            },
            getActive: (stric = true) => {
                let active = el.querySelector('.active');
                if (!active) {
                    active = el.querySelector('li');
                }
                return {
                    next: () => {
                        return add.next();
                    },
                    id: active.id,
                    data: active.dataset,
                    ...active
                };
            },
            clear: () => {
                el.querySelectorAll('li').forEach((el) => {
                    el.remove();
                });
            }
        }

    }

    funcs = {
        ...el,
        hd: (hidden = true) => {
            hd(el, hidden);
            return funcs;
        },
        val: (value) => {
            if (value) {
                el.value = value;
                return funcs;
            } else {
                return el.value;
            }
        },
        modal: (hidden = true) => {
            if (hidden) {
                el.style.display = "block"
            } else {
                el.style.display = "none"
            }

            el.classList.toggle("show");
            return funcs;
        },
        html: (html) => {
            if (!html) return el.innerHTML;
            return el.innerHTML = html;
        },
        text: (text) => {
            el.innerText = text;
        },
        addClass: (className) => {
            el.classList.add(className);
        },
        removeClass: (className) => {
            el.classList.remove(className);
        },
        toggleClass: (className) => {
            el.classList.toggle(className);
        },
        style: (style, value) => {
            el.style[style] = value;
        },
        hasClass: (className) => {
            return el.classList.contains(className);
        },
        attr: (attr, value) => {
            el.setAttribute(attr, value);
            return this;
        },
        gattr: (attr) => {
            return el?.getAttribute(attr);
        },
        removeAttr: (attr) => {
            el.removeAttribute(attr);
        },
        append: (html) => {
            el.appendChild(html);
        },
        remove: () => {
            el.remove();
        },
        on: (event, callback) => {
            el.addEventListener(event, callback);
        },
        off: (event, callback) => {
            el.removeEventListener(event, callback);
        },
        trigger: (event) => {
            el.dispatchEvent(new Event(event));
        },
        find: (selector) => {
            return el.querySelector(selector);
        },
        parent: () => {
            return $_(el.parentElement);
        },
        children: () => {
            return el.children;
        },
        closest: (selector) => {
            return $_(el.closest(selector));
        },
        next: () => {
            return $_(el.nextElementSibling);
        },
        ...add
    };

    return funcs;
}


/**

 */

class trelkQuery {
    /**
     * @param {String} selector  - El selector del elemento.
     * @returns {HTMLElement} - El elemento.
     */
    constructor(selector) {
        this.selector = selector;
        /** 
         * * @type {HTMLElement} - El elemento.
        */
        this.el = document.querySelector(selector);
    }

    hd(hidden = true) {
        hd(this.el, hidden);
        return this;
    }

}

window.addEventListener('offline', function () {
    console.log('offline')
    toast_('No internet connection', true);
});

window.addEventListener('online', function () {
    console.log('online')
    toast_('Internet connection restored', true);
});

/**
 * Función para monitorear la existencia de una cookie específica.
 * @param {string} cookieName - Nombre de la cookie a monitorear.
 * @param {number} [interval=1000] - Intervalo de tiempo en milisegundos para verificar la cookie.
 * @returns {object} Objeto con métodos para detener el monitoreo y añadir callbacks.
 */
function monitorCookie(cookieName, interval = 1000) {
    let intervalId;
    const deleteCallbacks = [];
    const addCallbacks = [];
    let previousValue = getCookie(cookieName);

    /**
     * Función interna que verifica si la cookie existe.
     * Si la cookie ha sido eliminada, ejecuta todos los callbacks de eliminación.
     * Si la cookie ha sido agregada o modificada, ejecuta todos los callbacks de adición.
     */
    function checkCookie() {
        const cookieValue = getCookie(cookieName);
        
        // Si la cookie no existe y antes existía, ejecuta los callbacks de eliminación
        if (!cookieValue && previousValue) {
            deleteCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error("Error en el callback de monitorCookie (eliminación):", error);
                }
            });
        }

        // Si la cookie existe y antes no existía (o ha cambiado), ejecuta los callbacks de adición
        if (cookieValue && cookieValue !== previousValue) {
            addCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error("Error en el callback de monitorCookie (adición):", error);
                }
            });
        }

        // Actualiza el valor anterior de la cookie
        previousValue = cookieValue;
    }

    // Inicia el intervalo para verificar la cookie periódicamente
    intervalId = setInterval(checkCookie, interval);

    return {
        /**
         * Detiene el monitoreo de la cookie.
         */
        stop: () => {
            clearInterval(intervalId);
        },

        /**
         * Añade un callback que se ejecutará cuando la cookie sea eliminada.
         * @param {function} callback - Función a ejecutar al eliminarse la cookie.
         */
        onDelete: (callback) => {
            if (typeof callback === 'function') {
                deleteCallbacks.push(callback);
            } else {
                console.warn("El callback proporcionado no es una función.");
            }
        },

        /**
         * Añade un callback que se ejecutará cuando la cookie sea añadida o modificada.
         * @param {function} callback - Función a ejecutar al añadirse o modificarse la cookie.
         */
        onAdded: (callback) => {
            if (typeof callback === 'function') {
                addCallbacks.push(callback);
            } else {
                console.warn("El callback proporcionado no es una función.");
            }
        }
    };
}

const sessionMonitor = monitorCookie("session_id");

sessionMonitor.onDelete(() => {
    window.location.reload();
});

sessionMonitor.onAdded(() => {
    window.location.reload();
});
/**
 * Función para obtener el valor de una cookie por su nombre.
 * @param {string} name - Nombre de la cookie.
 * @returns {string|null} Valor de la cookie o null si no existe.
 */
function getCookie(name) {
    const cookieArr = document.cookie.split("; ");
    for (let cookie of cookieArr) {
        const [cName, cValue] = cookie.split("=");
        if (cName === name) {
            return decodeURIComponent(cValue);
        }
    }
    return null;
}


// /**
//  * 
//  * @param {*} selector 
//  * @returns  {trelkQuery}
//  */

// function $_(selector) {
//     return new trelkQuery(selector);
// }









