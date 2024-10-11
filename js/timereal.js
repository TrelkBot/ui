
let list = document.getElementById('realtimeHookRequestsList').children;
let docTitle = document.title;
let currentIndex = 0;


document.querySelector(`[value="${storage.get('snippet_prefer') || 'node-axios'}"]`)?.dispatchEvent(new Event('click'))

// HTMLFormElement.prototype.setAttribute = function (name, value) {

//   // aply call argument to call misma function
//   this.setAttribute(name, value);
//   return this.setAttribute;
// };

// migrated
async function ygenerateCodeSnippet(targets, data) {

  const documentTheme = getTheme();
  var cssLinkHref = documentTheme == 'dark' ? 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css' : 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css';

  if (!document.getElementById(`highlightjs-${documentTheme}`)) {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = cssLinkHref;
    cssLink.id = `highlightjs-${documentTheme}`;
    cssLink.type = 'text/css';
    cssLink.setAttribute('data-tb-theme_dark', 'github-dark.min.css')
    cssLink.setAttribute('data-tb-theme_light', 'github.min.css')

    document.head.appendChild(cssLink);
  }

  import('https://cdn.jsdelivr.net/npm/@httptoolkit/httpsnippet/+esm')
    .then((httptoolkithttpsnippet) => {
      // El módulo se ha cargado correctamente

      window.httptoolkithttpsnippet = httptoolkithttpsnippet;

      const [lang, lib] = targets.split('-');
      const highlight = targets;
      var dataLang;
      // return console.log('generateCodeSnippet', data)

      if (data instanceof HTMLElement) {

        const reqId = data.getAttribute('data-tb-req_id');
        var req = JSON.parse(document.querySelector(`[data-tb-export-name="${reqId}"]`).getAttribute('data-tb-export-data'));
        dataLang = data.getAttribute('data-lang');
      } else {
        console.log('ssssssss', targets)

        dataLang = langsAndLibs[targets].lang;
        var req = data;
      }

      const finalHeaders = Object.entries(req.headers).map(([headerName, headerValue]) => {
        return {
          name: headerName,
          value: headerValue
        }
      });

      const finalQuery = Object.entries(req.query).map(([queryName, queryValue]) => {
        return {
          name: queryName,
          value: queryValue
        }
      });

      const finalCookies = Object.entries(req.cookies).map(([cookieName, cookieValue]) => {
        return {
          name: cookieName,
          value: cookieValue
        }
      });

      const finalBody = Object.entries(req.body).map(([bodyName, bodyValue]) => {
        return {
          name: bodyName,
          value: bodyValue
        }
      });

      var finalPostData = {};

      switch (req.headers['content-type']) {
        case 'application/json':
          finalPostData = {
            mimeType: req.headers['content-type'],
            text: JSON.stringify(req.body)
          }
          break;
        case 'application/x-www-form-urlencoded':
          finalPostData = {
            mimeType: req.headers['content-type'],
            params: finalBody
          };
          break;
        case 'text/plain':
          finalPostData = {
            mimeType: req.headers['content-type'],
            text: req.body
          };
          break;
        default:
          finalPostData = req.body
          break;
      }

      var snippet = new httptoolkithttpsnippet.default({
        method: req.method,
        url: req.fullUrl,
        headers: finalHeaders,
        cookies: finalCookies,
        postData: finalPostData,
        queryString: finalQuery,
      });

      const codeSnippet = snippet.convert(lang, lib, {});

      // console.log('codeSnippet',  dataLang || document.querySelector(`[value="${highlight}"]`).getAttribute('data-lang'))

      const highlightedCode = hljs.highlight(codeSnippet, {
        language: dataLang || document.querySelector(`[value="${highlight}"]`).getAttribute('data-lang'),
      });

      $_('codeSnippet').html(highlightedCode.value);
    })
    .catch((error) => {
      // Ha ocurrido un error al cargar el módulo
      console.log('Error al cargar el módulo:', error);
    });

}

// class TrelkTimeReal {
//   constructor() {
//     this.hooks = [];
//     this.reqsCount = $_('reqscount');
//     this.totalReqs = $_('reqscount').get();
//     this.requestsList = $_('realtimeHookRequestsList');
//     this.unreadReqs = this.countHookUnreadReqs();
//     this.hookId = AppConfig.vars.hookId;
//     this.broadcaster = document.createElement('script');
//     this.broadcaster.src = "https://cdn.jsdelivr.net/npm/socket.io/client-dist/socket.io.min.js";
//     this.broadcaster.async = true;
//   }


// }

const trelkUX = new TrelkUX();

class TrelkTimeReal {
  constructor() {
    this.hooks = [];
    this.reqsCount = $_('reqscount');
    this.totalReqs = $_('reqscount').get();
    this.requestsList = $_('realtimeHookRequestsList');
    this.unreadReqs = this.countHookUnreadReqs();
    // this.currentOpenReq = null;
    this.hookId = AppConfig.vars.hookId;
    this.broadcasterScript = document.createElement('script');
    this.broadcasterScript.src = "https://cdn.jsdelivr.net/npm/socket.io/client-dist/socket.io.min.js";
    this.broadcasterScript.async = true;
    this.favicon = document.querySelector('link[rel="icon"]');
    this.originalFaviconUrl = this.favicon.href;
  }

