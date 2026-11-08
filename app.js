'use strict';
// Cada sesión contiene varios ejercicios. La rutina exportada funciona como plantilla.
const $ = id => document.getElementById(id);
const MUSCULOS = ['Pecho', 'Espalda', 'Piernas', 'Glúteos', 'Hombros', 'Bíceps', 'Tríceps', 'Abdomen', 'Pantorrillas', 'Cardio', 'Cuerpo completo'];
const CLAVE = 'registrofit.sesiones.v1';
let sesiones = [],
    editando = null,
    secuencia = 0;
const hoy = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function avisar(texto, tipo = 'success') {
    $('aviso').className = `alert alert-${tipo}`;
    $('aviso').textContent = texto;
}

function textoValido(v, max) {
    return typeof v === 'string' && v.trim().length > 0 && v.length <= max;
}

function fechaValida(v) {
    return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= '1900-01-01' && v <= '2100-12-31' && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
}

function ejercicioValido(e) {
    return e && textoValido(e.nombre, 80) && MUSCULOS.includes(e.musculo) && Number.isInteger(e.series) && e.series >= 1 && e.series <= 100 && Number.isInteger(e.repeticiones) && e.repeticiones >= 1 && e.repeticiones <= 1000 && typeof e.peso === 'number' && Number.isFinite(e.peso) && e.peso >= 0 && e.peso <= 2000 && Math.abs(e.peso * 100 - Math.round(e.peso * 100)) < 0.000001;
}

function rutinaValida(r) {
    return r && textoValido(r.nombre, 80) && typeof r.notas === 'string' && r.notas.length <= 1000 && Array.isArray(r.ejercicios) && r.ejercicios.length >= 1 && r.ejercicios.length <= 100 && r.ejercicios.every(ejercicioValido);
}

function sesionValida(s) {
    return rutinaValida(s) && textoValido(s.id, 100) && fechaValida(s.fecha);
}

function persistir(nuevas) {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(nuevas));
        sesiones = nuevas;
        renderizar();
        return true;
    } catch {
        avisar('No fue posible guardar. Revisa el espacio o los permisos del navegador y descarga un respaldo.', 'danger');
        return false;
    }
}

function agregarEjercicio(e = {}) {
    if ($('ejercicios').children.length >= 100) {
        avisar('Puedes agregar hasta 100 ejercicios por sesión.', 'warning');
        return;
    }
    const id = ++secuencia;
    const bloque = document.createElement('div');
    bloque.className = 'border border-secondary rounded p-3 mb-3';
    // El HTML de la estructura es constante. Los datos del usuario se asignan con value/textContent.
    bloque.innerHTML = `
<div class="d-flex justify-content-between align-items-center mb-2">
    <h3 class="h6 mb-0">
        Ejercicio
    </h3>
    <button class="btn btn-sm btn-outline-light quitar" type="button">
        Quitar
    </button>
</div>
<div class="row g-2">
    <div class="col-12">
        <label class="form-label" for="ej-${id}">
            Nombre del ejercicio
        </label>
        <input class="form-control" data-campo="nombre" id="ej-${id}" maxlength="80" placeholder="Ej. Press de banca" required=""/>
    </div>
    <div class="col-12">
        <label class="form-label" for="mus-${id}">
            Músculo
        </label>
        <select class="form-select" data-campo="musculo" id="mus-${id}" required="">
            <option value="">
                Seleccionar músculo
            </option>
        </select>
    </div>
    <div class="col-12 col-md-4">
        <label class="form-label" for="ser-${id}">
            Series
        </label>
        <input class="form-control" data-campo="series" id="ser-${id}" max="100" min="1" required="" step="1" type="number"/>
    </div>
    <div class="col-12 col-md-4">
        <label class="form-label" for="rep-${id}">
            Repeticiones
        </label>
        <input class="form-control" data-campo="repeticiones" id="rep-${id}" max="1000" min="1" required="" step="1" type="number"/>
    </div>
    <div class="col-12 col-md-4">
        <label class="form-label" for="pes-${id}">
            Peso (kg)
        </label>
        <input class="form-control" data-campo="peso" id="pes-${id}" max="2000" min="0" required="" step="0.01" type="number"/>
    </div>
</div>
`;
    const select = bloque.querySelector('select');
    MUSCULOS.forEach(m => select.add(new Option(m, m)));
    for (const campo of bloque.querySelectorAll('[data-campo]')) campo.value = e[campo.dataset.campo] ?? (campo.dataset.campo === 'peso' ? 0 : '');
    bloque.querySelector('.quitar').addEventListener('click', () => {
        if ($('ejercicios').children.length === 1) {
            avisar('El entrenamiento debe tener al menos un ejercicio.', 'warning');
            return;
        }
        bloque.remove();
    });
    $('ejercicios').append(bloque);
}

