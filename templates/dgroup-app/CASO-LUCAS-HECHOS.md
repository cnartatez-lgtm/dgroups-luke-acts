# Lucas y Hechos como referencia de D-Groups

Versión del 25 de noviembre de 2026. La aplicación inglesa de EIC Paris recorre el Acto I en doce semanas. Se puede revisar la experiencia completa en la [web de participantes](https://dgroupapp-luke-acts.eicparis.org/) y consultar su [código en GitHub](https://github.com/cnartatez-lgtm/dgroups-luke-acts).

## Cómo se organiza la experiencia

| Entrada | Para qué viene la persona | Qué enseña el tutorial |
| --- | --- | --- |
| Home | Entender cómo navegar | Entrada a la lectura, secciones, descargas, animaciones y tema. |
| Intro | Preparar la reunión | Qué es un D-Group, cómo participar, cómo servir como Facilitator y dónde encontrar el módulo. |
| Read | Leer en grupo | Frecuencia, semana o quincena, ajuste de letra, salto al primer versículo y referencias de ambos pasajes cuando corresponda. |
| Pastoral | Consultar el comentario de los pastores | Progreso, filtro por módulo, semana y enseñanza disponible. |
| Story | Conectar las semanas del módulo | Abrir una reflexión publicada y reconocer cuándo se abre la siguiente. |
| Tools | Estudiar un pasaje | Palabras repetidas, glosario y concordancia, con indicaciones ligadas a la pestaña actual. |
| Resources | Buscar apoyo para una pregunta | Elegir por tema, abrir un recurso externo y volver a la guía de reunión. |
| Downloads | Llevar una guía al encuentro | Distinguir las guías de miembros y Facilitator y las ediciones móvil e impresa. |

## La elección al principio

Cada recorrido comienza con dos botones. **Watch Animation** inicia el reloj y permite pausar o reanudar. **At My Pace** muestra el primer paso y espera a **Next**. **Back** permite releer, **Finish** cierra el último paso y **Exit Tutorial** sale en cualquier momento. La bienvenida se mantiene hasta que la persona elige. Al salir, vuelven el foco y la posición de lectura. El modo se elige de nuevo al abrir otro tutorial.

El texto de cada paso señala un control que existe en la página. Por ejemplo, Read usa las referencias del grupo seleccionado y Pastoral adapta sus indicaciones a lo que ya se puede leer. Los botones del tutorial explican el recorrido sin descargar un PDF, marcar una semana o abrir otro sitio por cuenta del visitante.

## Decisiones que merece la pena conservar

- En teléfono vertical, deja estable el botón Next mientras el contenido se desplaza al espacio libre. En la prueba de Intro conservó la misma altura durante sus cinco pasos en iPhone de 320 px y Android de 360 px.
- En horizontal, deja espacio para el elemento señalado y la tarjeta. En un iPhone de 568 × 320 px ambos caben al reunir los controles en una fila.
- En la bienvenida, coloca la elección antes de la explicación larga. Comprueba a 200 % de letra que los dos modos se puedan alcanzar.
- En listas largas de semanas usa etiquetas breves y una marca de selección que también se reconozca en modo oscuro. En los teléfonos táctiles compatibles, la lista se abre abajo. Los controles conservan su funcionamiento de teclado y el comportamiento del sistema cuando el navegador lo requiere.
- Mantén una única implementación del reloj, el foco y la salida. Define por separado el texto y los controles reales de cada sección. Se pueden consultar el [motor del tutorial](https://github.com/cnartatez-lgtm/dgroups-luke-acts/blob/main/home-tutorial.js) y los [recorridos por sección](https://github.com/cnartatez-lgtm/dgroups-luke-acts/blob/main/section-tours.js).

## Cómo identificar la versión correcta

El dominio habitual y los marcadores con fragmentos siguen siendo los puntos de entrada. La versión de los archivos de la interfaz aparece en el HTML para que los navegadores reciban el JavaScript y el CSS correspondientes. La primera pantalla de cualquier tutorial debe ofrecer los dos modos. Una comprobación rápida es abrir [Tools](https://dgroupapp-luke-acts.eicparis.org/#tools), elegir At My Pace y dejar el primer paso en pantalla más de un minuto. Luego avanzar, retroceder y salir.

La aprobación de esta interfaz es independiente de la programación de contenidos. El paquete de la semana del 30 de noviembre conserva su apertura prevista a las 07:00 de París. Para otra serie, registra su propio calendario, ediciones bíblicas autorizadas y responsables en la [ficha de proyecto](FICHA.md).
