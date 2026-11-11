'use strict';

// Plantillas editables: no se guardan en el historial hasta registrar la sesión.
const RUTINAS_PREDEFINIDAS = (() => {
    const NOTA_PLANTILLA = 'Plantilla de ejemplo. Ajusta series y repeticiones a tu nivel. ' +
        'Registra el peso realmente utilizado; 0 indica sin carga externa. ' +
        'Descansa entre series hasta poder repetir el movimiento con buena técnica.';

    // Cada ejercicio se escribe como [nombre, músculo]; series, repeticiones y peso son los de ejemplo.
    const crearSesion = (nombre, ejercicios) => ({
        nombre,
        notas: NOTA_PLANTILLA,
        ejercicios: ejercicios.map(([ejercicio, musculo]) => ({
            nombre: ejercicio,
            musculo,
            series: 2,
            repeticiones: 12,
            peso: 0
        }))
    });

    const PIERNAS_Y_ABDOMEN = [
        ['Prensa de piernas', 'Piernas'],
        ['Curl femoral en máquina', 'Piernas'],
        ['Puente de glúteos', 'Glúteos'],
        ['Elevaciones de talones', 'Pantorrillas'],
        ['Crunch abdominal', 'Abdomen']
    ];

    return [
        {
            nombre: 'Full Body',
            imagen: 'full-body.png',
            imagenAlt: 'Mujer haciendo peso muerto rumano con mancuernas',
            subtitulo: 'Cuerpo completo en una sesión',
            descripcion: 'Trabajas piernas, pecho, espalda, hombros y abdomen dentro del mismo entrenamiento. Es una forma sencilla de conocer los movimientos principales y llevar un registro de todo el cuerpo.',
            organizacion: 'Ejemplo: lunes y jueves, dejando días de recuperación entre sesiones. Repite la sesión y ajusta los ejercicios conforme aprendas.',
            sesiones: [
                crearSesion('Full Body · Cuerpo completo', [
                    ['Prensa de piernas', 'Piernas'],
                    ['Curl femoral en máquina', 'Piernas'],
                    ['Press de pecho en máquina', 'Pecho'],
                    ['Remo sentado en polea', 'Espalda'],
                    ['Press de hombros en máquina', 'Hombros'],
                    ['Crunch abdominal', 'Abdomen']
                ])
            ]
        },
        {
            nombre: 'PPL',
            imagen: 'ppl.png',
            imagenAlt: 'Tres ejercicios: press de pecho, remo en polea y sentadilla',
            subtitulo: 'Push / Pull / Legs · Empuje, jalón y piernas',
            descripcion: 'Divide los ejercicios en tres tipos de sesión. Push trabaja movimientos de empuje para pecho, hombros y tríceps; Pull reúne jalones para espalda y bíceps; Legs se concentra en piernas, glúteos y pantorrillas. Cada botón carga solo la sesión elegida.',
            organizacion: 'Un ciclo tiene tres sesiones: Push → Pull → Legs. Puedes distribuirlo en tres días con descansos intermedios; así cada grupo se trabaja una vez por ciclo. Repetir el ciclo aumenta la frecuencia y requiere ajustar el volumen y la recuperación.',
            sesiones: [
                crearSesion('PPL · Push (empuje)', [
                    ['Press de pecho en máquina', 'Pecho'],
                    ['Press inclinado con mancuernas', 'Pecho'],
                    ['Elevaciones laterales', 'Hombros'],
                    ['Extensión de tríceps en polea', 'Tríceps']
                ]),
                crearSesion('PPL · Pull (jalón)', [
                    ['Jalón al pecho', 'Espalda'],
                    ['Remo sentado en polea', 'Espalda'],
                    ['Aperturas inversas en máquina', 'Hombros'],
                    ['Curl de bíceps con mancuernas', 'Bíceps']
                ]),
                crearSesion('PPL · Legs (piernas)', PIERNAS_Y_ABDOMEN)
            ]
        },
        {
            nombre: 'Upper / Lower',
            imagen: 'upper-lower.png',
            imagenAlt: 'Press de hombros con mancuernas y sentadilla con barra',
            subtitulo: 'Tren superior / Tren inferior',
            descripcion: 'Alterna una sesión de torso y brazos con otra de piernas y abdomen. En Upper entrenas pecho, espalda, hombros y brazos; en Lower trabajas piernas, glúteos, pantorrillas y abdomen.',
            organizacion: 'Ejemplo de cuatro días: lunes Upper, martes Lower, jueves Upper y viernes Lower. Miércoles y fin de semana quedan para recuperación. También puedes repartir el ciclo en más días según tu disponibilidad.',
            sesiones: [
                crearSesion('Upper / Lower · Upper (superior)', [
                    ['Press de pecho en máquina', 'Pecho'],
                    ['Jalón al pecho', 'Espalda'],
                    ['Remo sentado en polea', 'Espalda'],
                    ['Elevaciones laterales', 'Hombros'],
                    ['Curl de bíceps con mancuernas', 'Bíceps'],
                    ['Extensión de tríceps en polea', 'Tríceps']
                ]),
                crearSesion('Upper / Lower · Lower (inferior)', PIERNAS_Y_ABDOMEN)
            ]
        }
    ];
})();