function leerRutina() {
    // Se aplica la validación nativa también al descargar, sin guardar primero.
    if (!$('formulario').reportValidity()) return null;
    const r = {
        nombre: $('nombre').value.trim(),
        notas: $('notas').value.trim(),
        ejercicios: [...$('ejercicios').children].map(b => {
            const e = {};
            b.querySelectorAll('[data-campo]').forEach(c => e[c.dataset.campo] = ['series', 'repeticiones', 'peso'].includes(c.dataset.campo) ? Number(c.value) : c.value.trim());
            return e;
        })
    };
    if (!rutinaValida(r) || !fechaValida($('fecha').value)) {
        avisar('Revisa los nombres, la fecha y los valores de los ejercicios.', 'warning');
        return null;
    }
    return r;
}

function cargar(r, id = null) {
    editando = id;
    $('nombre').value = r.nombre || '';
    $('notas').value = r.notas || '';
    $('fecha').value = id ? r.fecha : hoy();
    $('ejercicios').replaceChildren();
    (r.ejercicios || [{}]).forEach(agregarEjercicio);
    $('titulo-form').textContent = id ? 'Editar entrenamiento' : 'Nuevo entrenamiento';
    $('guardar').textContent = id ? 'Guardar cambios' : 'Guardar entrenamiento';
}

function descargar(datos, nombre) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], {
        type: 'application/json'
    }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportarRutina(r) {
    descargar({
        aplicacion: 'RegistroFit',
        version: 1,
        tipo: 'rutina',
        rutina: {
            nombre: r.nombre,
            notas: r.notas,
            ejercicios: r.ejercicios
        }
    }, 'rutina-registrofit.json');
}

function boton(texto, clase, accion) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `btn btn-sm ${clase}`;
    b.textContent = texto;
    b.addEventListener('click', accion);
    return b;
}

