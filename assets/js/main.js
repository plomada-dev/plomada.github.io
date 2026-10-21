/* Plomada — interacciones del sitio (sin dependencias) */
(function () {
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Aparición suave de bloques al entrar en pantalla ---------- */
  var bloques = document.querySelectorAll('[data-reveal]');
  if (reducir || !('IntersectionObserver' in window)) {
    bloques.forEach(function (b) { b.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    bloques.forEach(function (b) { io.observe(b); });
  }

  /* ---------- Encabezado con sombra y WhatsApp flotante ---------- */
  var encabezado = document.querySelector('.encabezado');
  var flotante = document.querySelector('.whatsapp-flotante');
  var hero = document.querySelector('.hero');
  function alDesplazar() {
    if (encabezado) encabezado.classList.toggle('con-sombra', window.scrollY > 8);
    if (flotante) flotante.classList.toggle('mostrar', !hero || window.scrollY > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', alDesplazar, { passive: true });
  alDesplazar();

  /* ---------- Menú del celular: se cierra al elegir una opción ---------- */
  document.querySelectorAll('.menu-movil a').forEach(function (a) {
    a.addEventListener('click', function () {
      var menu = a.closest('details');
      if (menu) menu.open = false;
    });
  });

  /* ---------- Ventanas emergentes (casos y agenda) ---------- */
  function abrir(dialogo) {
    if (!dialogo || typeof dialogo.showModal !== 'function') return false;
    dialogo.showModal();
    document.documentElement.classList.add('sin-scroll');
    return true;
  }
  document.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('close', function () { document.documentElement.classList.remove('sin-scroll'); });
    // Cerrar al hacer clic fuera del contenido
    d.addEventListener('click', function (ev) { if (ev.target === d) d.close(); });
    d.querySelectorAll('[data-cerrar]').forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
    d.querySelectorAll('[data-cerrar-ir]').forEach(function (a) { a.addEventListener('click', function () { d.close(); }); });
  });
  document.querySelectorAll('[data-abrir]').forEach(function (el) {
    el.addEventListener('click', function (ev) {
      var d = document.getElementById(el.getAttribute('data-abrir'));
      if (abrir(d)) ev.preventDefault();
      if (d && d.id === 'agenda') reiniciarAgenda();
    });
  });

  /* ---------- Estimador de presupuesto ---------- */
  var est = document.getElementById('estimador');
  if (est) {
    var loc = est.dataset.locale;
    var fmt = function (n) { return n.toLocaleString(loc); };
    var redondear = function (n) { return Math.round(n / 10) * 10; };
    var salidaRango = est.querySelector('[data-rango-out]');
    var salidaPlazo = est.querySelector('[data-plazo-out]');
    var salidaMant = est.querySelector('[data-mant-out]');

    function tipoActual() { return est.querySelector('input[name="est-tipo"]:checked'); }
    function calcular() {
      var tipo = tipoActual();
      var k = tipo.value;
      est.querySelectorAll('.opciones[data-tipo]').forEach(function (g) { g.hidden = g.dataset.tipo !== k; });
      var tam = est.querySelector('input[name="est-tam-' + k + '"]:checked');
      var extras = Array.prototype.slice.call(est.querySelectorAll('input[name="est-extra"]:checked'));
      var total = Number(tipo.dataset.base) + Number(tam.dataset.suma);
      extras.forEach(function (x) { total += Number(x.dataset.suma); });
      var alto = redondear(total * 1.3);
      salidaRango.textContent = 'USD ' + fmt(total) + ' – ' + fmt(alto);
      var sem = tam.dataset.sem.split('-').map(Number);
      var sumaSem = extras.length >= 2 ? 1 : 0;
      salidaPlazo.textContent = (sem[0] + sumaSem) + ' ' + est.dataset.a + ' ' + (sem[1] + sumaSem) + ' ' + est.dataset.semanas;
      var mant = est.querySelector('input[name="est-mant"]').checked;
      salidaMant.hidden = !mant;
      if (mant) salidaMant.textContent = '+ USD ' + fmt(Number(tipo.dataset.mant)) + est.dataset.mes + ' ' + est.dataset.mantTxt;
      // Animación breve del resultado
      if (!reducir) { salidaRango.classList.remove('pulso'); void salidaRango.offsetWidth; salidaRango.classList.add('pulso'); }
      return { tipo: tipo, tam: tam, extras: extras, mant: mant };
    }
    est.addEventListener('change', calcular);
    // El botón flotante de WhatsApp se aparta mientras el estimador está en pantalla
    if (flotante && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { flotante.classList.toggle('en-estimador', e[0].isIntersecting); }).observe(est);
    }
    calcular();

    // Precarga el formulario de contacto con el resumen de la estimación
    est.querySelector('[data-pedir]').addEventListener('click', function () {
      var r = calcular();
      var texto = function (input) { return input.parentNode.querySelector('span').textContent; };
      var partes = [texto(r.tipo) + ' · ' + texto(r.tam)];
      if (r.extras.length) partes.push(est.dataset.extras + ': ' + r.extras.map(texto).join(', '));
      if (r.mant) partes.push(est.dataset.conMant);
      var msg = est.dataset.intro + '\n' + partes.join('\n') + '\n' + est.dataset.rango + ': ' + salidaRango.textContent + '.';
      var area = document.querySelector('.formulario textarea');
      if (area) {
        area.value = msg;
        setTimeout(function () { var n = document.querySelector('.formulario input[name="nombre"]'); if (n) n.focus({ preventScroll: true }); }, 500);
      }
    });
  }

  /* ---------- Formulario de contacto: envía por WhatsApp ---------- */
  var contactoForm = document.querySelector('.formulario[data-wa]');
  if (contactoForm) {
    var en = (document.documentElement.lang || 'es').indexOf('en') === 0;
    contactoForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var val = function (n) { var el = contactoForm.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      var nombre = val('nombre'), email = val('email'), wa = val('whatsapp'), mensaje = val('mensaje');
      var lineas = en
        ? ['Hi Plomada, I\'m ' + nombre + '.', email ? 'Email: ' + email : '', wa ? 'WhatsApp: ' + wa : '', '', mensaje]
        : ['Hola Plomada, soy ' + nombre + '.', email ? 'Email: ' + email : '', wa ? 'WhatsApp: ' + wa : '', '', mensaje];
      var texto = lineas.filter(function (l) { return l !== ''; }).join('\n');
      var url = 'https://wa.me/' + contactoForm.dataset.wa + '?text=' + encodeURIComponent(texto);
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------- Agenda del diagnóstico (demo) ---------- */
  var agenda = document.getElementById('agenda');
  function reiniciarAgenda() {
    if (!agenda) return;
    var form = agenda.querySelector('.agenda__form');
    var ok = agenda.querySelector('[data-ok]');
    form.hidden = false; ok.hidden = true;
    agenda.querySelector('[data-error]').hidden = true;
    var contDias = agenda.querySelector('[data-dias]');
    var contHoras = agenda.querySelector('[data-horas]');
    if (contDias.childElementCount) return; // ya construida
    var loc = agenda.dataset.locale;
    var fDia = new Intl.DateTimeFormat(loc, { weekday: 'short' });
    var fNum = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short' });
    var dias = [];
    var d = new Date();
    while (dias.length < 5) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) dias.push(new Date(d));
    }
    var slots = contHoras.dataset.slots.split(',');
    function pintarHoras(indiceDia) {
      contHoras.innerHTML = '';
      slots.forEach(function (h, j) {
        var ocupado = (indiceDia * 3 + j) % 4 === 1; // algunos horarios ocupados para que se vea real
        var lbl = document.createElement('label');
        lbl.className = 'ficha' + (ocupado ? ' ficha--ocupada' : '');
        lbl.innerHTML = '<input type="radio" name="ag-hora" value="' + h + '"' + (ocupado ? ' disabled' : '') + '><span>' + h +
          (ocupado ? ' <small>' + agenda.dataset.ocupado + '</small>' : '') + '</span>';
        contHoras.appendChild(lbl);
      });
    }
    dias.forEach(function (dia, i) {
      var lbl = document.createElement('label');
      lbl.className = 'ficha ficha--dia';
      lbl.innerHTML = '<input type="radio" name="ag-dia" value="' + i + '"><span><b>' + fDia.format(dia) + '</b>' + fNum.format(dia) + '</span>';
      lbl.querySelector('input').addEventListener('change', function () { pintarHoras(i); });
      contDias.appendChild(lbl);
    });
    pintarHoras(0);

    form.addEventListener('change', function () { agenda.querySelector('[data-error]').hidden = true; });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err = agenda.querySelector('[data-error]');
      var dia = form.querySelector('input[name="ag-dia"]:checked');
      var hora = form.querySelector('input[name="ag-hora"]:checked');
      var nombre = form.querySelector('input[name="ag-nombre"]').value.trim();
      var contacto = form.querySelector('input[name="ag-contacto"]').value.trim();
      if (!dia || !hora) { err.textContent = agenda.dataset.errSlot; err.hidden = false; return; }
      if (!nombre || !contacto) { err.textContent = agenda.dataset.errDatos; err.hidden = false; return; }
      err.hidden = true;
      var fLarga = new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long' });
      var fecha = fLarga.format(dias[Number(dia.value)]);
      if (loc.indexOf('es') === 0) fecha = fecha.replace(',', '');
      var nom = nombre.split(' ')[0];
      agenda.querySelector('[data-ok-titulo-out]').textContent = agenda.dataset.okTitulo.replace('{nombre}', nom);
      agenda.querySelector('[data-ok-texto-out]').textContent = agenda.dataset.okTexto.replace('{fecha}', fecha).replace('{hora}', hora.value);
      form.hidden = true;
      agenda.querySelector('[data-ok]').hidden = false;
    });
  }
})();
