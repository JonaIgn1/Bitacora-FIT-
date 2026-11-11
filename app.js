'use strict';

/* ==========================================================================
   RegistroFit · Bitácora de entrenamiento
   Secciones: 1) Constantes y utilidades  2) Validación  3) Base de datos
              4) Formulario  5) Historial  6) Archivos  7) Catálogo  8) Inicio
   ========================================================================== */

/* ---------- 1) Constantes y utilidades ---------- */

const MUSCULOS = ['Pecho', 'Espalda', 'Piernas', 'Glúteos', 'Hombros', 'Bíceps', 'Tríceps', 'Abdomen', 'Pantorrillas', 'Cardio', 'Cuerpo completo'];
const CLAVE_LOCALSTORAGE_ANTERIOR = 'registrofit.sesiones.v1';
const BD = { nombre: 'RegistroFitDB', version: 1, almacen: 'datos', llave: 'historial' };
const MAX_ARCHIVO = 2 * 1024 * 1024;
const MAX_EJERCICIOS = 100;
const MAX_SESIONES_RESPALDO = 10000;
const CAMPOS_NUMERICOS = ['series', 'repeticiones', 'peso'];

let sesiones = [];
let editando = null;
let secuencia = 0;
let baseRegistroFit = null;

const $ = id => document.getElementById(id);

// Crea un elemento con clase y texto (el texto siempre se asigna como textContent, nunca como HTML).
function crear(etiqueta, clase = '', texto = '') {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== '') nodo.textContent = texto;
    return nodo;
}

function boton(texto, clase, accion) {
    const b = crear('button', `btn btn-sm ${clase}`, texto);
    b.type = 'button';
    b.addEventListener('click', accion);
    return b;
}

function hoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function avisar(texto, tipo = 'success') {
    $('aviso').className = `alert alert-${tipo}`;
    $('aviso').textContent = texto;
}

function descargar(datos, nombre) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }));
    const a = crear('a');
    a.href = url;
    a.download = nombre;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function retrasar(funcion, ms) {
    let temporizador;
    return () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(funcion, ms);
    };
}

/* ---------- 2) Validación ---------- */

const textoValido = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const enteroEnRango = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

function fechaValida(v) {
    return typeof v === 'string'
        && /^\d{4}-\d{2}-\d{2}$/.test(v)
        && v >= '1900-01-01' && v <= '2100-12-31'
        && !Number.isNaN(Date.parse(v))
        && new Date(v).toISOString().slice(0, 10) === v;
}

function pesoValido(p) {
    return typeof p === 'number' && Number.isFinite(p) && p >= 0 && p <= 2000
        && Math.abs(p * 100 - Math.round(p * 100)) < 0.000001; // máximo 2 decimales
}

function ejercicioValido(e) {
    return Boolean(e)
        && textoValido(e.nombre, 80)
        && MUSCULOS.includes(e.musculo)
        && enteroEnRango(e.series, 1, 100)
        && enteroEnRango(e.repeticiones, 1, 1000)
        && pesoValido(e.peso);
}

function rutinaValida(r) {
    return Boolean(r)
        && textoValido(r.nombre, 80)
        && typeof r.notas === 'string' && r.notas.length <= 1000
        && Array.isArray(r.ejercicios)
        && r.ejercicios.length >= 1 && r.ejercicios.length <= MAX_EJERCICIOS
        && r.ejercicios.every(ejercicioValido);
}

const sesionValida = s => rutinaValida(s) && textoValido(s.id, 100) && fechaValida(s.fecha);

const historialValido = datos =>
    Array.isArray(datos)
    && datos.every(sesionValida)
    && new Set(datos.map(s => s.id)).size === datos.length;

/* ---------- 3) Base de datos (IndexedDB) ---------- */