function renderizar() {
    $('total').textContent = sesiones.length;
    const consulta = $('busqueda').value.trim().toLocaleLowerCase('es');
    const visibles = sesiones.filter(s => (!$('filtro').value || s.ejercicios.some(e => e.musculo === $('filtro').value)) && (!consulta || `${s.nombre} ${s.ejercicios.map(e=>e.nombre).join(' ')}`.toLocaleLowerCase('es').includes(consulta))).sort((a, b) => b.fecha.localeCompare(a.fecha));
    $('resultados').textContent = `${visibles.length} de ${sesiones.length} sesiones. El filtro muestra la sesión completa si incluye el músculo elegido.`;
    $('lista').replaceChildren();
    if (!visibles.length) {
        const p = document.createElement('p');
        p.className = 'border border-secondary rounded p-4 text-body-secondary';
        p.textContent = sesiones.length ? 'No hay sesiones que coincidan con los filtros.' : 'Tu historial comienza aquí. Registra tu primer entrenamiento.';
        $('lista').append(p);
    }
    visibles.forEach(s => {
        const card = document.createElement('article');
        card.className = 'card border-secondary bg-body-tertiary';
        const body = document.createElement('div');
        body.className = 'card-body';
        const h = document.createElement('h3');
        h.className = 'h5';
        h.textContent = s.nombre;
        const p = document.createElement('p');
        p.className = 'text-info small';
        p.textContent = `${s.fecha.split('-').reverse().join('/')} · ${s.ejercicios.length} ejercicios`;
        const wrap = document.createElement('div');
        wrap.className = 'table-responsive';
        const table = document.createElement('table');
        table.className = 'table table-sm align-middle';
        const caption = document.createElement('caption');
        caption.className = 'visually-hidden';
        caption.textContent = `Ejercicios de ${s.nombre}`;
        table.append(caption);
        const head = document.createElement('thead');
        head.innerHTML = '<tr><th scope="col">Ejercicio</th><th scope="col">Músculo</th><th scope="col">Series</th><th scope="col">Reps.</th><th scope="col">kg</th></tr>';
        table.append(head);
        const tbody = document.createElement('tbody');
        s.ejercicios.forEach(e => {
            const tr = document.createElement('tr');
            [e.nombre, e.musculo, e.series, e.repeticiones, e.peso].forEach(v => {
                const td = document.createElement('td');
                td.textContent = v;
                tr.append(td);
            });
            tbody.append(tr);
        });
        table.append(tbody);
        wrap.append(table);
        const notas = document.createElement('p');
        notas.className = 'small text-body-secondary text-break';
        notas.textContent = s.notas;
        const acciones = document.createElement('div');
        acciones.className = 'd-flex flex-wrap gap-2';
        acciones.append(boton('Editar', 'btn-outline-info', () => {
            cargar(s, s.id);
            $('nombre').focus();
        }), boton('Reutilizar', 'btn-outline-light', () => {
            cargar(s);
            $('nombre').focus();
            avisar('Rutina cargada con la fecha de hoy. Guárdala para registrar una nueva sesión.');
        }), boton('Descargar rutina', 'btn-outline-light', () => exportarRutina(s)), boton('Eliminar', 'btn-outline-danger', () => {
            if (confirm(`¿Eliminar la sesión «${s.nombre}» del ${s.fecha}?`)) {
                if (persistir(sesiones.filter(x => x.id !== s.id))) {
                    if (editando === s.id) cargar({});
                    avisar('Sesión eliminada.');
                }
            }
        }));
        body.append(h, p, wrap, notas, acciones);
        card.append(body);
        $('lista').append(card);
    });
}
$('formulario').addEventListener('submit', event => {
    event.preventDefault();
    const r = leerRutina();
    if (!r) return;
    const s = {
        ...r,
        id: editando || uid(),
        fecha: $('fecha').value
    };
    const nuevas = editando ? sesiones.map(x => x.id === editando ? s : x) : [...sesiones, s];
    if (persistir(nuevas)) {
        cargar({});
        avisar('Entrenamiento guardado correctamente.');
    }
});
$('agregar').addEventListener('click', () => agregarEjercicio());
$('limpiar').addEventListener('click', () => cargar({}));
$('descargar-rutina').addEventListener('click', () => {
    const r = leerRutina();
    if (r) exportarRutina(r);
});
$('filtro').addEventListener('change', renderizar);
$('busqueda').addEventListener('input', renderizar);
$('respaldo').addEventListener('click', () => descargar({
    aplicacion: 'RegistroFit',
    version: 1,
    tipo: 'respaldo',
    sesiones
}, `respaldo-registrofit-${hoy()}.json`));
$('archivo').addEventListener('change', async event => {
    const archivo = event.target.files[0];
    if (!archivo) return;
    try {
        if (archivo.size > 2 * 1024 * 1024) throw new Error('El archivo supera el máximo de 2 MB.');
        const datos = JSON.parse(await archivo.text());
        if (!datos || datos.aplicacion !== 'RegistroFit' || datos.version !== 1) throw new Error('El archivo no es un documento compatible de RegistroFit.');
        if (datos.tipo === 'rutina' && rutinaValida(datos.rutina)) {
            if (!confirm('Se cargarán los ejercicios en el formulario. Los cambios sin guardar se reemplazarán. ¿Continuar?')) return;
            cargar(datos.rutina);
            avisar('Rutina importada. Revisa la fecha y guarda cuando termines de entrenar.');
            $('nombre').focus();
        } else if (datos.tipo === 'respaldo' && Array.isArray(datos.sesiones) && datos.sesiones.length <= 10000 && datos.sesiones.every(sesionValida) && new Set(datos.sesiones.map(s => s.id)).size === datos.sesiones.length) {
            const ids = new Set(sesiones.map(s => s.id));
            const nuevas = datos.sesiones.filter(s => !ids.has(s.id));
            if (persistir([...sesiones, ...nuevas])) avisar(`Respaldo importado: ${nuevas.length} sesiones agregadas. ${datos.sesiones.length-nuevas.length} ya existían y se conservaron sin cambios.`);
        } else throw new Error('El archivo contiene una estructura o valores inválidos. No se modificó el historial.');
    } catch (error) {
        avisar(error instanceof SyntaxError ? 'El archivo no contiene JSON válido.' : error.message, 'danger');
    } finally {
        event.target.value = '';
    }
});
MUSCULOS.forEach(m => $('filtro').add(new Option(m, m)));
try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) {
        const datos = JSON.parse(raw);
        if (!Array.isArray(datos) || !datos.every(sesionValida) || new Set(datos.map(s => s.id)).size !== datos.length) throw new Error();
        sesiones = datos;
    }
} catch {
    avisar('No se pudieron leer los datos guardados. Los datos anteriores no se sobrescribirán hasta que guardes o importes una sesión. Si tienes un respaldo, puedes importarlo.', 'warning');
}
cargar({});
renderizar();

