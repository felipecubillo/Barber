/* =========================================================
   Barbers Town's — SCRIPT PRINCIPAL
   Menú, navegación, animaciones, agenda de citas y formulario
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     CONFIGURACIÓN
     Edita aquí los datos de la barbería: contacto, horario,
     servicios, barberos y cortes.
     ======================================================= */

  var CONFIG = {
    nombre: "Barbers Town's",
    moneda: "₡",                    // cambia al símbolo de tu moneda
    whatsapp: "00000000000",        // código de país + número, sin + ni espacios
    instagram: "barbers_towns",        // nombre de usuario de Instagram
    direccion: "Fabrica de hielo corrales, calle 239, San José, Santiago de Puriscal, Costa Rica",
    pasoAgenda: 30                  // minutos entre una hora y otra
  };

  /* Horario por día: 0 = domingo ... 6 = sábado.
     [apertura, cierre] en horas. null = cerrado. */
  var HORARIO = {
    0: [10, 16],
    1: null,
    2: [10, 20],
    3: [10, 20],
    4: [10, 20],
    5: [10, 21],
    6: [10, 21]
  };

  var SERVICIOS = [
    { id: "corte",     nombre: "Corte",                desc: "Tijera o máquina. Clásico, texturizado o como lo traigas en la foto.", precio: 8000,  mins: 45 },
    { id: "degradado", nombre: "Degradado (fade)",     desc: "Low, mid o high, con transición fina y líneas si quieres.",            precio: 10000, mins: 60 },
    { id: "barba",     nombre: "Barba perfilada",      desc: "Navaja, toalla caliente y aceite.",                                    precio: 6000,  mins: 30 },
    { id: "combo",     nombre: "Corte + barba",        desc: "El paquete completo, de arriba abajo.",                                precio: 14000, mins: 75 },
    { id: "afeitado",  nombre: "Afeitado clásico",     desc: "Navaja y toalla caliente, sin prisa.",                                 precio: 8000,  mins: 40 },
    { id: "diseno",    nombre: "Diseño y líneas",      desc: "Rayas, figuras o cejas con navaja.",                                   precio: 3000,  mins: 30 },
    { id: "color",     nombre: "Decoloración y color", desc: "Platinados, color fantasía o retoque de raíz.",                        precio: 25000, mins: 120 }
  ];

  /* dias: 0 = domingo ... 6 = sábado */
  var BARBEROS = [
    { id: "dani",   nombre: "Dani",   apodo: "Tijera", especialidad: "Fades y degradados limpios. Si es simétrico, lo hace él.",       dias: [2, 3, 4, 5, 6] },
    { id: "marcos", nombre: "Marcos", apodo: "Navaja", especialidad: "Barbas, afeitado clásico y toalla caliente.",                     dias: [2, 4, 5, 6, 0] },
    { id: "sofi",   nombre: "Sofi",   apodo: "Neón",   especialidad: "Color, mullets y cortes largos con capas.",                        dias: [3, 4, 5, 6, 0] },
    { id: "kike",   nombre: "Kike",   apodo: "Cresta", especialidad: "Diseños, líneas, afro y cortes que nadie más se atreve a hacer.",  dias: [2, 3, 5, 6] }
  ];

  /* categoria: degradado | clasico | largo | barba
     servicio: id de un servicio de la lista de arriba */
  var CORTES = [
    { id: "low-fade",    nombre: "Low fade texturizado", categoria: "degradado", servicio: "degradado", desc: "Bajo y limpio por los lados, arriba con textura y movimiento." },
    { id: "mid-crop",    nombre: "Mid fade + crop",      categoria: "degradado", servicio: "degradado", desc: "Transición a media altura y flequillo corto hacia adelante." },
    { id: "high-lineas", nombre: "High fade con líneas", categoria: "degradado", servicio: "degradado", desc: "Alto, marcado, con rayas en el costado." },
    { id: "cresta",      nombre: "Cresta con fade",      categoria: "degradado", servicio: "degradado", desc: "Lados rapados, centro arriba. Con o sin color." },
    { id: "pompadour",   nombre: "Pompadour",            categoria: "clasico",   servicio: "corte",     desc: "Volumen hacia atrás, brillo y raya marcada." },
    { id: "buzz",        nombre: "Buzz cut",             categoria: "clasico",   servicio: "corte",     desc: "Una sola medida. Cero mantenimiento." },
    { id: "mullet",      nombre: "Mullet moderno",       categoria: "largo",     servicio: "corte",     desc: "Corto al frente, largo atrás, con capas." },
    { id: "melena",      nombre: "Melena con capas",     categoria: "largo",     servicio: "corte",     desc: "Largo cuidado, puntas limpias y movimiento." },
    { id: "barba-full",  nombre: "Barba full perfilada", categoria: "barba",     servicio: "barba",     desc: "Líneas duras en mejillas y cuello, volumen controlado." }
  ];

  var FILTROS = [
    { id: "todos",     nombre: "Todos" },
    { id: "degradado", nombre: "Degradados" },
    { id: "clasico",   nombre: "Clásicos" },
    { id: "largo",     nombre: "Largos" },
    { id: "barba",     nombre: "Barba" }
  ];

  var CLAVE_CITAS = "subsuelo.citas";

  var DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  var DIAS_CORTO = ["D", "L", "M", "X", "J", "V", "S"];
  var ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var filtroActual = "todos";


  /* =======================================================
     UTILIDADES
     ======================================================= */

  function pad(numero) {
    return ("0" + numero).slice(-2);
  }

  function formatoMiles(numero) {
    return String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function dinero(numero) {
    return CONFIG.moneda + formatoMiles(numero);
  }

  function formatoIso(fecha) {
    return fecha.getFullYear() + "-" + pad(fecha.getMonth() + 1) + "-" + pad(fecha.getDate());
  }

  function fechaDesdeIso(texto) {
    return new Date(texto + "T00:00:00");
  }

  function horaTexto(minutos) {
    var h = Math.floor(minutos / 60);
    var m = minutos % 60;

    return (h % 12 || 12) + ":" + pad(m) + " " + (h >= 12 ? "pm" : "am");
  }

  function fechaLarga(texto) {
    var fecha = fechaDesdeIso(texto);

    return DIAS[fecha.getDay()] + " " + fecha.getDate() + "/" + pad(fecha.getMonth() + 1);
  }

  function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, function (caracter) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[caracter];
    });
  }

  function nombreBarbero(id) {
    for (var i = 0; i < BARBEROS.length; i++) {
      if (BARBEROS[i].id === id) {
        return BARBEROS[i].nombre + " “" + BARBEROS[i].apodo + "”";
      }
    }

    return "";
  }

  function buscarServicio(id) {
    for (var i = 0; i < SERVICIOS.length; i++) {
      if (SERVICIOS[i].id === id) {
        return SERVICIOS[i];
      }
    }

    return null;
  }

  function cargarCitas() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_CITAS)) || [];
    } catch (error) {
      return [];
    }
  }

  function guardarCitas(lista) {
    try {
      localStorage.setItem(CLAVE_CITAS, JSON.stringify(lista));
    } catch (error) {
      /* Sin almacenamiento disponible */
    }
  }


  /* =======================================================
     1. MENÚ MÓVIL
     ======================================================= */

  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function abrirMenu() {
    if (!burger || !nav) {
      return;
    }

    nav.classList.add("is-open");
    burger.classList.add("is-active");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Cerrar menú");
  }

  function cerrarMenu() {
    if (!burger || !nav) {
      return;
    }

    nav.classList.remove("is-open");
    burger.classList.remove("is-active");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menú");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) {
        cerrarMenu();
      } else {
        abrirMenu();
      }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        cerrarMenu();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        cerrarMenu();
      }
    });

    document.addEventListener("click", function (event) {
      if (
        nav.classList.contains("is-open") &&
        !nav.contains(event.target) &&
        !burger.contains(event.target)
      ) {
        cerrarMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) {
        cerrarMenu();
      }
    });
  }


  /* =======================================================
     2. AÑO AUTOMÁTICO DEL FOOTER
     ======================================================= */

  var currentYear = document.getElementById("current-year");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }


  /* =======================================================
     3. HEADER: EFECTO AL DESPLAZARSE
     ======================================================= */

  var header = document.querySelector(".top");

  function actualizarHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 10) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", actualizarHeader, {
    passive: true
  });

  actualizarHeader();


  /* =======================================================
     4. NAVEGACIÓN ACTIVA
     ======================================================= */

  var navLinks = document.querySelectorAll(".nav a[href^='#']");
  var navSections = [];

  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");

    if (!href || href.length < 2) {
      return;
    }

    var section = document.getElementById(href.substring(1));

    if (section) {
      navSections.push({
        link: link,
        section: section
      });
    }
  });

  function actualizarNavegacion() {
    var position = window.scrollY + 150;
    var current = null;

    navSections.forEach(function (item) {
      if (item.section.offsetTop <= position) {
        current = item;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove("nav-active");
    });

    if (current) {
      current.link.classList.add("nav-active");
    }
  }

  window.addEventListener("scroll", actualizarNavegacion, {
    passive: true
  });

  actualizarNavegacion();


  /* =======================================================
     5. DESPLAZAMIENTO SUAVE
     ======================================================= */

  function desplazarseA(elemento) {
    if (!elemento) {
      return;
    }

    var headerHeight = header ? header.offsetHeight : 0;
    var margen = 16;

    var top =
      elemento.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      margen;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduceMotion ? "auto" : "smooth"
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var href = anchor.getAttribute("href");

      if (!href || href === "#") {
        event.preventDefault();

        window.scrollTo({
          top: 0,
          behavior: reduceMotion ? "auto" : "smooth"
        });

        return;
      }

      var target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();
      desplazarseA(target);
    });
  });


  /* =======================================================
     6. BOTÓN VOLVER ARRIBA
     ======================================================= */

  var backTop = document.getElementById("back-top");

  if (backTop) {
    backTop.addEventListener("click", function (event) {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  }


  /* =======================================================
     7. CONTENIDO: SERVICIOS, BARBEROS, CORTES Y HORARIO
     Se arma a partir de la configuración de arriba
     ======================================================= */

  function renderServicios() {
    var lista = document.getElementById("lista-servicios");
    var opciones = document.getElementById("op-servicio");
    var filas = "";
    var radios = "";

    SERVICIOS.forEach(function (servicio) {
      filas +=
        '<li class="fila">' +
          '<div class="fila-info"><h3>' + servicio.nombre + '</h3><p>' + servicio.desc + '</p></div>' +
          '<span class="fila-mins">' + servicio.mins + ' min</span>' +
          '<span class="fila-precio">' + dinero(servicio.precio) + '</span>' +
          '<button class="btn btn-chico" type="button" data-servicio="' + servicio.id + '" ' +
            'aria-label="Reservar ' + servicio.nombre + '">Reservar</button>' +
        '</li>';

      radios +=
        '<label class="op">' +
          '<input type="radio" name="servicio" value="' + servicio.id + '">' +
          '<span><b>' + servicio.nombre + '</b>' +
          '<small>' + dinero(servicio.precio) + ' / ' + servicio.mins + ' min</small></span>' +
        '</label>';
    });

    if (lista) {
      lista.innerHTML = filas;
    }

    if (opciones) {
      opciones.innerHTML = radios;
    }
  }

  function renderBarberos() {
    var lista = document.getElementById("lista-barberos");
    var opciones = document.getElementById("op-barbero");
    var tarjetas = "";

    var radios =
      '<label class="op">' +
        '<input type="radio" name="barbero" value="any">' +
        '<span><b>El que esté libre</b><small>Más horas disponibles</small></span>' +
      '</label>';

    BARBEROS.forEach(function (barbero, indice) {
      var diasTrabaja = [];
      var chips = "";

      ORDEN_SEMANA.forEach(function (dia) {
        var trabaja = barbero.dias.indexOf(dia) !== -1;

        if (trabaja) {
          diasTrabaja.push(DIAS[dia]);
        }

        chips += '<span class="' + (trabaja ? "on" : "") + '">' + DIAS_CORTO[dia] + '</span>';
      });

      tarjetas +=
        '<article class="barbero">' +
          '<div class="ph ph-' + (indice % 4) + '" role="img" aria-label="Foto de ' + barbero.nombre + ' pendiente">' +
            '<b>' + barbero.nombre.charAt(0) + '</b><small>foto pendiente</small>' +
          '</div>' +
          '<div class="barbero-cuerpo">' +
            '<h3>' + barbero.nombre + '<span class="apodo">“' + barbero.apodo + '”</span></h3>' +
            '<p>' + barbero.especialidad + '</p>' +
            '<p class="dias" aria-label="Trabaja: ' + diasTrabaja.join(", ") + '">' + chips + '</p>' +
            '<button class="btn btn-chico" type="button" data-barbero="' + barbero.id + '">' +
              'Reservar con ' + barbero.nombre +
            '</button>' +
          '</div>' +
        '</article>';

      radios +=
        '<label class="op">' +
          '<input type="radio" name="barbero" value="' + barbero.id + '">' +
          '<span><b>' + barbero.nombre + ' “' + barbero.apodo + '”</b>' +
          '<small>' + barbero.especialidad + '</small></span>' +
        '</label>';
    });

    if (lista) {
      lista.innerHTML = tarjetas;
    }

    if (opciones) {
      opciones.innerHTML = radios;
    }
  }

  function renderFiltros() {
    var contenedor = document.getElementById("filtros");
    var html = "";

    FILTROS.forEach(function (filtro) {
      html +=
        '<button class="filtro" type="button" data-filtro="' + filtro.id + '" ' +
        'aria-pressed="' + (filtro.id === filtroActual) + '">' + filtro.nombre + '</button>';
    });

    if (contenedor) {
      contenedor.innerHTML = html;
    }
  }

  function renderCortes() {
    var contenedor = document.getElementById("lista-cortes");
    var html = "";
    var indice = 0;

    CORTES.forEach(function (corte) {
      if (filtroActual !== "todos" && corte.categoria !== filtroActual) {
        return;
      }

      html +=
        '<article class="corte">' +
          '<div class="ph ph-' + (indice % 4) + '" role="img" aria-label="Foto de ' + corte.nombre + ' pendiente">' +
            '<b>' + corte.nombre.split(" ")[0] + '</b><small>foto pendiente</small>' +
          '</div>' +
          '<div class="corte-cuerpo">' +
            '<h3>' + corte.nombre + '</h3>' +
            '<p>' + corte.desc + '</p>' +
            '<button class="btn btn-chico" type="button" data-corte="' + corte.id + '">Pedir este corte</button>' +
          '</div>' +
        '</article>';

      indice++;
    });

    if (contenedor) {
      contenedor.innerHTML = html;
    }
  }

  function estadoLocal() {
    var ahora = new Date();
    var dia = ahora.getDay();
    var minutos = ahora.getHours() * 60 + ahora.getMinutes();
    var hoy = HORARIO[dia];

    if (hoy && minutos >= hoy[0] * 60 && minutos < hoy[1] * 60) {
      return "Abierto ahora. Cerramos a las " + horaTexto(hoy[1] * 60) + ".";
    }

    for (var i = 0; i <= 7; i++) {
      var d = (dia + i) % 7;
      var h = HORARIO[d];

      if (!h) {
        continue;
      }

      if (i === 0 && minutos >= h[1] * 60) {
        continue;
      }

      var cuando = i === 0 ? "hoy" : i === 1 ? "mañana" : DIAS[d].toLowerCase();

      return "Cerrado. Abrimos " + cuando + " a las " + horaTexto(h[0] * 60) + ".";
    }

    return "Cerrado.";
  }

  function renderVisita() {
    var hoy = new Date().getDay();
    var filas = "";

    ORDEN_SEMANA.forEach(function (dia) {
      var h = HORARIO[dia];

      filas +=
        '<tr class="' + (dia === hoy ? "hoy" : "") + '">' +
          '<th scope="row">' + DIAS[dia] + '</th>' +
          '<td>' + (h ? horaTexto(h[0] * 60) + " a " + horaTexto(h[1] * 60) : "Cerrado") + '</td>' +
        '</tr>';
    });

    var tabla = document.getElementById("tabla-horario");
    var direccion = document.getElementById("direccion");
    var btnWhatsapp = document.getElementById("btn-whatsapp");
    var btnInstagram = document.getElementById("btn-instagram");
    var estado = document.getElementById("estado");
    var estadoVisita = document.getElementById("estado-visita");
    var texto = estadoLocal();

    if (tabla) { tabla.innerHTML = filas; }
    if (direccion) { direccion.textContent = CONFIG.direccion; }
    if (btnWhatsapp) { btnWhatsapp.href = "https://wa.me/" + CONFIG.whatsapp; }
    if (btnInstagram) { btnInstagram.href = "https://instagram.com/" + CONFIG.instagram; }
    if (estado) { estado.textContent = texto; }
    if (estadoVisita) { estadoVisita.textContent = texto; }
  }

  renderServicios();
  renderBarberos();
  renderFiltros();
  renderCortes();
  renderVisita();


  /* =======================================================
     8. CONTADOR ANIMADO DEL HERO
     ======================================================= */

  var countElements = document.querySelectorAll("[data-count]");

  function animarContador(element) {
    var target = parseInt(element.getAttribute("data-count"), 10);

    if (isNaN(target)) {
      return;
    }

    if (reduceMotion) {
      element.textContent = formatoMiles(target);
      return;
    }

    var duration = 1300;
    var startTime = null;

    function actualizarContador(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }

      var progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      var eased = 1 - Math.pow(1 - progress, 3);

      element.textContent = formatoMiles(Math.floor(target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(actualizarContador);
      } else {
        element.textContent = formatoMiles(target);
      }
    }

    window.requestAnimationFrame(actualizarContador);
  }

  if ("IntersectionObserver" in window && countElements.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animarContador(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    countElements.forEach(function (element) {
      counterObserver.observe(element);
    });
  } else {
    countElements.forEach(function (element) {
      animarContador(element);
    });
  }


  /* =======================================================
     9. BOTÓN FLOTANTE DE WHATSAPP
     ======================================================= */

  var waFloat = document.getElementById("wa-float");

  if (waFloat) {
    waFloat.href =
      "https://wa.me/" + CONFIG.whatsapp +
      "?text=" + encodeURIComponent("Hola, quiero información para agendar una cita.");

    var mostrarWhatsApp = function () {
      if (window.scrollY > 250) {
        waFloat.classList.add("visible");
      } else {
        waFloat.classList.remove("visible");
      }
    };

    window.addEventListener("scroll", mostrarWhatsApp, {
      passive: true
    });

    mostrarWhatsApp();
  }


  /* =======================================================
     10. ANIMACIONES DE ENTRADA
     ======================================================= */

  var SELECTOR_ENTRADAS = ".fila, .barbero, .corte, .seccion h2, .intro";
  var revealObserver = null;

  if (!reduceMotion && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -25px 0px"
      }
    );
  }

  function activarEntradas() {
    if (!revealObserver) {
      return;
    }

    document.querySelectorAll(SELECTOR_ENTRADAS).forEach(function (element) {
      if (element.getAttribute("data-entrada")) {
        return;
      }

      element.setAttribute("data-entrada", "1");
      element.style.opacity = "0";
      element.style.transform = "translateY(18px)";
      element.style.transition = "opacity 500ms ease, transform 500ms ease";

      revealObserver.observe(element);
    });
  }

  activarEntradas();


  /* =======================================================
     11. AGENDA: DISPONIBILIDAD DE HORAS
     ======================================================= */

  var formulario = document.getElementById("form-cita");
  var botonEnviar = document.getElementById("btn-submit");
  var estadoForm = document.getElementById("form-status");

  function valorRadio(nombre) {
    var marcado = formulario.querySelector('input[name="' + nombre + '"]:checked');

    return marcado ? marcado.value : "";
  }

  function marcarRadio(nombre, valor) {
    var input = formulario.querySelector('input[name="' + nombre + '"][value="' + valor + '"]');

    if (input) {
      input.checked = true;
    }
  }

  function calcularHoras(servicioId, barberoId, fechaTexto) {
    var servicio = buscarServicio(servicioId);
    var dia = fechaDesdeIso(fechaTexto).getDay();
    var horario = HORARIO[dia];

    if (!horario) {
      return { estado: "cerrado", horas: [] };
    }

    var equipo = BARBEROS.filter(function (barbero) {
      return barbero.dias.indexOf(dia) !== -1 &&
        (barberoId === "any" || barbero.id === barberoId);
    });

    if (!equipo.length) {
      return { estado: "sin-barbero", horas: [] };
    }

    var citas = cargarCitas().filter(function (cita) {
      return cita.date === fechaTexto;
    });

    var ahora = new Date();
    var esHoy = fechaTexto === formatoIso(ahora);
    var minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    var horas = [];

    for (
      var t = horario[0] * 60;
      t + servicio.mins <= horario[1] * 60;
      t += CONFIG.pasoAgenda
    ) {
      if (esHoy && t < minutosAhora + 30) {
        continue;
      }

      var libre = null;

      for (var i = 0; i < equipo.length && !libre; i++) {
        var barberoActual = equipo[i];

        var ocupado = citas.some(function (cita) {
          return cita.barberId === barberoActual.id &&
            t < cita.start + cita.mins &&
            cita.start < t + servicio.mins;
        });

        if (!ocupado) {
          libre = barberoActual;
        }
      }

      if (libre) {
        horas.push({ start: t, barberId: libre.id });
      }
    }

    return { estado: "ok", horas: horas };
  }

  function actualizarHoras() {
    var servicio = valorRadio("servicio");
    var barbero = valorRadio("barbero");
    var fecha = document.getElementById("fecha").value;
    var caja = document.getElementById("horas");
    var mensaje = document.getElementById("msg-horas");

    caja.innerHTML = "";
    mensaje.textContent = "";

    if (!servicio || !barbero || !fecha) {
      mensaje.textContent = "Elige servicio, barbero y día para ver las horas libres.";
      return;
    }

    var resultado = calcularHoras(servicio, barbero, fecha);

    if (resultado.estado === "cerrado") {
      mensaje.textContent = "Ese día estamos cerrados. Prueba con otro.";
      return;
    }

    if (resultado.estado === "sin-barbero") {
      mensaje.textContent = "Ese barbero no trabaja ese día. Prueba otro día u otro barbero.";
      return;
    }

    if (!resultado.horas.length) {
      mensaje.textContent = "No quedan horas libres ese día. Prueba otro día u otro barbero.";
      return;
    }

    var html = "";

    resultado.horas.forEach(function (hora) {
      html +=
        '<label class="hora">' +
          '<input type="radio" name="hora" value="' + hora.start + '">' +
          '<span>' + horaTexto(hora.start) + '</span>' +
        '</label>';
    });

    mensaje.textContent = resultado.horas.length + " horas libres. Elige una.";
    caja.innerHTML = html;
  }


  /* =======================================================
     12. FORMULARIO: VALIDACIÓN
     ======================================================= */

  var campos = {
    servicio: {
      element: document.getElementById("op-servicio"),
      error: document.getElementById("err-servicio"),
      message: "Elige un servicio."
    },
    barbero: {
      element: document.getElementById("op-barbero"),
      error: document.getElementById("err-barbero"),
      message: "Elige un barbero."
    },
    fecha: {
      element: document.getElementById("fecha"),
      error: document.getElementById("err-fecha"),
      message: "Elige un día."
    },
    hora: {
      element: document.getElementById("horas"),
      error: document.getElementById("err-hora"),
      message: "Elige una hora."
    },
    nombre: {
      element: document.getElementById("nombre"),
      error: document.getElementById("err-nombre"),
      message: "Escribe tu nombre."
    },
    telefono: {
      element: document.getElementById("telefono"),
      error: document.getElementById("err-telefono"),
      message: "Escribe un teléfono de al menos 8 números."
    }
  };

  var ORDEN_CAMPOS = ["servicio", "barbero", "fecha", "hora", "nombre", "telefono"];

  function leerCampo(key) {
    if (key === "servicio" || key === "barbero" || key === "hora") {
      return valorRadio(key);
    }

    return campos[key].element.value.trim();
  }

  function limpiarError(field) {
    if (!field.element) {
      return;
    }

    if (field.error) {
      field.error.textContent = "";
    }

    field.element.removeAttribute("aria-invalid");
  }

  function mostrarError(field, message) {
    if (!field.element) {
      return;
    }

    if (field.error) {
      field.error.textContent = message || field.message;
    }

    field.element.setAttribute("aria-invalid", "true");
  }

  function validarCampo(key) {
    var field = campos[key];

    if (!field || !field.element) {
      return true;
    }

    var value = leerCampo(key);

    if (!value) {
      mostrarError(field);
      return false;
    }

    if (key === "fecha" && value < formatoIso(new Date())) {
      mostrarError(field, "Ese día ya pasó.");
      return false;
    }

    if (key === "nombre" && value.length < 2) {
      mostrarError(field);
      return false;
    }

    if (key === "telefono" && value.replace(/\D/g, "").length < 8) {
      mostrarError(field);
      return false;
    }

    limpiarError(field);
    return true;
  }

  function limpiarEstado() {
    if (estadoForm) {
      estadoForm.textContent = "";
    }
  }

  ["fecha", "nombre", "telefono"].forEach(function (key) {
    var field = campos[key];

    if (!field.element) {
      return;
    }

    field.element.addEventListener("blur", function () {
      validarCampo(key);
    });

    field.element.addEventListener("input", function () {
      if (
        field.error &&
        field.error.textContent.trim() !== ""
      ) {
        validarCampo(key);
      }

      limpiarEstado();
    });
  });

  if (formulario) {
    formulario.addEventListener("change", function (event) {
      var nombre = event.target.name;

      if (nombre === "servicio" || nombre === "barbero" || nombre === "fecha") {
        actualizarHoras();
      }

      if (
        nombre === "servicio" || nombre === "barbero" ||
        nombre === "fecha" || nombre === "hora"
      ) {
        validarCampo(nombre);
        limpiarEstado();
      }
    });
  }


  /* =======================================================
     13. FORMULARIO: CONFIRMAR CITA Y TICKET
     ======================================================= */

  function mostrarTicket(cita) {
    var zona = document.getElementById("ticket-zona");

    var mensaje =
      "Hola, agendé la cita " + cita.id + ": " + cita.servicioNombre +
      " con " + nombreBarbero(cita.barberId) + ", " + fechaLarga(cita.date) +
      " a las " + horaTexto(cita.start) + ". A nombre de " + cita.nombre + ".";

    zona.innerHTML =
      '<div class="ticket">' +
        '<p class="ticket-top">Tu silla está guardada</p>' +
        '<p class="ticket-folio">' + cita.id + '</p>' +
        '<div class="ticket-perf"></div>' +
        '<dl>' +
          '<dt>Servicio</dt><dd>' + escapar(cita.servicioNombre) + '</dd>' +
          '<dt>Barbero</dt><dd>' + escapar(nombreBarbero(cita.barberId)) + '</dd>' +
          '<dt>Día</dt><dd>' + fechaLarga(cita.date) + '</dd>' +
          '<dt>Hora</dt><dd>' + horaTexto(cita.start) + '</dd>' +
          '<dt>Nombre</dt><dd>' + escapar(cita.nombre) + '</dd>' +
          '<dt>Total</dt><dd>' + dinero(cita.precio) + '</dd>' +
        '</dl>' +
        '<div class="ticket-codigo" aria-hidden="true"></div>' +
        '<p class="ticket-pie">Llega 5 minutos antes. Si no puedes venir, cancela desde la lista de abajo.</p>' +
        '<a class="btn btn-chico" target="_blank" rel="noopener" ' +
          'href="https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(mensaje) + '">' +
          'Avisar por WhatsApp</a>' +
      '</div>';
  }

  function renderMisCitas() {
    var lista = document.getElementById("mis-citas");
    var hoy = formatoIso(new Date());

    var proximas = cargarCitas()
      .filter(function (cita) {
        return cita.date >= hoy;
      })
      .sort(function (a, b) {
        return a.date.localeCompare(b.date) || a.start - b.start;
      });

    if (!proximas.length) {
      lista.innerHTML = '<li class="vacio">Aún no tienes citas. Agenda la primera arriba.</li>';
      return;
    }

    var html = "";

    proximas.forEach(function (cita) {
      html +=
        '<li>' +
          '<span><b>' + cita.id + '</b> ' + fechaLarga(cita.date) + ', ' + horaTexto(cita.start) +
          '<br>' + escapar(cita.servicioNombre) + ' con ' + escapar(nombreBarbero(cita.barberId)) + '</span>' +
          '<button class="cancelar" type="button" data-cancelar="' + cita.id + '">Cancelar</button>' +
        '</li>';
    });

    lista.innerHTML = html;
  }

  if (formulario) {
    formulario.addEventListener("submit", function (event) {
      event.preventDefault();

      var valid = true;

      ORDEN_CAMPOS.forEach(function (key) {
        if (!validarCampo(key)) {
          valid = false;
        }
      });

      if (!valid) {
        if (estadoForm) {
          estadoForm.textContent = "Revisa los campos marcados antes de continuar.";
        }

        var firstInvalid = formulario.querySelector('[aria-invalid="true"]');

        if (firstInvalid) {
          if (firstInvalid.tagName === "INPUT" || firstInvalid.tagName === "TEXTAREA") {
            firstInvalid.focus();
          } else {
            var primerRadio = firstInvalid.querySelector("input");

            if (primerRadio) {
              primerRadio.focus();
            }
          }
        }

        return;
      }

      var servicioId = valorRadio("servicio");
      var barberoId = valorRadio("barbero");
      var fechaTexto = document.getElementById("fecha").value;
      var horaElegida = valorRadio("hora");

      /* Revisa otra vez que la hora siga libre */
      var resultado = calcularHoras(servicioId, barberoId, fechaTexto);
      var elegida = null;

      resultado.horas.forEach(function (hora) {
        if (String(hora.start) === horaElegida) {
          elegida = hora;
        }
      });

      if (!elegida) {
        if (estadoForm) {
          estadoForm.textContent = "Esa hora acaba de ocuparse. Elige otra.";
        }

        actualizarHoras();
        return;
      }

      var servicio = buscarServicio(servicioId);

      var cita = {
        id: "SB-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
        servicioNombre: servicio.nombre,
        mins: servicio.mins,
        precio: servicio.precio,
        barberId: elegida.barberId,
        date: fechaTexto,
        start: elegida.start,
        nombre: campos.nombre.element.value.trim(),
        tel: campos.telefono.element.value.trim(),
        notas: document.getElementById("notas").value.trim()
      };

      var citas = cargarCitas();
      citas.push(cita);
      guardarCitas(citas);

      limpiarEstado();
      formulario.reset();
      actualizarHoras();
      mostrarTicket(cita);
      renderMisCitas();

      if (botonEnviar) {
        botonEnviar.blur();
      }

      var zona = document.getElementById("ticket-zona");

      zona.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center"
      });

      zona.focus({ preventScroll: true });
    });
  }


  /* =======================================================
     14. INTERACCIONES: RESERVAR, FILTRAR Y CANCELAR
     ======================================================= */

  function irAAgendar() {
    desplazarseA(document.getElementById("agendar"));

    var titulo = document.getElementById("agendar-titulo");

    if (titulo) {
      titulo.focus({ preventScroll: true });
    }
  }

  document.addEventListener("click", function (event) {
    var objetivo = event.target;

    var botonFiltro = objetivo.closest("[data-filtro]");

    if (botonFiltro) {
      filtroActual = botonFiltro.getAttribute("data-filtro");
      renderFiltros();
      renderCortes();
      activarEntradas();
      return;
    }

    var botonCancelar = objetivo.closest("[data-cancelar]");

    if (botonCancelar) {
      if (window.confirm("¿Cancelar esta cita?")) {
        var idCancelar = botonCancelar.getAttribute("data-cancelar");

        guardarCitas(cargarCitas().filter(function (cita) {
          return cita.id !== idCancelar;
        }));

        renderMisCitas();
        actualizarHoras();
      }

      return;
    }

    var accion = objetivo.closest("[data-servicio], [data-barbero], [data-corte]");

    if (!accion) {
      return;
    }

    if (accion.hasAttribute("data-servicio")) {
      marcarRadio("servicio", accion.getAttribute("data-servicio"));
      limpiarError(campos.servicio);
    }

    if (accion.hasAttribute("data-barbero")) {
      marcarRadio("barbero", accion.getAttribute("data-barbero"));
      limpiarError(campos.barbero);
    }

    if (accion.hasAttribute("data-corte")) {
      var idCorte = accion.getAttribute("data-corte");

      CORTES.forEach(function (corte) {
        if (corte.id === idCorte) {
          marcarRadio("servicio", corte.servicio);
          limpiarError(campos.servicio);
          document.getElementById("notas").value = "Quiero: " + corte.nombre;
        }
      });
    }

    actualizarHoras();
    irAAgendar();
  });


  /* =======================================================
     15. INICIO
     ======================================================= */

  (function iniciarAgenda() {
    var hoy = new Date();
    var maximo = new Date(hoy.getTime());
    var campoFecha = document.getElementById("fecha");

    maximo.setDate(maximo.getDate() + 30);

    campoFecha.min = formatoIso(hoy);
    campoFecha.max = formatoIso(maximo);

    actualizarHoras();
    renderMisCitas();
  })();

})();