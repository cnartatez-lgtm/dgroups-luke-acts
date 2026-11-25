# Plantilla para una app de D-Groups

Usa la app de Lucas y Hechos como referencia para preparar la siguiente serie. Esta carpeta incluye un lector funcional con dos semanas de ejemplo, el selector de ritmo semanal o quincenal y el tutorial con **Watch Animation** y **At My Pace**. Las instrucciones están en español y la interfaz de ejemplo está en inglés.

## Abrir el ejemplo

Desde esta carpeta, con Python 3.9 o posterior y un navegador moderno, ejecuta en PowerShell:

```powershell
python -B verify.py
python -B build.py ..\dgroup-demo-01
python -m http.server 8188 --bind 127.0.0.1 --directory ..\dgroup-demo-01
```

Abre [la vista local](http://127.0.0.1:8188/) y pulsa **Home Tutorial**. Elige **At My Pace**, espera, avanza con **Next** y sal. Abre **Read**, selecciona **Every Two Weeks** y prueba **A+**. Detén el servidor con Ctrl+C.

| Archivo | Uso |
|---|---|
| `FICHA.md` | Copiar la ficha y completar las decisiones editoriales de cada nueva serie. |
| `example.json` | Dos versículos públicos, su edición, fechas pasadas y aprobación. Sirve de ejemplo reproducible. |
| `starter/index.html`, `app.js`, `styles.css` | Cambiar secciones, lecturas, navegación y estilo de la nueva app. |
| `starter/tutorial.js`, `tutorial.css` | Motor común del recorrido. Los pasos y sus selectores se definen en `app.js`. |
| `starter/selectors.css` | Tratamiento táctil del selector abierto y de la lista semanal en teléfonos. |
| `build.py`, `verify.py` | Exportar solo semanas aprobadas y abiertas, y verificar el límite de apertura. |

## Iniciar una serie

1. Copia la carpeta de trabajo y completa `FICHA.md`. Guarda los datos editoriales reales en una ubicación privada, fuera del checkout público. El ejemplo incluye únicamente dos lecturas de **World English Bible Classic**, Lucas 2:19 y 2:20.
2. Usa la estructura de `example.json` para la serie. Cada semana tiene número único, pasaje, texto de la edición autorizada, aprobación explícita y fecha con desplazamiento UTC. Introduce la hora local de París y el desplazamiento correspondiente a esa fecha. En invierno es +01:00 y en verano +02:00.
3. Exporta a un directorio nuevo. El ejemplo muestra una sola edición inglesa. Para una serie multilingüe, exporta cada edición desde sus campos aprobados, con idénticos números de semana y fechas. Verifica las citas de cada Biblia con su propio texto fuente.

```powershell
python -B build.py ..\serie-revision-01 --content ..\editorial-privado\serie.en.json
python -m http.server 8188 --bind 127.0.0.1 --directory ..\serie-revision-01
```

El reloj de exportación controla lo que llega al navegador. Para abrir una semana futura, programa una nueva exportación y su despliegue en la fecha de la ficha. Una página estática ya desplegada solo cambia al recibir esa versión. Si una nueva serie requiere aperturas con material previamente cifrado, configura y comprueba la entrega diferida de claves antes de elegir ese sistema.

## Lo que aporta la referencia de Lucas y Hechos

| Destino | Qué debe poder hacer el grupo | Qué muestra el recorrido |
|---|---|---|
| Home | Orientarse en toda la app y volver a la portada. | Entrada principal, navegación, Downloads, animaciones y tema claro u oscuro. |
| Intro | Entender qué es un D-Group y cómo preparar una reunión. | Guía de reunión, función rotatoria de **Facilitator** y plan de módulos. |
| Read | Elegir ritmo y semana, localizar el pasaje y ajustar la letra. | Controles reales, primera y segunda lectura cuando proceda y acceso a guías. |
| Pastoral | Encontrar comentarios de los pastores y el progreso de su estudio. | Módulo, semana, lectura disponible, progreso y estado de próxima apertura. |
| Story | Conectar los pasajes al cierre de cada módulo. | Botón visible **Read Reflection**, módulo disponible y próximas aperturas. |
| Tools | Estudiar las palabras y conexiones del pasaje elegido. | Palabras repetidas, glosario y concordancia, incluidos estados vacíos. |
| Resources | Escoger una herramienta de contexto y volver al estudio. | Categorías por tema, enlaces externos reconocibles y guía de reunión. |
| Downloads | Elegir la guía de participante o Facilitator, para móvil o impresión. | Portada, propósito, formato, número de páginas y descarga directa del PDF. |

El ejemplo ejecutable desarrolla Home y Read. Para las demás secciones, usa esta tabla y los datos aprobados de la nueva serie. Para guías PDF, conserva el archivo fuente, comprueba las descargas y reutiliza la portada con texto legible sobre degradado. Sobre la imagen de un módulo abierto, incluye una acción legible además de la ilustración.

## Añadir un tutorial

Asigna al botón un identificador único, `data-tutorial="downloads"`, `aria-haspopup="dialog"` y `aria-controls="home-tutorial"`. En `tours` de `starter/app.js`, añade una entrada que devuelva pasos según el estado actual. Ejemplo para una sección con un PDF real:

```js
downloads: {
  name: 'Downloads',
  steps: () => [{
    selector: '#mobile-guide-download',
    title: 'Mobile Guide',
    text: 'Download the guide to read it on your phone.',
    ms: 4500
  }]
}
```

Coloca el identificador del selector en el botón o enlace existente. Mantén al menos un objetivo visible en cada estado, incluido el de lista vacía. Una frase por paso suele bastar. El puntero señala el control sin activarlo. El motor calcula la duración a partir de los pasos visibles.

- Al abrir, la persona dispone de tiempo para elegir. **At My Pace** espera **Next** o **Back** en cada paso. **Watch Animation** arranca el reloj al elegirlo y ofrece pausa y reanudación.
- Al salir o pulsar Escape, devuelve el foco al botón inicial y restaura la posición. Respeta movimiento reducido y permite seguir leyendo al ampliar el texto.
- Comprueba el selector de semana **abierto** en Android y iPhone. En teléfonos compatibles la lista larga aparece abajo, con elección marcada, filas de al menos 48 px y desplazamiento propio. Los demás navegadores usan el control de la plataforma.

## Contenidos, arte e idiomas

Mantén las Escrituras con su traducción y atribución auténticas. En Lucas y Hechos, inglés usa WEB y español RV1909. Los comentarios se incorporan cuando los pastores los entregan y aprueban. Por idioma, revisa cuerpo de la lección, títulos, guías, enlaces, tutoriales, textos alternativos y estados de apertura. Las preferencias de ritmo, tamaño y progreso pertenecen al dispositivo según la implementación de cada serie.

Para ilustrar D-Groups, registra por semana pasaje, foco visual, encuadre, paleta y descripción alternativa. Alterna sujetos y ángulos entre semanas. En Lucas y Hechos se usaron Low Poly + Cel Shading, rostros y edades naturales de una iglesia multicultural, y escenas aptas para menores. Conserva el estilo aprobado para cada serie.

## Comprobación y entrega

| Prueba | Resultado que se busca |
|---|---|
| PC con teclado | Entrada por teclado, foco visible, Next, Back, pausa, Escape y retorno al mismo control. |
| Tableta en vertical y horizontal | Tarjeta y elemento señalado visibles juntos al rotar. Texto y controles permanecen dentro de los márgenes. |
| iPhone y Android, incluido ancho de 320 px | La elección inicial espera. En manual se puede leer varios segundos sin cambio. El recorrido automático llega al final. |
| Texto al 200 % y movimiento reducido | Controles alcanzables, contenido desplazable, selector semanal usable hasta la última opción y foco restaurado. |
| Disponibilidad | Una semana no aprobada o futura queda fuera del JSON, imágenes y descargas públicas. En el instante de apertura aparece únicamente el material aprobado. |
| Enlaces y archivos | Revisa cada URL pública, rutas directas por sección, acentos de cada idioma y descarga de los PDFs esperados. |

Ejecuta `python -B verify.py` y repite la visita local. Registra qué hiciste en equipos físicos y qué hiciste en emulación. Para una prueba con usuarios, pide elegir una reunión quincenal y encontrar el segundo pasaje sin ayuda. Escucha los anuncios de VoiceOver y TalkBack en los teléfonos disponibles.

Para desplegar, lleva los archivos exportados al checkout de la nueva web. Conserva su configuración de alojamiento y revisa el diff frente al remoto antes del commit. Usa el publicador existente si la serie ya tiene uno. Para un nuevo proyecto Git con rama y remoto configurados, una secuencia típica desde el checkout público es:

```powershell
git status --short --branch
git fetch origin
git log -1 --oneline
git add -- index.html styles.css app.js tutorial.js tutorial.css selectors.css study.json
git diff --cached --stat
git diff --cached --check
git commit -m "Publish the approved D-Group study"
git push
```

Comprueba la URL principal, la dirección alternativa del alojamiento, sus redirecciones y la versión que devuelve el servidor después del despliegue. Configura `CNAME`, enlaces canónicos y mapa del sitio con los destinos de **esa** serie. Registra commit, fecha de París, URLs, rutas verificadas y responsable de la próxima apertura en la ficha. Si una versión requiere retirada, revierte el commit público y comprueba el despliegue de la reversión.

## Aplicación de referencia

Consulta el [caso de Lucas y Hechos](CASO-LUCAS-HECHOS.md) para recorrer las ocho secciones en la web y comparar sus decisiones de navegación, accesibilidad y publicación con una nueva serie.