// Construye el catálogo sin insertar datos como HTML.
function mostrarRutinasPredefinidas() {
    const catalogo = $('catalogo-rutinas');
    catalogo.replaceChildren();

    RUTINAS_PREDEFINIDAS.forEach(rutina => {
        const columna = document.createElement('div');
        columna.className = 'col-12 col-lg-4';

        const tarjeta = document.createElement('article');
        tarjeta.className = 'card bg-body-tertiary border-secondary h-100';

        const portada = document.createElement('img');
        portada.src = rutina.imagen;
        portada.alt = rutina.imagenAlt;
        portada.width = 1536;
        portada.height = 1024;
        portada.loading = 'lazy';
        portada.className = 'card-img-top img-fluid';

        const contenido = document.createElement('div');
        contenido.className = 'card-body d-flex flex-column p-4';

        const titulo = document.createElement('h3');
        titulo.className = 'h4 text-info';
        titulo.textContent = rutina.nombre;

        const subtitulo = document.createElement('p');
        subtitulo.className = 'fw-semibold';
        subtitulo.textContent = rutina.subtitulo;

        const descripcion = document.createElement('p');
        descripcion.textContent = rutina.descripcion;

        const organizacion = document.createElement('p');
        organizacion.className = 'small text-body-secondary';
        organizacion.textContent = rutina.organizacion;

        contenido.append(titulo, subtitulo, descripcion, organizacion);

        const pie = document.createElement('div');
        pie.className = 'card-footer p-4';

        const sesionesRutina = document.createElement('details');
        const tituloSesiones = document.createElement('summary');
        tituloSesiones.className = 'fw-semibold';
        tituloSesiones.textContent = 'Ver sesiones de ejemplo';

        const listaSesiones = document.createElement('div');
        listaSesiones.className = 'mt-3';
        sesionesRutina.append(tituloSesiones, listaSesiones);

        rutina.sesiones.forEach(sesion => {
            const detalle = document.createElement('details');
            detalle.className = 'border border-secondary rounded p-3 mb-3';

            const resumen = document.createElement('summary');
            resumen.className = 'fw-semibold';
            resumen.textContent = sesion.nombre;

            const lista = document.createElement('ul');
            lista.className = 'small mt-3 ps-3';

            sesion.ejercicios.forEach(ejercicio => {
                const elemento = document.createElement('li');
                elemento.className = 'mb-2';
                elemento.textContent = `${ejercicio.nombre} · ${ejercicio.musculo} · ${ejercicio.series} × ${ejercicio.repeticiones}`;
                lista.append(elemento);
            });

            const cargarSesion = boton('Cargar esta sesión', 'btn-outline-info', () => {
                const tieneContenido = $('nombre').value.trim() || $('notas').value.trim() ||
                    [...$('ejercicios').querySelectorAll('[data-campo]')].some(campo => {
                        return campo.dataset.campo === 'peso'
                            ? campo.value !== '' && Number(campo.value) !== 0
                            : campo.value.trim() !== '';
                    });

                if (tieneContenido && !confirm('Se reemplazará el contenido del formulario. Las sesiones guardadas se conservarán. ¿Continuar?')) {
                    return;
                }

                cargar(sesion);

                // La carga es individual: no se propone un peso fijo para principiantes.
                $('ejercicios').querySelectorAll('[data-campo="peso"]').forEach(campo => {
                    campo.value = '';
                    campo.placeholder = 'Tu carga';
                });

                avisar(`${sesion.nombre} cargada con la fecha de hoy. Revisa los ejercicios y registra los pesos antes de guardar.`);
                $('nombre').focus();
            });

            cargarSesion.setAttribute('aria-label', `Cargar ${sesion.nombre}`);
            detalle.append(resumen, lista, cargarSesion);
            listaSesiones.append(detalle);
        });

        pie.append(sesionesRutina);
        tarjeta.append(portada, contenido, pie);
        columna.append(tarjeta);
        catalogo.append(columna);
    });
}

mostrarRutinasPredefinidas();