function abrirBase() {
    return new Promise((resolve, reject) => {
        const solicitud = indexedDB.open(BD.nombre, BD.version);
        solicitud.onupgradeneeded = () => solicitud.result.createObjectStore(BD.almacen);
        solicitud.onsuccess = () => {
            const base = solicitud.result;
            // Si otra pestaña actualiza la base, esta conexión se cierra para no bloquearla.
            base.onversionchange = () => base.close();
            resolve(base);
        };
        solicitud.onerror = () => reject(solicitud.error);
    });
}

// Ejecuta una operación dentro de una transacción y espera a que termine de verdad.
function accederHistorial(modo, operar) {
    return new Promise((resolve, reject) => {
        const transaccion = baseRegistroFit.transaction(BD.almacen, modo);
        const solicitud = operar(transaccion.objectStore(BD.almacen));
        transaccion.oncomplete = () => resolve(solicitud.result);
        transaccion.onerror = () => reject(transaccion.error);
        transaccion.onabort = () => reject(transaccion.error);
    });
}

const leerHistorial = () => accederHistorial('readonly', almacen => almacen.get(BD.llave));
const escribirHistorial = datos => accederHistorial('readwrite', almacen => almacen.put(datos, BD.llave));

async function persistir(nuevas) {
    try {
        await escribirHistorial(nuevas);
    } catch {
        avisar('No fue posible guardar el historial.', 'danger');
        return false;
    }
    sesiones = nuevas;
    renderizar();
    return true;
}

/* ---------- 4) Formulario ---------- */

function agregarEjercicio(e = {}) {
    const contenedor = $('ejercicios');
    if (contenedor.children.length >= MAX_EJERCICIOS) {
        avisar(`Puedes agregar hasta ${MAX_EJERCICIOS} ejercicios por sesión.`, 'warning');
        return;
    }

    const id = ++secuencia;
    const bloque = $('plantilla-ejercicio').content.firstElementChild.cloneNode(true);

    // Ids únicos para que cada etiqueta apunte a su campo.
    bloque.querySelectorAll('[data-campo]').forEach(campo => {
        campo.id = `${campo.dataset.campo}-${id}`;
        campo.closest('div').querySelector('label').htmlFor = campo.id;
    });

    const select = bloque.querySelector('select');
    MUSCULOS.forEach(m => select.add(new Option(m, m)));

    bloque.querySelectorAll('[data-campo]').forEach(campo => {
        campo.value = e[campo.dataset.campo] ?? (campo.dataset.campo === 'peso' ? 0 : '');
    });

    bloque.querySelector('.quitar').addEventListener('click', () => {
        if (contenedor.children.length === 1) {
            avisar('El entrenamiento debe tener al menos un ejercicio.', 'warning');
            return;
        }
        bloque.remove();
    });

    contenedor.append(bloque);
}

function leerRutina() {
    // La validación nativa también se aplica al descargar, sin guardar primero.
    if (!$('formulario').reportValidity()) return null;

    const rutina = {
        nombre: $('nombre').value.trim(),
        notas: $('notas').value.trim(),
        ejercicios: [...$('ejercicios').children].map(bloque => {
            const ejercicio = {};
            bloque.querySelectorAll('[data-campo]').forEach(campo => {
                ejercicio[campo.dataset.campo] = CAMPOS_NUMERICOS.includes(campo.dataset.campo)
                    ? Number(campo.value)
                    : campo.value.trim();
            });
            return ejercicio;
        })
    };

    if (!rutinaValida(rutina) || !fechaValida($('fecha').value)) {
        avisar('Revisa los nombres, la fecha y los valores de los ejercicios.', 'warning');
        return null;
    }
    return rutina;
}

function cargar(r, id = null) {
    editando = id;
    $('nombre').value = r.nombre || '';
    $('notas').value = r.notas || '';
    $('fecha').value = id ? r.fecha : hoy();
    $('ejercicios').replaceChildren();
    (r.ejercicios || [{}]).forEach(e => agregarEjercicio(e));
    $('titulo-form').textContent = id ? 'Editar entrenamiento' : 'Nuevo entrenamiento';
    $('guardar').textContent = id ? 'Guardar cambios' : 'Guardar entrenamiento';
}