  countHookUnreadReqs(opts = { start: '', end: '' }) {
    // const totalReqs = Array.from(document.querySelectorAll('[data-tb-read]')).filter((e) => e.getAttribute('data-tb-read') == 'false').length;
    const totalReqs = Array.from(document.querySelectorAll('[data-tb-read]')).filter((e) => e.getAttribute('data-tb-read') == 'false').length;
    this.unreadReqs = totalReqs;
    return totalReqs ? `${opts.start}${totalReqs}${opts.end}` : '';
  }

  /**
   * Deletes all requests with a confirmation prompt.
   * @param {boolean} forTrendingClicks - Indicates if the deletion is for trending clicks.
  */

  deleteAllRequests(forTrendingClicks = false) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    });

    const confirmationText = forTrendingClicks
      ? 'Do you want to delete all requests?'
      : `This will delete all requests received <num id="reqsCount2">(${this.totalReqs})</num>, including those that do not appear here.`;

    const confirmationTitle = forTrendingClicks
      ? 'Delete all requests?'
      : 'Are you sure?';

    swalWithBootstrapButtons.fire({
      title: confirmationTitle,
      html: confirmationText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        if (forTrendingClicks) {
          this.deleteAllRequests();
        } else {
          const form = document.createElement('form');
          form.setAttribute('data-tb-apiPath', `dash/hooks/${this.hookId}/deleteAllRequests`);
          form.setAttribute('data-tb-values', this.hookId);
          form.setAttribute('data-tb-keys', 'hook_id');
          ProcessingAction(form).then(() => {
            this.requestsList.clear();
            this.reqsCount.reset();
            this.totalReqs = 0;
            this.resetLayout();
            this.restoreFavicon();
            localStorage.removeItem('requests');
            EE.emit('hook.req.remove', 'all');
            document.dispatchEvent(new CustomEvent('deleteAllRequests'));

          });


          // document.getElementById('_hook_delete_all_reqs').click();

        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.close();
      }
    });
  };

  /**
   * Marks all requests as read.
  */
  async markAllRequestsAsRead() {
    document.querySelectorAll('[data-tb-read="false"]').forEach((element) => {
      element.setAttribute('data-tb-read', 'true');
    });

    // Create a form to send the mark all read request
    const form = document.createElement('form');
    form.setAttribute('id', 'mark_read');
    form.setAttribute('data-tb-apiPath', `dash/hooks/${AppConfig.vars.hookId}/markAllRead`);
    form.setAttribute('data-tb-values', this.hookId);
    form.setAttribute('data-tb-keys', 'hook_id');

    // Process the form
    ProcessingAction(form);
    this.restoreFavicon();
    this.unreadReqs = 0;
    // Update the document title to remove unread count
    document.title = document.title.replace(/^\(\d+\)/, '');
    document.dispatchEvent(new CustomEvent('markAllRead'));
  }

  /**
   * Handles a new hook request.
   * @param {*} req 
   */
  async handleNewHookRequest(req) {
    console.log('handleNewHookRequest', req)
    this.reqsCount = $_('reqscount');
    this.reqsCount2 = $_('reqsCount2');
    this.reqsCount.inc();
    this.totalReqs++;
    this.unreadReqs++;
    const newHookReq = new HookRequest(req);
    AppConfig.hookManager().saveHookReq(req.request_id, req);
    await newHookReq.addToReqsList();
    $_('document').title().get().setStatus(1, this.countHookUnreadReqs());
    $_('reqsCount2')?.update?.(`(${this.unreadReqs})`);
    if (AppConfig.getSetting('hooks_reqs_auto_open')) {
      newHookReq.open();
    };
    if (AppConfig.getSetting('hooks_notifications_enabled')) {
      console.log('hooks_notifications_enabled', AppConfig.getSetting('hooks_notifications_enabled'))

      new Notification('New hook request ' + req.request_id, {
        body: `${req.method} request from ${req.ip}`,
        data: req,
        tag: req.request_id,
        renotify: true
      })


      // const notification = trelkUX.notification('New hook request', {
      //   body: 'Hey, you have a new hook request! Touch to view it.',
      //   data: req,
      //   tag: req.request_id,
      //   renotify: true
      // });
      // notification.onclick = function (event) {
      //   event.preventDefault();
      //   this.close();
      //   newHookReq.open();
      //   window.focus();
      // }

      // notification.onshow = function () {
      //   console.log('Notification shown');
      // };
    };
    EE.emit('hook.req.add', newHookReq);

    this.updateFavicon();
  };

  /**
   * Listens to all hooks requests.
   * @memberof TrelkHooks
   */

  async listenerAllHooksReqs() {

    document.querySelectorAll('[data-tb-toggle="hook.req.open"]').forEach((e) => {
      const reqId = e.getAttribute('data-tb-req');
      try {
        new HookRequest(reqId.split('_')[1]).listenerClick()
      } catch (error) {

      }
    });

    // const customDropdown = document.getElementById('customDropdown');
    // const uiDropdown = document.getElementById('uiDropdown');
    // customDropdown.innerHTML = uiDropdown.innerHTML;

    document.querySelectorAll('[data-tb-read]').forEach((e) => {
      e.addEventListener('contextmenu3', function (event) {
        event.preventDefault(); // Previene el menú contextual predeterminado
        // Tu acción aquí
        console.log('Se hizo clic derecho en el elemento', e.id);
        customDropdown.style.display = 'block';
        customDropdown.classList.add('show');
        const dropdownRect = customDropdown.getBoundingClientRect();
        let left = event.clientX;
        let top = event.clientY;
        if ((event.clientX + dropdownRect.width) > window.innerWidth) {
          left = window.innerWidth - dropdownRect.width;
        }
        if ((event.clientY + dropdownRect.height) > window.innerHeight) {
          top = window.innerHeight - dropdownRect.height;
        }
        if (left > window.innerWidth - 250) {
          left = window.innerWidth - 250;
        } else if (left < 0) {
          left = 0;
        }
        if (top > window.innerHeight - 80) {
          top = window.innerHeight + 80;
        } else if (top < 0) {
          top = 0;
        }
        customDropdown.style.left = `${Math.max(0, left - 250)}px`;
        customDropdown.style.top = `${Math.max(top - 80)}px`;
        // create and open dropdown bootstrap 
      });
    });



    document.querySelectorAll('[ data-tb-toggle="hook.req.deleteall"]').forEach((e) => {
      e.addEventListener('click', (evt) => {
        this.deleteAllRequests();
      });
    })
  };

  /**
   * Updates the favicon indicating a new request.
   */

  updateFavicon() {
    const favicon = this.favicon;
    const originalFaviconUrl = this.favicon.href;
    const originalImage = new Image();
    originalImage.crossOrigin = "anonymous";
    originalImage.src = originalFaviconUrl;

    originalImage.onload = function () {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const size = 32;
      canvas.width = size;
      canvas.height = size;
      context.drawImage(originalImage, 0, 0, size, size);
      context.fillStyle = 'red';
      context.beginPath();
      context.arc(size - 6, 6, 4, 0, 2 * Math.PI);
      context.fill();
      const newFaviconUrl = canvas.toDataURL('image/png');
      favicon.href = newFaviconUrl;
    };

  }

  restoreFavicon() {
    this.favicon.href = this.originalFaviconUrl;

  }

  /**
   * Handles the UX of the running hooks.
   * @memberof TrelkHooks
   */

  async startHooksUX() {
    document.getElementById('hookGoTohome').addEventListener('click', (e) => {
      this.resetLayout();
    });

    document.querySelector('[data-tb-toggle="hook.req.markallread"]').addEventListener('mousemove', (e) => {
      const unreadReqs = this.countHookUnreadReqs();
      if (!unreadReqs) {
        e.currentTarget.classList.add('disabled');
        e.currentTarget.textContent = 'All requests are read';
      } else {
        e.currentTarget.classList.remove('disabled');
      }
    });

    document.addEventListener('hook.req.add', (e) => {
      document.querySelector('[data-tb-toggle="hook.req.markallread"]').textContent = 'Mark all as read';
      document.querySelector('[data-tb-toggle="hook.req.markallread"]').classList.remove('disabled');
    });


    document.getElementById('nextBtn').addEventListener('click', (e) => {
      this.moveNext();
    });

    document.getElementById('prevBtn').addEventListener('click', (e) => {
      const prevLiId = $_('realtimeHookRequestsList').prev().id;
      console.log('prevBtn', prevLiId)
      new HookRequest(prevLiId.split('_')[1]).open();
    })

    document.querySelectorAll('[data-tb-toggle="hook.req.export"]').forEach((e) => {
      e.addEventListener('click', (evt) => {
        const exportType = evt.currentTarget.getAttribute('data-export');
        const exportId = evt.currentTarget.getAttribute('data-tb-export-name');
        const reqData = JSON.parse(document.querySelector(`[data-tb-export-name="${exportId}"]`).getAttribute('data-tb-export-data'));
        new HookRequest(reqData).export(exportType);
      });
    });


    document.querySelectorAll('[data-tb-toggle="hook.req.markallread"]').forEach((e) => {
      e.addEventListener('click', (evt) => {
        this.markAllRequestsAsRead();
        e.textContent = 'All requests are read';
        e.classList.add('disabled');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'Delete') {
        this.deleteAllRequests();
      } else if (event.key === 'ArrowRight') {
        this.moveNext();
      } else if (event.key === 'ArrowLeft') {
        const prevLiId = $_('realtimeHookRequestsList').prev().id;
        new HookRequest(prevLiId.split('_')[1]).open();
      } else if (event.key == 'Delete') {
        new HookRequest(this.requestsList.getActive().id).delete();
        // console.log(this.requestsList.getActive())
      }
    });
    this.soundPreferences = storage.get('hooks_notifications_sound');
    this.swichSoundPreferences = document.getElementById('hookCheckSoundPreferences');
    this.hookSoundsPreferences = document.getElementById('hookSoundsPreferences');

    if (this.soundPreferences == 'true') {
      this.swichSoundPreferences.checked = true;
      this.hookSoundsPreferences.classList.remove('d-none');
    } else {
      this.hookSoundsPreferences.classList.add('d-none');
    }
    this.swichSoundPreferences.addEventListener('change', (e) => {
      storage.set('hooks_notifications_sound', e.target.checked);
      if (e.target.checked) {
        this.hookSoundsPreferences.classList.remove('d-none');
        trelkUX.toast('Sound notifications enabled');

      } else {
        trelkUX.toast('Sound notifications disabled');
        this.hookSoundsPreferences.classList.add('d-none');
      }
    });

    this.notificationsPreferences = storage.get('hooks_notifications_enabled');
    this.swichNotificationsPreferences = document.getElementById('hookCheckNotificationsPreferences');

    if (this.notificationsPreferences == 'true') {
      this.swichNotificationsPreferences.checked = true;
    } else {
      hd('hookNotificationsSoundsPreferences');
      this.swichNotificationsPreferences.checked = false;
    }

    this.swichNotificationsPreferences.addEventListener('change', (e) => {
      storage.set('hooks_notifications_enabled', e.target.checked);
      if (e.target.checked) {
        hd('hookNotificationsSoundsPreferences', false);
        Notification.requestPermission().then(function (result) {
          if (result === 'denied') {
            trelkUX.toast('Notifications are blocked. Please enable it in your browser settings.', 'danger')
            return;
          }
          if (result === 'default') {
            trelkUX.toast('Notifications are blocked. Please enable it in your browser settings.', 'danger')
            return;
          }
        });
        trelkUX.toast('Notifications enabled');
      } else {
        hd('hookNotificationsSoundsPreferences');
        trelkUX.toast('Notifications disabled');
      }
    });


    document.addEventListener('ui.loaded', () => {
      document.getElementById('hookSelectAudioPreferences').addEventListener('onchange', (evt) => {
        storage.set('hooks_notifications_audio', evt.target.value);
        document.getElementById('hookAudioPreferences').src = evt.target.getAttribute('value');
        document.getElementById('hookAudioPreferences').play();
        trelkUX.toast('Sound updated');
      });
    });


    document.addEventListener('eachEntryRendered', (e) => {
      // console.log('eachEntryRendered', e)
      new HookRequest(e.detail.id).listenerClick();
    });

  }

  resetLayout() {
    hd('hookReqNavigator');
    hd('hookReqDetails');
    hd('hookPagePrincipal', false);
    $_("hookPageTitle").html(`<h2>Webhook Requests in real-time</h2>`);
    document.querySelectorAll('[data-tb-res-status]').forEach((e) => {
      e.setAttribute('hidden', 'true');
    });
    $_('document').title().reset();

    // active request and desactuve

    document.querySelectorAll('.active').forEach((e) => {
      e.classList.remove('active');
    });
  }
  //  dinamic reloj HH:MM AM/PM
  startReloj() {
    setInterval(() => {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      const strTime = `${hours12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
      document.getElementById('reloj').textContent = strTime;
    }, 1);
  }

  async ping() {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      this.broadcaster.emit("ping", () => {
        const duration = Date.now() - start;
        resolve(`${duration} ms`);
      });
    }
    )
  }

  /**
   * Moves to the next request.
   */
  moveNext() {
    try {
      const nextLiId = $_('realtimeHookRequestsList').next().id;
      new HookRequest(nextLiId.split('_')[1]).open();
      console.log('nextLiId', this.currentOpenReq)

    } catch (error) {
      this.resetLayout();
    }

  }

  /**
   * Initializes the broadcaster.
  */
  startBroadcaster() {
    document.body.appendChild(this.broadcasterScript);
    this.broadcasterScript.onload = ((e) => {
      const socket = io("https://ws.trelk.xyz", {
        withCredentials: true,
        transports: ["websocket"],
        path: '/timereal',
        query: {
          'suscribeTo': ['hooks_events', 'user_events'],
          'user': 'useThisAuthUser',
          'hookId': this.hookId,
          'session': getCookie('session_hash'),
        },
        auth: {
          session: getCookie('session_hash'),
          token: getCookie('session_id')
        }

      });
      this.broadcaster = socket;
    });

  }


  startHooks() {
    this.broadcasterScript.addEventListener('load', (e) => {
      this.broadcaster.on('hook_request', (req) => {
        this.handleNewHookRequest(req);
      });
      this.broadcaster.on('hook_request_deleted', (reqId) => {
        new HookRequest(reqId).delete();
      });
      this.broadcaster.on('error', (err) => {
        console.error('Error:', err);

      });
      this.broadcaster.on("connect", () => {
        $_('hookBroadcasterStatus').html('Waiting for requests');
        if (this.countHookUnreadReqs() > 0) {
          this.updateFavicon();
        }
        $_('document').title().add(1, `${this.countHookUnreadReqs({ start: '(', end: ')' })} \${currentPositionText}`)
      });
      this.broadcaster.on("disconnect", (e) => {
        console.log('disconnect', this.broadcaster)
        if (e === 'io server disconnect') {
          this.restoreFavicon();
          $_('document').title().add(1, 'Multiple connections');
          $_('hookBroadcasterStatus').html('Disconnected');
          $_('hookErrorMessage').html('Multiple connections were detected.<br>Reload the page for real-time updates here.');
          $_('hookErrorModal').modal('show');
          this.broadcaster.disconnect();
          this.broadcaster.close();
          this.broadcaster.destroy();
        }
      });

      window.addEventListener('offline', (e) => {
        console.log('offline', e)

        $_('document').title().add(1, 'No internet connection');
        $_('hookBroadcasterStatus').html('Offline');
        $_('hookErrorMessage').html('You are offline.<br>Check your internet connection.');
        $_('hookErrorModal').modal('show');

        this.broadcaster.disconnect();

      });

      window.addEventListener('online', (e) => {
        console.log('online', e)
        $_('document').title().add(1, 'Internet connection restored');
        $_('hookBroadcasterStatus').html('Online');
        $_('hookErrorModal').modal('hide');
        this.broadcaster.connect();
      });

      this.broadcaster.on("message", (e) => {
        console.log('message', e)
      });
      console.log("Connected to server", this.hookId);
    });

    document.addEventListener('eachCompletedRendering', () => {
      trelkTimeReal.listenerAllHooksReqs();
      trelkTimeReal.startHooksUX();
      // console.log('eachCompletedRendering', window.location.hash.replace('#req_', ''))
      // new HookRequest(window.location.hash.replace('#req_', '')).open();

    });

  }

  startNotifications() {
    this.broadcasterScript.addEventListener('load', (e) => {
      console.log('notification', 'notification')

      this.broadcaster.on('notification', (notification) => {
        console.log('notification', notification)
        new trelkNotification(notification).addToList();

      });
    });
  }

  start(broadcaster = true) {
    this.startReloj();
    if (broadcaster) this.startBroadcaster();
    return this;
  }
}

/**
 * Represents a hook request.
 * @class hookRequest
 * @extends {TrelkTimeReal}
 * @constructor 
 * @param {Object} req - The request object.
 * @example 
 * const newReq = new hookRequest(req);
 * newReq.addToReqsList();
 * newReq.open();
 */


class HookRequest extends TrelkTimeReal {
  constructor(req) {
    super();
    if (typeof req == 'string') {
      this.reqId = req;
      this.reqOriginalId = req.startsWith('req_') ? req : `req_${req}`;
      this.reqLi = req.startsWith('req_') ? $_(`${req}`) : $_(`req_${req}`);
      this.req = null;
    } else {
      this.reqId = req?.request_id;
      this.reqOriginalId = req?.request_id.startsWith('req_') ? req.request_id : `req_${req.request_id}`;
      this.reqLi = req?.request_id.startsWith('req_') ? $_(`${req.request_id}`) : $_(`req_${req.request_id}`);
      this.req = req;
    }

    this.dataTbRead = 'data-tb-read';
    this.dataTbKeys = 'data-tb-keys';
    this.dataTbValues = 'data-tb-values';
    this.readKey = 'read';
    this.trueValue = 'true';
    this.currentOpenReq = null;
    this.reqSnippet = null;
    this.isRead;
  }

  /**
   * 
   * @returns {HookRequest} - The current request.
   */

  async getReqData() {
    return await ProcessingAction(this.reqOriginalId);
  }

  /**
  * Generates a code snippet for the given targets and data.
  * @param {string} targets - The target language and library.
  * @param {Object|HTMLElement} data - The data for generating the code snippet.
  */
  async generateCodeSnippet(targets, data) {
    const documentTheme = getTheme();
    const cssLinkHref = documentTheme === 'dark'
      ? 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css'
      : 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css';

    if (!document.getElementById(`highlightjs-${documentTheme}`)) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = cssLinkHref;
      cssLink.id = `highlightjs-${documentTheme}`;
      cssLink.type = 'text/css';
      cssLink.setAttribute('data-tb-theme_dark', 'github-dark.min.css');
      cssLink.setAttribute('data-tb-theme_light', 'github.min.css');

      document.head.appendChild(cssLink);
    }

    try {
      const { default: HTTPSnippet } = await import('https://cdn.jsdelivr.net/npm/@httptoolkit/httpsnippet/+esm');
      window.httptoolkithttpsnippet = HTTPSnippet;

      const [lang, lib] = targets.split('-');
      const highlight = targets;
      let dataLang, req;

      if (data instanceof HTMLElement) {
        const reqId = data.getAttribute('data-tb-req_id');
        req = JSON.parse(document.querySelector(`[data-tb-export-name="${reqId}"]`).getAttribute('data-tb-export-data'));
        dataLang = data.getAttribute('data-lang');
      } else {
        dataLang = langsAndLibs[targets].lang;
        req = data;
      }

      const finalHeaders = Object.entries(req.headers).map(([name, value]) => ({ name, value }));
      const finalQuery = Object.entries(req.query).map(([name, value]) => ({ name, value }));
      const finalCookies = Object.entries(req.cookies).map(([name, value]) => ({ name, value }));
      const finalBody = Object.entries(req.body).map(([name, value]) => ({ name, value }));

      let finalPostData = {};
      switch (req.headers['content-type']) {
        case 'application/json':
          finalPostData = {
            mimeType: req.headers['content-type'],
            text: JSON.stringify(req.body)
          };
          break;
        case 'application/x-www-form-urlencoded':
          finalPostData = {
            mimeType: req.headers['content-type'],
            params: finalBody
          };
          break;
        case 'text/plain':
          finalPostData = {
            mimeType: req.headers['content-type'],
            text: req.body
          };
          break;
        default:
          finalPostData = req.body;
          break;
      }


      const snippet = new HTTPSnippet({
        method: req.method,
        url: req.fullUrl,
        headers: finalHeaders,
        cookies: finalCookies,
        postData: finalPostData,
        queryString: finalQuery,
      });

      const codeSnippet = snippet.convert(lang, lib, {});

      const { default: highlightJs } = await import('https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/+esm');

      const highlightedCode = highlightJs.highlight(codeSnippet, {
        language: dataLang || document.querySelector(`[value="${highlight}"]`).getAttribute('data-lang'),
      });

      this.reqSnippet = highlightedCode.value;
      document.getElementById('codeSnippet').innerHTML = highlightedCode.value;
    } catch (error) {
      console.error('Error loading the module:', error);
    }
  }



  generateHarFile() {
    const data = this.req;
    const har = {
      log: {
        version: "1.2",
        creator: {
          name: "Custom Generator",
          version: "1.0"
        },
        entries: [
          {
            startedDateTime: data.date,
            time: parseInt(data.processing_time), // tiempo en milisegundos
            request: {
              method: data.method,
              url: data.fullUrl,
              httpVersion: "HTTP/1.1",
              cookies: Object.entries(data.cookies).map(([name, value]) => ({
                name,
                value,
                path: "/",
                domain: data.host
              })),
              headers: Object.entries(data.headers).map(([name, value]) => ({
                name,
                value
              })),
              queryString: Object.entries(data.query).map(([name, value]) => ({
                name,
                value
              })),
              headersSize: -1, // Tamaño no calculado
              bodySize: JSON.stringify(data.body).length
            },
            response: {
              status: data.response.statusCode,
              statusText: data.response.statusMessage,
              httpVersion: "HTTP/1.1",
              cookies: [], // No se proporcionaron cookies de respuesta en los datos
              headers: Object.entries(data.response.headers).map(([name, value]) => ({
                name,
                value
              })),
              content: {
                size: data.size,
                mimeType: data.response.headers["content-type"] || "application/json",
                text: JSON.stringify(data.body)
              },
              redirectURL: "",
              headersSize: -1, // Tamaño no calculado
              bodySize: data.size,
              _transferSize: data.size + JSON.stringify(data.response.headers).length
            },
            cache: {},
            timings: {
              send: 0,
              wait: parseInt(data.processing_time),
              receive: 0
            },
            serverIPAddress: data.ip,
            connection: "",
            pageref: data.fullUrl
          }
        ]
      }
    };

    // dowload file
    const filename = `Hook Request ${data.request_id}.har`;
    const blob = new Blob([JSON.stringify(har, null, 2)], { type: 'application/har' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a')
    a.href = url;
    a.download = filename;
    a.click();
    return JSON.stringify(har, null, 2);
  }

  /**
   * Opens the current request.
   * @returns {Promise<HookRequest>} - The current request.
   * @example
   * const req = new hookRequest(req);
   * req.open();
  */

  async open() {
    this.reqLi = $_(`${this.reqOriginalId}`);
    console.log('open', this.reqLi)

    this.isRead = this.reqLi.gattr('data-tb-read');
    this.requestsList.active(this.reqOriginalId);
    this.reqLi.attr('data-tb-read', 'true');

    $_("hookPageTitle").html(`<h3>Request details</h3>`);
    hd('hookPagePrincipal');
    hd('hookReqNavigator', false);
    hd('hookReqDetails', false);

    if (this.isRead == 'false') {
      if (this.reqLi.gattr('data-tb-use')) {
        const form = document.createElement('form');
        form.setAttribute('id', 'mark_read_req')
        form.setAttribute('data-tb-apiPath', `dash/hooks/${this.hookId}/markRead`);
        form.setAttribute('data-tb-values', `${this.hookId},${this.reqId}`);
        form.setAttribute('data-tb-keys', 'hook_id,req_id');
        ProcessingAction(form);
      }
      this.reqLi.attr('data-tb-read', 'true');
      $_('document').title().add(1, `Request #${this.reqId} | \${currentPositionText}`);
      this.countHookUnreadReqs()
        ? $_('document').title().get().setStatus(1, this.countHookUnreadReqs()) :
        ($_('document').title().reset(), this.restoreFavicon());
      const [keys, values] = ['data-tb-keys', 'data-tb-values'].map(attr =>
        this.reqLi.gattr(attr).split(',')
      );
      this.reqLi.attr('data-tb-keys', ['read', ...keys].join(','));
      this.reqLi.attr('data-tb-values', ['true', ...values].join(','));
    }
    this.req = await ProcessingAction(this.reqOriginalId);
    this.currentOpenReq = this.req;
    this.reqOriginalId = `req_${this.req.request_id}`;
    this.reqId = this.req.request_id;

    // window.location.hash = this.reqOriginalId;
    // const newPath = window.location.href.split('/').slice(0, 1).concat(this.reqId).join('/');
    // console.log('newPath', newPath)
    // history.replaceState(null, '', window.location.href + '/' +this.reqId);
    this.currentOpenReq = this.req;
    this.generateCodeSnippet(storage.get('snippet_prefer'), this.req);
    EE.emit('hook.req.open', this);
    return this;
  }

  /**
   * Listens to the click event.
   */

  listenerClick() {
    this.reqLi.on('click', (evt) => {
      if (!(evt.target.parentElement.getAttribute('data-tb-toggle') == 'hook.req.remove' || evt.target.parentElement.getAttribute('aria-label') == 'Delete')) {
        this.open();
      } else {
        this.delete();
      }
    });
  };


  /**
   * Adds the current request to the requests list.
   * @memberof hookRequest 
   */

  async addToReqsList() {
    (await processingEach(document.getElementById('realtimeHookRequestsLis'))).processNewEntrie(this.req);
    (await processingEach(document.getElementById('reqsSelectUi'))).processNewEntrie(this.req);
    this.reqLi = $_(`req_${this.reqId}`);
    this.reqLi.attr('data-tb-use', JSON.stringify(this.req));
    this.reqLi.attr('data-tb-read', 'false');
    // this.reqLi.on('click', (clickEvent) => {
    //   this.open();
    // });

    this.listenerClick();
    initsfuncs.sortingList();

    return this;
  };

  /** 
   * Marks the current request as read.
   * @memberof hookRequest
   * */

  markRead() {
    if (this.reqLi.getAttribute('data-tb-read') === 'false') {
      const currentKeys = reqLi.getAttribute('data-tb-keys').split(',');
      const currentValues = reqLi.getAttribute('data-tb-values').split(',');
      const updatedKeys = ['read', ...currentKeys];
      const updatedValues = ['true', ...currentValues];
      reqLi.setAttribute('data-tb-values', updatedValues.join(','));
      reqLi.setAttribute('data-tb-keys', updatedKeys.join(','));
    }
  }

  remove() {

  }

  /**
   * Deletes the current request.
   */

  async delete() {
    const formRemove = document.createElement('form');
    formRemove.setAttribute('id', 'remove_req')
    formRemove.setAttribute('data-tb-apiPath', `dash/hooks/${this.hookId}/deleteHookRequest`);
    formRemove.setAttribute('data-tb-values', this.reqId);
    formRemove.setAttribute('data-tb-keys', 'request_id');
    await ProcessingAction(formRemove)
    this.reqLi.remove();
    this.reqsCount.dec(1);
    this.totalReqs -= 1;

    if (this.totalReqs === 0) {
      this.resetLayout();
    } else {
      this.moveNext();
    }
    console.log('req', this.totalReqs)

    const realtimeHookRequestsList = document.getElementById('realtimeHookRequestsList');
    const liElements = realtimeHookRequestsList?.getElementsByTagName("li");
    const cantidadLi = liElements?.length;
    // console.log('cantidadLi', cantidadLi);
    // if (cantidadLi === 0 || req === 'all' || cantidadLi === 1) {
    //   // $_('document').title().reset();
    //   reqLi?.remove?.();


    //   $_('reqscount').reset();
    //   hd('hookReqNavigator')
    //   hd('hookReqDetails');
    //   hd('hookPagePrincipal', false);
    //   $_("hookPageTitle").html(`<h2>Webhook Requests in real-time</h2>`);
    //   document.querySelectorAll('[data-tb-res-status]').forEach((e) => {
    //     e.setAttribute('hidden', 'true');
    //   });
    // } else {

    //   reqLi?.remove?.();

    //   const nextLiId = $_('realtimeHookRequestsList').getActive().next().id
    //   // $_('realtimeHookRequestsList').next().active();

    //   console.log('nextLiId', nextLiId)
    //   openHookRequest(nextLiId);
    // }

    EE.emit('hook.req.delete', this);

  }

  export(format = 'json') {

    switch (format) {
      case 'json':
        const data = JSON.parse(document.querySelector(`[data-tb-export-name="${this.reqId}"]`).getAttribute('data-tb-export-data'));
        const filename = `Hook Request ${this.reqId}.${format}`
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
        trelkUX.toast('Request exported successfully');
        break;
      case 'har':
        this.generateHarFile();
        break;
    }
  }
  /**
   * Get the next request.
   * @memberof hookRequest
   */
  next() {
    const nextLiId = this.requestsList.getNext().id;
    return new HookRequest(nextLiId.split('_')[1]);
  }
}

class trelkNotification extends TrelkTimeReal {
  constructor(ntfData) {
    super();
    this.isToday = ntfData.isToday;
    this.notifications = [];
    this.ntfData = ntfData;
    this.type = ntfData.type;
    this.color = ntfData.color;
    this.title = ntfData.title;
    this.body = ntfData.body;
    this.tag = ntfData.tag;
    this.icon = ntfData.icon;
    this.renotify = ntfData.renotify;
    this.silent = ntfData.silent;
    this.buttons = ntfData.buttons;
  }

  async addToList() {
    const notificationsList = document.getElementById('notificationsToday');
    const notification = document.createElement('div');
    var buttons = '';
    if (this.buttons) {
      buttons = this.buttons.map((button) => {
        const classes = button.classes ? button.classes : '';
        return `<button class="btn ${classes} rounded-1 me-3">${button.text}</button>`;
      }).join('');
      buttons = `<div class="d-flex">${buttons}</div>`;
    }

    notification.innerHTML = `<div class="card">
    <div class="card-body p-3 py-3">
        <div class="align-items-center d-flex flex-wrap gap-2 mb-3">
            <div class="badge bg-light-${this.color} f-12">${this.type}</div>
            <p class="mb-0 text-muted">2 min ago</p>
            <span class="badge dot bg-warning"></span>
        </div>
        <h5 class="mb-3">${this.title}</h5>
        <p class="text-muted">${this.body}
        </p>${buttons}
    </div>
    </div>`;

    notificationsList.prepend(notification);

  }

}

class TrelkNotifications extends TrelkTimeReal {
  constructor() {
    super();
    this.notifications = [];
  }

  async start() {
    this.broadcasterScript.addEventListener('load', (e) => {
      console.log('broadcasterScript', this.broadcaster)
      this.broadcaster.on('hook_request', (req) => {
        console.log('hook_request', req)
      });
    });
  }

}

const trelkTimeReal = new TrelkTimeReal();
trelkTimeReal.start();
trelkTimeReal.startHooks();
// trelkTimeReal.startNotifications();

// const trelkNotifications = new TrelkNotifications();
// trelkNotifications.start();

// switch (AppConfig.page.controller) {
//   case 'hookTimeRealRequests':
//     // Obtener el valor del parámetro 'timereal'
//     const timerealValue = new URLSearchParams(window.location.search).get('timereal');

//     // Comprobar el valor y realizar una acción
//     if (timerealValue === 'false') {
//       console.log('El parámetro timereal es false.');
//     } else if (timerealValue === 'true') {
//       console.log('El parámetro timereal es true.');
//       trelkTimeReal.startHooks();

//     } else {
//       console.log('El parámetro timereal no está presente.');
//       trelkTimeReal.startHooks();

//     }

//     break;
// }


onloadj = ((e) => {
  const handleNotification = (message) => {
    processNotification(message)
    console.log(message)
    // const notificationsDiv = document.getElementById("notifications");
    // notificationsDiv.innerHTML += `<p>${message}</p>`;
  };

  const totalReqs = document.querySelectorAll('[data-tb-read]')

  const unreadReqs = Array.from(totalReqs).filter((e) => e.getAttribute('data-tb-read') == '0');
  const handleHookRequest = async (req) => {
    return;

    EE.emit('hook.request', newReq);
    var tabla = document.getElementById("_hook_requests_table");
    $_('reqscount').inc(1);
    // console.log(151, req)
    const oldtitle = document.title;
    // setTimeout(() => {
    //   document.title = oldtitle;
    // }, 5000);
    // document.title = `${oldtitle}`.replace(/^\(\d+\)/, unreadReqs.length.toString());
    const hookBroadcasterStatus = document.getElementById("hookBroadcasterStatus");
    // hookBroadcasterStatus.innerHTML = `New hook request`;

    // setTimeout(() => {
    //   hookBroadcasterStatus.innerHTML = 'Waiting for requests';
    // }, 5000);/*/-*/-----9*****
    // console.log('hook', req)
    if (!isTimeReal) {
      let newRow = [
        req.timestamp,
        1,
        `<span  class="me-2">${req.request_id}</span><span data-tb-read="false" id="_read_${req.request_id}" class="badge bg-success">New</span>`,
        `<div class="row"><div class="col"><h6 class="mb-0">${req.ip}</h6><p class="text-muted f-12 mb-0">${req.country}</p></div></div>`, req.method, new Date(req.timestamp).toLocaleString(),
        `<span class="badge bg-light-${req.response.statusCode <= 200 ? 'success' : 'danger'} rounded-pill f-12">${req.response.statusCode}</span>`,
        `<ul class="list-inline me-auto mb-0">
            <li class="list-inline-item align-bottom" data-bs-toggle="tooltip" title="View">
              <a href="#" id="req_${req.request_id}" data-tb-keys="hook_id,req_id" hdata-tb-use='${JSON.stringify(req)}'
                data-tb-values="${req.hook_id},${req.request_id}" data-tb-apiPath="hooks/getHookRequest"
                data-tb-target-parent="__actual" data-tb-id="view_req" data-tb-cache="true"
                onclick="var _rad_data = requestHookTable.dom.querySelector('#_read_${req.request_id}');_rad_data.setAttribute('hidden', 'true'); _rad_data.setAttribute('data-tb-read', 'true');ProcessingAction(this.id)"
                class="avtar avtar-xs btn-link-secondary btn-pc-default" data-bs-toggle="modal"
                data-bs-target="#_request_details">
                <i class="ti ti-eye f-18"></i>
              </a>
            </li>
            <li id="req_delete_${req.request_id}" data-tb-keys="hook_id,id"
              data-tb-values="${req.hook_id},${req.request_id}" data-tb-apiPath="hooks/deleteHookRequest"
              onclick="ProcessingAction(this.id); return false;" class="list-inline-item align-bottom"
              data-bs-toggle="tooltip" title="Delete">
              <a href="#" class="avtar avtar-xs btn-link-danger btn-pc-default">
                <i class="ti ti-trash f-18"></i>
              </a>
            </li>
          </ul>`
      ];
      await requestHookTable.rows.add(newRow);
      let columns = requestHookTable.columns;
      await columns.sort(0, 'desc')
    }

    // requestHookTable.setMessage('message') document.getElementById('_request_details').querySelector('[data-bs-dismiss=\'modal\']').click()


  }



  // Agregar un listener para el evento popstate
  window.addEventListener('popstate', (event) => {
    event.stopImmediatePropagation();
    event.preventDefault();
    const currentReq = getCurrentReq();
    openHookRequest(`req_${currentReq}`)
    console.log('La URL ha cambiado:', getCurrentReq());
  });

})


