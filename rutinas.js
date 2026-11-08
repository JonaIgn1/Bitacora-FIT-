'use strict';

// Plantillas editables: no se guardan en el historial hasta registrar la sesión.
const RUTINAS_PREDEFINIDAS = [
    {
        "nombre": "Full Body",
        "imagen": "imagenes/full-body.png",
        "imagenAlt": "Mujer haciendo peso muerto rumano con mancuernas",
        "subtitulo": "Cuerpo completo en una sesión",
        "descripcion": "Trabajas piernas, pecho, espalda, hombros y abdomen dentro del mismo entrenamiento. Es una forma sencilla de conocer los movimientos principales y llevar un registro de todo el cuerpo.",
        "organizacion": "Ejemplo: lunes y jueves, dejando días de recuperación entre sesiones. Repite la sesión y ajusta los ejercicios conforme aprendas.",
        "sesiones": [
            {
                "nombre": "Full Body · Cuerpo completo",
                "notas": "Plantilla de ejemplo. Ajusta series y repeticiones a tu nivel. Registra el peso realmente utilizado; 0 indica sin carga externa. Descansa entre series hasta poder repetir el movimiento con buena técnica.",
                "ejercicios": [
                    {
                        "nombre": "Prensa de piernas",
                        "musculo": "Piernas",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Curl femoral en máquina",
                        "musculo": "Piernas",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Press de pecho en máquina",
                        "musculo": "Pecho",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Remo sentado en polea",
                        "musculo": "Espalda",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Press de hombros en máquina",
                        "musculo": "Hombros",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Crunch abdominal",
                        "musculo": "Abdomen",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    }
                ]
            }
        ]
    },
    {
        "nombre": "PPL",
        "imagen": "imagenes/ppl.png",
        "imagenAlt": "Tres ejercicios: press de pecho, remo en polea y sentadilla",
        "subtitulo": "Push / Pull / Legs · Empuje, jalón y piernas",
        "descripcion": "Divide los ejercicios en tres tipos de sesión. Push trabaja movimientos de empuje para pecho, hombros y tríceps; Pull reúne jalones para espalda y bíceps; Legs se concentra en piernas, glúteos y pantorrillas. Cada botón carga solo la sesión elegida.",
        "organizacion": "Un ciclo tiene tres sesiones: Push → Pull → Legs. Puedes distribuirlo en tres días con descansos intermedios; así cada grupo se trabaja una vez por ciclo. Repetir el ciclo aumenta la frecuencia y requiere ajustar el volumen y la recuperación.",
        "sesiones": [
            {
                "nombre": "PPL · Push (empuje)",
                "notas": "Plantilla de ejemplo. Ajusta series y repeticiones a tu nivel. Registra el peso realmente utilizado; 0 indica sin carga externa. Descansa entre series hasta poder repetir el movimiento con buena técnica.",
                "ejercicios": [
                    {
                        "nombre": "Press de pecho en máquina",
                        "musculo": "Pecho",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Press inclinado con mancuernas",
                        "musculo": "Pecho",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Elevaciones laterales",
                        "musculo": "Hombros",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Extensión de tríceps en polea",
                        "musculo": "Tríceps",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    }
                ]
            },
            {
                "nombre": "PPL · Pull (jalón)",
                "notas": "Plantilla de ejemplo. Ajusta series y repeticiones a tu nivel. Registra el peso realmente utilizado; 0 indica sin carga externa. Descansa entre series hasta poder repetir el movimiento con buena técnica.",
                "ejercicios": [
                    {
                        "nombre": "Jalón al pecho",
                        "musculo": "Espalda",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Remo sentado en polea",
                        "musculo": "Espalda",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Aperturas inversas en máquina",
                        "musculo": "Hombros",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Curl de bíceps con mancuernas",
                        "musculo": "Bíceps",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    }
                ]
            },
            {
                "nombre": "PPL · Legs (piernas)",
                "notas": "Plantilla de ejemplo. Ajusta series y repeticiones a tu nivel. Registra el peso realmente utilizado; 0 indica sin carga externa. Descansa entre series hasta poder repetir el movimiento con buena técnica.",
                "ejercicios": [
                    {
                        "nombre": "Prensa de piernas",
                        "musculo": "Piernas",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Curl femoral en máquina",
                        "musculo": "Piernas",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Puente de glúteos",
                        "musculo": "Glúteos",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Elevaciones de talones",
                        "musculo": "Pantorrillas",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Crunch abdominal",
                        "musculo": "Abdomen",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    }
                ]
            }
        ]
    },
    {
        "nombre": "Upper / Lower",
        "imagen": "imagenes/upper-lower.png",
        "imagenAlt": "Press de hombros con mancuernas y sentadilla con barra",
        "subtitulo": "Tren superior / Tren inferior",
        "descripcion": "Alterna una sesión de torso y brazos con otra de piernas y abdomen. En Upper entrenas pecho, espalda, hombros y brazos; en Lower trabajas piernas, glúteos, pantorrillas y abdomen.",
        "organizacion": "Ejemplo de cuatro días: lunes Upper, martes Lower, jueves Upper y viernes Lower. Miércoles y fin de semana quedan para recuperación. También puedes repartir el ciclo en más días según tu disponibilidad.",
        "sesiones": [
            {
                "nombre": "Upper / Lower · Upper (superior)",
                "notas": "Plantilla de ejemplo. Ajusta series y repeticiones a tu nivel. Registra el peso realmente utilizado; 0 indica sin carga externa. Descansa entre series hasta poder repetir el movimiento con buena técnica.",
                "ejercicios": [
                    {
                        "nombre": "Press de pecho en máquina",
                        "musculo": "Pecho",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Jalón al pecho",
                        "musculo": "Espalda",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Remo sentado en polea",
                        "musculo": "Espalda",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Elevaciones laterales",
                        "musculo": "Hombros",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Curl de bíceps con mancuernas",
                        "musculo": "Bíceps",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Extensión de tríceps en polea",
                        "musculo": "Tríceps",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    }
                ]
            },
            {
                "nombre": "Upper / Lower · Lower (inferior)",
                "notas": "Plantilla de ejemplo. Ajusta series y repeticiones a tu nivel. Registra el peso realmente utilizado; 0 indica sin carga externa. Descansa entre series hasta poder repetir el movimiento con buena técnica.",
                "ejercicios": [
                    {
                        "nombre": "Prensa de piernas",
                        "musculo": "Piernas",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Curl femoral en máquina",
                        "musculo": "Piernas",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Puente de glúteos",
                        "musculo": "Glúteos",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Elevaciones de talones",
                        "musculo": "Pantorrillas",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    },
                    {
                        "nombre": "Crunch abdominal",
                        "musculo": "Abdomen",
                        "series": 2,
                        "repeticiones": 12,
                        "peso": 0
                    }
                ]
            }
        ]
    }
];