function formularioTieneContenido() {
    if ($('nombre').value.trim() || $('notas').value.trim()) return true;
    return [...$('ejercicios').querySelectorAll('[data-campo]')].some(campo =>
        campo.dataset.campo === 'peso'
            ? campo.value !== '' && Number(campo.value) !== 0
            : campo.value.trim() !== ''
    );
}

async function guardarSesion(event) {
    event.preventDefault();
    const rutina = leerRutina();
    if (!rutina) return;

    const sesion = { ...rutina, id: editando || uid(), fecha: $('fecha').value };
    const nuevas = editando
        ? sesiones.map(x => (x.id === editando ? sesion : x))
        : [...sesiones, sesion];

    if (await persistir(nuevas)) {
        cargar({});
        avisar('Entrenamiento guardado correctamente.');
    }
}

/* ---------- 5) Historial ---------- */

function filtrarSesiones() {
    const musculo = $('filtro').value;
    const consulta = $('busqueda').value.trim().toLocaleLowerCase('es');

    return sesiones
        .filter(s => !musculo || s.ejercicios.some(e => e.musculo === musculo))
        .filter(s => !consulta || `${s.nombre} ${s.ejercicios.map(e => e.nombre).join(' ')}`.toLocaleLowerCase('es').includes(consulta))
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

function crearTabla(sesion) {
    const envoltura = crear('div', 'table-responsive');
    const tabla = crear('table', 'table table-sm align-middle');
    tabla.append(crear('caption', 'visually-hidden', `Ejercicios de ${sesion.nombre}`));

    const encabezado = crear('tr');
    ['Ejercicio', 'Músculo', 'Series', 'Reps.', 'kg'].forEach(titulo => {
        const th = crear('th', '', titulo);
        th.scope = 'col';
        encabezado.append(th);
    });
    const cabecera = crear('thead');
    cabecera.append(encabezado);
    tabla.append(cabecera);

    const cuerpo = crear('tbody');
    sesion.ejercicios.forEach(e => {
        const fila = crear('tr');
        [e.nombre, e.musculo, e.series, e.repeticiones, e.peso].forEach(valor => fila.append(crear('td', '', String(valor))));
        cuerpo.append(fila);
    });
    tabla.append(cuerpo);
    envoltura.append(tabla);
    return envoltura;
}

function crearTarjetaSesion(s) {
    const tarjeta = crear('article', 'card border-secondary bg-body-tertiary');
    const cuerpo = crear('div', 'card-body');
    const acciones = crear('div', 'd-flex flex-wrap gap-2');

    acciones.append(
        boton('Editar', 'btn-outline-info', () => {
            cargar(s, s.id);
            $('nombre').focus();
        }),
        boton('Reutilizar', 'btn-outline-light', () => {
            cargar(s);
            $('nombre').focus();
            avisar('Rutina cargada con la fecha de hoy. Guárdala para registrar una nueva sesión.');
        }),
        boton('Descargar rutina', 'btn-outline-light', () => exportarRutina(s)),
        boton('Eliminar', 'btn-outline-danger', async () => {
            if (!confirm(`¿Eliminar la sesión «${s.nombre}» del ${s.fecha}?`)) return;
            if (await persistir(sesiones.filter(x => x.id !== s.id))) {
                if (editando === s.id) cargar({});
                avisar('Sesión eliminada.');
            }
        })
    );

    cuerpo.append(
        crear('h3', 'h5', s.nombre),
        crear('p', 'text-info small', `${s.fecha.split('-').reverse().join('/')} · ${s.ejercicios.length} ejercicios`),
        crearTabla(s)
    );
    if (s.notas) cuerpo.append(crear('p', 'small text-body-secondary text-break', s.notas));
    cuerpo.append(acciones);

    tarjeta.append(cuerpo);
    return tarjeta;
}

function renderizar() {
    $('total').textContent = sesiones.length;
    const visibles = filtrarSesiones();
    $('resultados').textContent = `${visibles.length} de ${sesiones.length} sesiones. El filtro muestra la sesión completa si incluye el músculo elegido.`;

    const fragmento = document.createDocumentFragment();
    if (!visibles.length) {
        fragmento.append(crear(
            'p',
            'border border-secondary rounded p-4 text-body-secondary',
            sesiones.length
                ? 'No hay sesiones que coincidan con los filtros.'
                : 'Tu historial comienza aquí. Registra tu primer entrenamiento.'
        ));
    }
    visibles.forEach(s => fragmento.append(crearTarjetaSesion(s)));
    $('lista').replaceChildren(fragmento);
}

/* ---------- 6) Exportar e importar archivos ---------- */

function exportarRutina(r) {
    descargar({
        aplicacion: 'RegistroFit',
        version: 1,
        tipo: 'rutina',
        rutina: { nombre: r.nombre, notas: r.notas, ejercicios: r.ejercicios }
    }, 'rutina-registrofit.json');
}

function exportarRespaldo() {
    descargar({ aplicacion: 'RegistroFit', version: 1, tipo: 'respaldo', sesiones }, `respaldo-registrofit-${hoy()}.json`);
}

function respaldoValido(datos) {
    return Array.isArray(datos.sesiones)
        && datos.sesiones.length <= MAX_SESIONES_RESPALDO
        && datos.sesiones.every(sesionValida)
        && new Set(datos.sesiones.map(s => s.id)).size === datos.sesiones.length;
}

async function importarArchivo(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    try {
        if (archivo.size > MAX_ARCHIVO) throw new Error('El archivo supera el máximo de 2 MB.');

        const datos = JSON.parse(await archivo.text());
        if (!datos || datos.aplicacion !== 'RegistroFit' || datos.version !== 1) {
            throw new Error('El archivo no es un documento compatible de RegistroFit.');
        }

        if (datos.tipo === 'rutina' && rutinaValida(datos.rutina)) {
            if (!confirm('Se cargarán los ejercicios en el formulario. Los cambios sin guardar se reemplazarán. ¿Continuar?')) return;
            cargar(datos.rutina);
            avisar('Rutina importada. Revisa la fecha y guarda cuando termines de entrenar.');
            $('nombre').focus();
        } else if (datos.tipo === 'respaldo' && respaldoValido(datos)) {
            const existentes = new Set(sesiones.map(s => s.id));
            const nuevas = datos.sesiones.filter(s => !existentes.has(s.id));
            if (await persistir([...sesiones, ...nuevas])) {
                avisar(`Respaldo importado: ${nuevas.length} sesiones agregadas. ${datos.sesiones.length - nuevas.length} ya existían y se conservaron sin cambios.`);
            }
        } else {
            throw new Error('El archivo contiene una estructura o valores inválidos. No se modificó el historial.');
        }
    } catch (error) {
        avisar(error instanceof SyntaxError ? 'El archivo no contiene JSON válido.' : error.message, 'danger');
    } finally {
        event.target.value = '';
    }
}

/* ---------- 7) Catálogo de rutinas predefinidas ---------- */

function cargarPlantilla(sesion) {
    if (formularioTieneContenido() && !confirm('Se reemplazará el contenido del formulario. Las sesiones guardadas se conservarán. ¿Continuar?')) return;

    cargar(sesion);

    // La carga es individual: no se propone un peso fijo para principiantes.
    $('ejercicios').querySelectorAll('[data-campo="peso"]').forEach(campo => {
        campo.value = '';
        campo.placeholder = 'Tu carga';
    });

    avisar(`${sesion.nombre} cargada con la fecha de hoy. Revisa los ejercicios y registra los pesos antes de guardar.`);
    $('nombre').focus();
}

function crearDetalleSesion(sesion) {
    const detalle = crear('details', 'border border-secondary rounded p-3 mb-3');
    const lista = crear('ul', 'small mt-3 ps-3');

    sesion.ejercicios.forEach(e => {
        lista.append(crear('li', 'mb-2', `${e.nombre} · ${e.musculo} · ${e.series} × ${e.repeticiones}`));
    });

    const cargarSesion = boton('Cargar esta sesión', 'btn-outline-info', () => cargarPlantilla(sesion));
    cargarSesion.setAttribute('aria-label', `Cargar ${sesion.nombre}`);

    detalle.append(crear('summary', 'fw-semibold', sesion.nombre), lista, cargarSesion);
    return detalle;
}

function crearTarjetaRutina(rutina) {
    const columna = crear('div', 'col-12 col-lg-4');
    const tarjeta = crear('article', 'card bg-body-tertiary border-secondary h-100');

    

    const contenido = crear('div', 'card-body d-flex flex-column p-4');
    contenido.append(
        crear('h3', 'h4 text-info', rutina.nombre),
        crear('p', 'fw-semibold', rutina.subtitulo),
        crear('p', '', rutina.descripcion),
        crear('p', 'small text-body-secondary', rutina.organizacion)
    );

    const listaSesiones = crear('div', 'mt-3');
    rutina.sesiones.forEach(sesion => listaSesiones.append(crearDetalleSesion(sesion)));

    const sesionesRutina = crear('details');
    sesionesRutina.append(crear('summary', 'fw-semibold', 'Ver sesiones de ejemplo'), listaSesiones);

    const pie = crear('div', 'card-footer p-4');
    pie.append(sesionesRutina);

    tarjeta.append(contenido, pie);
    columna.append(tarjeta);
    return columna;
}

function mostrarRutinasPredefinidas() {
    const fragmento = document.createDocumentFragment();
    RUTINAS_PREDEFINIDAS.forEach(rutina => fragmento.append(crearTarjetaRutina(rutina)));
    $('catalogo-rutinas').replaceChildren(fragmento);
}

/* ---------- 8) Inicio ---------- */

async function iniciarHistorial() {
    const principal = $('principal');
    principal.inert = true;
    cargar({});

    try {
        baseRegistroFit = await abrirBase();
        let datos = await leerHistorial();
        const migrar = datos === undefined;

        // Primera vez en IndexedDB: se recupera el historial de la versión anterior (localStorage).
        if (migrar) {
            const anterior = localStorage.getItem(CLAVE_LOCALSTORAGE_ANTERIOR);
            datos = anterior === null ? [] : JSON.parse(anterior);
        }

        if (!historialValido(datos)) throw new Error('El historial guardado no es válido.');
        if (migrar) await escribirHistorial(datos);

        sesiones = datos;
        renderizar();
        principal.inert = false;

        // Pide al navegador no borrar estos datos si hay poco espacio (no muestra avisos).
        Promise.resolve(navigator.storage?.persist?.()).catch(() => {});
    } catch {
        avisar('No se pudo cargar el historial de entrenamientos.', 'danger');
    }
}

function conectarEventos() {
    $('formulario').addEventListener('submit', guardarSesion);
    $('agregar').addEventListener('click', () => agregarEjercicio());
    $('limpiar').addEventListener('click', () => cargar({}));
    $('descargar-rutina').addEventListener('click', () => {
        const rutina = leerRutina();
        if (rutina) exportarRutina(rutina);
    });
    $('filtro').addEventListener('change', renderizar);
    $('busqueda').addEventListener('input', retrasar(renderizar, 150));
    $('respaldo').addEventListener('click', exportarRespaldo);
    $('archivo').addEventListener('change', importarArchivo);
}

MUSCULOS.forEach(m => $('filtro').add(new Option(m, m)));
conectarEventos();
mostrarRutinasPredefinidas();
iniciarHistorial();
