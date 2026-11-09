/*
  CONTENIDOS DE LA ONE PAGE · BIOFERIA 2027
  ------------------------------------------------------------
  Todo el texto, enlaces e imágenes viven acá. main.js los toma
  y arma la página: para cambiar un dato no hace falta tocar
  index.html ni styles.css.

  Fuente de los datos: https://www.bioferia.info/ (consultada el 22/10/2026).
  Imagen en null  → la página muestra un placeholder con el nombre de archivo esperado.
  Texto en null   → la fila muestra "A confirmar".
*/
window.BIOFERIA = {
  meta: {
    edicion: "8.ª edición",
    fechas: "9, 10 y 11 de abril de 2027",
    fechasCortas: "9 · 10 · 11 abril 2027",
    lugar: "Hipódromo de Palermo",
    ciudad: "Buenos Aires",
    correo: "comercial@bioferia.info",
  },

  // Logo del sitio actual (bioferia.info). Reemplazar por el logo del rebranding cuando exista.
  logo: { src: "assets/logos/bioferia-wordmark.svg", alt: "Bioferia" },

  nav: [
    { label: "Festival", href: "#festival" },
    { label: "Áreas", href: "#areas" },
    { label: "Galería", href: "#galeria" },
    { label: "Agenda", href: "#agenda" },
    { label: "Impacto", href: "#impacto" },
    { label: "App", href: "#app" },
    { label: "Contacto", href: "#contacto" },
  ],

  acciones: {
    // Sin enlace: la venta todavía no está abierta. Cuando abra, completar href.
    entradas: { label: "Entradas", estado: "Próximamente", href: null },
    expositor: { label: "Quiero ser expositor", href: "https://www.bioferia.info/sumate" },
  },

  hero: {
    titulo: ["El cambio", "se"],
    // Lettering de la identidad (Group 123) para la palabra final, ya coloreado con su sombra.
    // Variantes listas en assets/graficas/: activa-amarillo-rosa.png, activa-blanco-rosa.png,
    // activa-rosa-amarillo.png, activa-turquesa-rosa.png, activa-amarillo-azul.png
    lettering: { palabra: "activa", src: "assets/graficas/activa-amarillo-rosa.png", ancho: 957, alto: 267 },
    // Video de fondo a pantalla completa. Si se pone en null, la apertura vuelve al layout con afiche.
    video: {
      // Video propio de la campaña. En celular se usa la versión vertical 9:16.
      src: "assets/video/bioferia-video.mp4",
      srcMobile: "assets/video/bioferia-video-916.mp4",
      poster: "assets/video/bioferia-video-poster.jpg",
      posterMobile: "assets/video/bioferia-video-916-poster.jpg",
      // Fundido de color sobre el video: de → a (nombres de la paleta).
      fundido: ["azul", "rosa"],
    },
    // Gráfica protagonista (se usa solo si video es null). Alternativas: afiche-aire.jpg, afiche-tierra.jpg, afiche-celebrar-1.jpg, afiche-celebrar-2.jpg
    afiche: { src: "assets/afiches/afiche-agua.jpg", alt: "Afiche Bioferia 2027, serie Agua", ancho: 1229, alto: 1738 },
  },

  presentacion: {
    foto: { src: "assets/fotos/festival-hipodromo.jpg", alt: "Visitantes bailando entre los stands de Bioferia en el Hipódromo de Palermo" },
    titulo: "Vuelve el festival de sustentabilidad más grande de Latinoamérica.",
    texto:
      "Música en vivo, feria de emprendedores, charlas y experiencias, gastronomía consciente, empresas de triple impacto, ONGs y referentes, todos reunidos en un mismo lugar para celebrar el cambio y vivir nuevas formas de cuidar el planeta y las personas.",
    remate: "Que no te lo cuenten. Vení a vivirlo.",
  },

  // Franja expresiva. Cada verbo lleva su elemento y su color de la paleta.
  franja: [
    { verbo: "Hacer", elemento: "Fuego", color: "rojo", sentido: "Energía que inicia, impulsa y pone en acción.", donde: "Stands", detalle: "Las marcas y emprendimientos que hacen las cosas distinto.", img: "assets/galeria/g16.jpg" },
    { verbo: "Conectar", elemento: "Aire", color: "turquesa", sentido: "Circulación, intercambio y vínculo entre las partes.", donde: "Ingreso y espacio instagrameable", detalle: "Donde llegás, te encontrás y compartís.", img: "assets/galeria/g25.jpg" },
    { verbo: "Transformar", elemento: "Agua", color: "azul", sentido: "Movimiento y capacidad de modificar lo que atraviesa.", donde: "Informes", detalle: "Orientación para que tu recorrido te cambie algo.", img: "assets/galeria/g39.jpg" },
    { verbo: "Cuidar", elemento: "Tierra", color: "amarillo", sentido: "Sostén, permanencia y condición para que algo crezca.", donde: "Charlas, baños y descanso", detalle: "Pausas, ideas y cuidados para quedarte más tiempo.", img: "assets/fotos/charlas-escenario.jpg" },
    { verbo: "Celebrar", elemento: "Corazón", color: "rosa", sentido: "El punto de encuentro donde las acciones individuales adquieren sentido colectivo.", donde: "Escenario", detalle: "Música y contenidos en vivo, todos juntos.", img: "assets/fotos/baile.jpg" },
  ],
  catalizadores: {
    etiqueta: "Cinco catalizadores",
    titulo: "Cinco verbos para activar el cambio.",
    texto: "Cada verbo es un elemento, un color y un lugar del predio. Tocá uno y descubrí dónde vivirlo.",
  },

  areas: {
    etiqueta: "Áreas y mapa",
    titulo: "Descubrí las 11 áreas temáticas.",
    texto:
      "Más de 200 marcas con impacto positivo. Cada marca expositora de Bioferia impulsa una forma más consciente de producir y consumir: desde generar impacto social y apostar por la economía circular hasta regenerar los recursos naturales.",
    // Cada categoría lleva el color del catalizador del lugar donde se vive (rojo stands · celeste ingreso/instagram · azul informes · amarillo charlas, descanso y cuidado · rosa escenario).
    categorias: [
      { n: "Mercado", lugar: "Stands", color: "rojo" },
      { n: "Gastronomía", lugar: "Stands", color: "rojo" },
      { n: "Bienestar", lugar: "Descanso", color: "amarillo" },
      { n: "Moda", lugar: "Stands", color: "rojo" },
      { n: "Diseño y deco", lugar: "Stands", color: "rojo" },
      { n: "Infancia", lugar: "Espacio instagram", color: "turquesa" },
      { n: "Turismo", lugar: "Ingreso", color: "turquesa" },
      { n: "Arquitectura y jardinería", lugar: "Jardinería", color: "amarillo" },
      { n: "Energías renovables", lugar: "Informes", color: "azul" },
      { n: "Movilidad", lugar: "Ingreso", color: "turquesa" },
      { n: "ONG", lugar: "Escenario y charlas", color: "rosa" },
    ],
    // Mapa propio del proyecto (el mismo de la app Catálisis).
    mapa: { src: "assets/mapa/mapa-hipodromo.webp", alt: "Mapa de Bioferia en el Hipódromo de Palermo con la ubicación de las áreas temáticas", ancho: 1920, alto: 1080 },
    // Referencias del mapa original.
    referencias: [
      { t: "Ingreso", color: "turquesa" },
      { t: "Espacio instagram", color: "turquesa" },
      { t: "Stands", color: "rojo" },
      { t: "Gastronomía", color: "rojo" },
      { t: "Informes", color: "azul" },
      { t: "Recarga de agua", color: "azul" },
      { t: "Charlas", color: "amarillo" },
      { t: "Baños y descanso", color: "amarillo" },
      { t: "Jardinería", color: "amarillo" },
      { t: "Escenario", color: "rosa" },
    ],
  },

  // Color de cada espacio = catalizador del mapa: Fuego/rojo stands · Aire/celeste instagrameable e ingreso · Agua/azul informes · Tierra/amarillo charlas, baños y descanso · Corazón/rosa escenario.
  // Espacios del predio 2027. Son renders de diseño: la nota lo aclara en la página.
  espacios: {
    etiqueta: "El predio 2027",
    titulo: "Así se activa el recorrido.",
    texto: "Cinco espacios pensados para llegar, encontrarse, orientarse, escuchar y hacer una pausa.",
    nota: "Imágenes de diseño (renders). La propuesta final puede variar.",
    items: [
      { nombre: "Entrada", descripcion: "La bienvenida al festival.", src: "assets/espacios/entrada.jpg", alt: "Render de la entrada: túnel de arcos de madera con lonas de la identidad y molinetes", color: "turquesa" },
      { nombre: "Espacio instagrameable", descripcion: "Un lugar para la foto y para compartir.", src: "assets/espacios/instagrameable.jpg", alt: "Render del espacio instagrameable: hamaca bajo una estructura de madera con alas de colores", color: "turquesa" },
      { nombre: "Informes", descripcion: "Orientación y consultas para visitantes.", src: "assets/espacios/informes.jpg", alt: "Render del puesto de informes: pabellón curvo de madera con red de soga y gráfica azul", color: "azul" },
      { nombre: "Escenario", descripcion: "Música y contenidos en vivo.", src: "assets/espacios/escenario.jpg", alt: "Render del escenario: arco de madera con forma de sol, telas de colores y público sentado en el pasto", color: "rosa" },
      { nombre: "Lugar de descanso", descripcion: "Bancos y sombra para hacer una pausa.", src: "assets/espacios/descanso.jpg", alt: "Render del lugar de descanso: bancos curvos de madera con gráfica amarilla y turquesa entre plantas", color: "amarillo" },
    ],
  },

  // Fotos de ediciones anteriores publicadas en bioferia.info (bajadas de su sitio).
  // cat: stands | gastro | predio. Para sumar o quitar fotos, editar esta lista.
  galeria: {
    etiqueta: "Así se vive",
    titulo: "Mirá cómo se vive Bioferia.",
    texto: "Fotos de ediciones anteriores. Elegí una categoría, deslizá y tocá cualquier imagen para verla grande.",
    nota: "Fotografías de ediciones anteriores de Bioferia (fuente: bioferia.info).",
    cats: [
      { id: "todo", label: "Todo" },
      { id: "stands", label: "Stands" },
      { id: "gastro", label: "Gastronomía" },
      { id: "predio", label: "El predio" },
    ],
    items: [
      { src: "assets/galeria/g34.jpg", cat: "predio", alt: "Vista aérea del Hipódromo con el predio de Bioferia, carpas y público entre los árboles", cap: "El predio visto desde arriba" },
      { src: "assets/galeria/g16.jpg", cat: "stands", alt: "Tres visitantes posando frente al stand rosa de Kali", cap: "Stands con personalidad" },
      { src: "assets/galeria/g29.jpg", cat: "gastro", alt: "Público almorzando en mesas bajo las carpas del patio gastronómico", cap: "Patio gastronómico" },
      { src: "assets/galeria/g03.jpg", cat: "stands", alt: "Stand de mercado con productos artesanales y estantes de madera", cap: "Mercado de productores" },
      { src: "assets/galeria/g35.jpg", cat: "predio", alt: "Vista cenital del domo y el público durante el festival", cap: "El Domo desde el aire" },
      { src: "assets/galeria/g28.jpg", cat: "gastro", alt: "Mujer sosteniendo un cucurucho de helado artesanal", cap: "Helado artesano" },
      { src: "assets/galeria/g24.jpg", cat: "stands", alt: "Stand Brava con estructura de madera y banderas azules", cap: "Estructuras de madera" },
      { src: "assets/galeria/g20.jpg", cat: "stands", alt: "Dos expositoras con delantal frente al stand de agua Ko", cap: "Gente que te recibe" },
      { src: "assets/galeria/g31.jpg", cat: "gastro", alt: "Food truck de helados Guapaletas decorado con globos blancos", cap: "Food trucks" },
      { src: "assets/galeria/g25.jpg", cat: "predio", alt: "Estructura de madera en forma de casitas con vista a la ciudad", cap: "Arquitectura efímera" },
      { src: "assets/galeria/g18.jpg", cat: "stands", alt: "Dos expositoras con sombrero de paja en un stand de productos naturales", cap: "Marcas con impacto positivo" },
      { src: "assets/galeria/g36.jpg", cat: "gastro", alt: "Mesa larga con gente comiendo frente al food truck de pastas", cap: "Mesa larga, comida compartida" },
      { src: "assets/galeria/g26.jpg", cat: "stands", alt: "Stand de plantas y productos circular con estantes de madera", cap: "Diseño y economía circular" },
      { src: "assets/galeria/g40.jpg", cat: "predio", alt: "Vista aérea vertical del predio con carpas blancas y el domo", cap: "Un festival de 32.000 m²" },
      { src: "assets/galeria/g32.jpg", cat: "gastro", alt: "Food truck rayado blanco y negro con comida en vitrina", cap: "Cocina sobre ruedas" },
      { src: "assets/galeria/g22.jpg", cat: "stands", alt: "Equipo del stand Tunyi posando entre productos de diseño", cap: "Diseño con propósito" },
      { src: "assets/galeria/g27.jpg", cat: "gastro", alt: "Manos sosteniendo bebidas en un puesto de comida con toldo", cap: "Brindis en el patio" },
      { src: "assets/galeria/g21.jpg", cat: "stands", alt: "Estructura de madera con mesas bajo el sol en el predio", cap: "Espacios para quedarse" },
      { src: "assets/galeria/g17.jpg", cat: "stands", alt: "Expositora frente al stand Costeras", cap: "Emprendedores de todo el país" },
      { src: "assets/galeria/g23.jpg", cat: "stands", alt: "Stand con toldo blanco y mesa de madera", cap: "Productos con historia" },
      { src: "assets/galeria/g19.jpg", cat: "stands", alt: "Dos expositoras junto a su stand rodeadas de plantas", cap: "Cada stand, una historia" },
      { src: "assets/galeria/g30.jpg", cat: "stands", alt: "Stand azul con cartel Kay bajo una carpa blanca", cap: "Marcas en el predio" },
      { src: "assets/galeria/g39.jpg", cat: "stands", alt: "Expositora atendiendo a una visitante en un stand con vista al predio", cap: "Charlas cara a cara" },
    ],
  },

  // Videos. Para sumar uno: copiar el archivo a assets/video/ y agregar una fila.
  // poster es opcional: sin poster se muestra el primer cuadro del video.
  videos: {
    etiqueta: "En movimiento",
    titulo: "Bioferia, en movimiento.",
    texto: "Tocá play para ver y escuchar el festival.",
    items: [
      { src: "assets/video/bioferia-video.mp4", titulo: "Bioferia 2027 · Activemos el cambio", detalle: "Así imaginamos el festival: escenario, gente y naturaleza.", poster: "assets/video/bioferia-video-poster.jpg", color: "rosa" },
      { src: "assets/video/bioferia-hero.mp4", titulo: "Bioferia 2023 · ¡45.000 gracias!", detalle: "El festival visto desde arriba.", poster: "assets/galeria/g34.jpg", color: "turquesa" },
    ],
  },

  // Apps. Los QR de assets/qr llevan a cada url (verificado con un lector de QR).
  apps: {
    etiqueta: "Llevá Bioferia con vos",
    titulo: "Dos apps para vivir el cambio.",
    texto: "Escaneá el código con la cámara del celular o tocá el botón. No hay nada que instalar: se abre al instante y la podés guardar en tu pantalla de inicio.",
    items: [
      { id: "festival", color: "turquesa", etiqueta: "App del festival", titulo: "Bioferia en tu bolsillo", descripcion: "Agenda, mapa del predio, tus actividades y avisos para no perderte nada durante los tres días.", puntos: ["Agenda y mis actividades", "Mapa del predio", "Entradas y avisos"], url: "https://bioapp-lilac.vercel.app/", qr: "assets/qr/qr-1.png", shot: "assets/apps/app-festival.jpg", boton: "Abrir la app" },
      { id: "juego", color: "rosa", etiqueta: "App de juegos", titulo: "Catálisis", descripcion: "Sembrá tu semilla, descubrí tu superpoder y recorré el mapa por catalizadores: Fuego, Aire, Agua, Tierra y Corazón.", puntos: ["Tu semilla y tu superpoder", "Mapa por catalizadores", "Un recuerdo para llevarte"], url: "https://biojuego3d.vercel.app/", qr: "assets/qr/qr-2.png", shot: "assets/apps/app-juego.jpg", boton: "Jugar ahora" },
    ],
  },

  experiencias: {
    etiqueta: "Experiencias y escenarios",
    titulo: "Contenidos en vivo durante los tres días.",
    cifras: ["+5 escenarios", "+160 contenidos en vivo"],
    mosaico: [
      { src: "assets/fotos/charlas-escenario.jpg", alt: "Panel de charla bajo una estructura de cañas" },
      { src: "assets/fotos/vista-aerea-domo.jpg", alt: "Vista aérea del predio con el domo y el público" },
      { src: "assets/fotos/baile.jpg", alt: "Público bailando frente al escenario al atardecer" },
      { src: "assets/fotos/encuentro-amigos.jpg", alt: "Grupo de amigos sentados sobre fardos de paja en el predio" },
    ],
    // Descripciones tomadas de bioferia.info. La programación se publicará más adelante.
    escenarios: [
      { nombre: "Escenario principal", descripcion: null, color: "rosa" },
      { nombre: "Domo Futuro", descripcion: "Innovación, tecnologías y energías renovables.", color: "amarillo" },
      { nombre: "Charlas bajo el árbol", descripcion: "Inspiración, referentes y tercer sector.", color: "amarillo" },
      { nombre: "Escenario sunset", descripcion: "Música electrónica.", color: "rosa" },
      { nombre: "Escenario acústico", descripcion: "Músicos independientes.", color: "rosa" },
    ],
    notaProgramacion: "Mirá la agenda día por día.",
  },

  // Agenda por día. h = hora de inicio (HH:MM, hora de Buenos Aires). destacado: momento clave del día.
  agenda: {
    etiqueta: "Agenda",
    titulo: "Tres días, tres formas de activar el cambio.",
    texto: "Elegí un día y mirá qué pasa hora por hora. Los horarios son orientativos y pueden ajustarse.",
    nota: "Programación sujeta a cambios. Los horarios corresponden a Buenos Aires (GMT-3).",
    dias: [
      { fecha: "2027-04-09", dia: "09", corto: "Activar", palabra: "Activar", resto: " el cambio", color: "azul", items: [
        { h: "11:00", t: "Apertura de puertas", d: "Ingreso del público y recorrido por la feria." },
        { h: "11:30", t: "Acto de puertas", d: "Bienvenida oficial e inicio de Bioferia 2027.", destacado: true },
        { h: "12:00", t: "¿Qué activa el cambio?", d: "Charla sobre hábitos para un futuro mejor." },
        { h: "13:00", t: "Cocina consciente", d: "Ideas para aprovechar mejor los alimentos." },
        { h: "14:00", t: "Taller de reciclaje creativo", d: "Convertir residuos en objetos nuevos y útiles." },
        { h: "15:00", t: "Moda circular", d: "Reparar y reutilizar prendas para darles vida." },
        { h: "16:00", t: "Historias que inspiran", d: "Emprendedores comparten cambios positivos." },
        { h: "17:00", t: "Experiencia participativa", d: "Compartir ideas para cuidar nuestro planeta." },
        { h: "18:00", t: "Cierre de actividades", d: "Último recorrido y despedida de la jornada." },
      ] },
      { fecha: "2027-04-10", dia: "10", corto: "Transformar", palabra: "Transformar", resto: " hábitos", color: "rojo", items: [
        { h: "11:00", t: "Apertura de la jornada", d: "Bienvenida y recorrido por los espacios." },
        { h: "12:00", t: "Consumo responsable", d: "Elegir productos de manera más consciente." },
        { h: "13:00", t: "Sabores sustentables", d: "Descubrir sabores e ingredientes naturales." },
        { h: "14:00", t: "Taller: segunda vida", d: "Crear objetos con materiales reutilizados." },
        { h: "14:30", t: "Pausa activa", d: "Mover el cuerpo y conectar con la naturaleza.", destacado: true },
        { h: "15:00", t: "Energías renovables", d: "Descubrir energías para un futuro más limpio." },
        { h: "16:00", t: "Moda con propósito", d: "Diseñar prendas con conciencia ambiental." },
        { h: "17:00", t: "Desafío sustentable", d: "Poner a prueba lo aprendido con juegos." },
        { h: "18:00", t: "Cierre de actividades", d: "Recorrido final por los espacios de la feria." },
      ] },
      { fecha: "2027-04-11", dia: "11", corto: "Catalizador", palabra: "Ser el", resto: " catalizador", color: "rosa", items: [
        { h: "11:00", t: "Apertura de la última jornada", d: "Bienvenida e inicio del último día de feria." },
        { h: "12:00", t: "Pequeñas acciones, grandes cambios", d: "Ideas para transformar nuestros hábitos." },
        { h: "13:00", t: "Taller de huerta urbana", d: "Aprender a cultivar en pequeños espacios." },
        { h: "14:00", t: "Ecoemprendedores en acción", d: "Conocer proyectos que generan cambios." },
        { h: "15:00", t: "Intercambio sustentable", d: "Compartir, reutilizar y descubrir nuevas ideas." },
        { h: "16:00", t: "Activá tu cambio", d: "Elegir una acción para cuidar el ambiente." },
        { h: "17:00", t: "Último encuentro", d: "Recordar experiencias y aprendizajes." },
        { h: "17:30", t: "Show de cierre · El cambio nos une", d: "Celebrar juntos el cambio y la sustentabilidad.", destacado: true },
        { h: "18:00", t: "Fin de Bioferia 2027", d: "Despedida final y cierre de la experiencia." },
      ] },
    ],
  },

  gastronomia: {
    etiqueta: "Gastronomía",
    titulo: "Propuesta gastronómica consciente.",
    texto:
      "El área gastronómica de Bioferia reúne chefs, productores, food trucks y propuestas de autor que comparten una misma convicción: que lo que elegimos comer importa.",
    remate: "Muchos perfiles, un propósito en común.",
    perfiles: ["Chefs", "Productores", "Food trucks", "Propuestas de autor"],
    foto: { src: "assets/galeria/g36.jpg", alt: "Mesa larga con gente comiendo frente al food truck de pastas en Bioferia" },
  },

  impacto: {
    etiqueta: "Impacto",
    titulo: "Bioferia en números.",
    cifras: [
      { valor: "350", unidad: "mil", texto: "personas ya vivieron la experiencia Bioferia", nota: "Dato acumulado", color: "rojo" },
      { valor: "32.000", unidad: "m²", texto: "para disfrutar de experiencias que te conectarán con la sustentabilidad", nota: "Superficie del predio", color: "turquesa" },
      { valor: "45.000", unidad: "", texto: "personas vinieron a celebrar el cambio en Bioferia BA 2026", nota: "Edición 2026", color: "azul" },
      { valor: "+2.000", unidad: "", texto: "expositores eligieron Bioferia para compartir su impacto", nota: "Dato histórico", color: "rosa" },
    ],
    compromisosTitulo: "Porque nuestro compromiso es real, así hacemos Bioferia.",
    compromisos: [
      "Evento carbono neutral",
      "Separación y gestión responsable de residuos",
      "Materiales biodegradables y compostables",
      "Becas para ONGs",
    ],
  },

  region: {
    etiqueta: "Bioferia en la región",
    titulo: "Un festival que viaja.",
    sedes: [
      { ciudad: "Buenos Aires", pais: "Argentina", actual: true },
      { ciudad: "La Plata", pais: "Argentina" },
      { ciudad: "Córdoba", pais: "Argentina" },
      { ciudad: "Rosario", pais: "Argentina" },
      { ciudad: "Montevideo", pais: "Uruguay" },
      { ciudad: "Tulum", pais: "México" },
      { ciudad: "CDMX", pais: "México" },
    ],
    sedesHref: "https://www.bioferia.info/por-el-mundo",
    organizacion: {
      texto: "Bioferia es un evento producido por GrupoBio. Más de 15 años promoviendo la sustentabilidad en Latinoamérica.",
      organizan: [
        { src: "assets/logos/org-bioferia.png", alt: "Bioferia" },
        { src: "assets/logos/org-greenbondi.png", alt: "greenbondi, agencia de sustentabilidad" },
        { src: "assets/logos/org-bioguia.png", alt: "Bioguía" },
      ],
      anfitrion: [{ src: "assets/logos/host-hipodromo-palermo.png", alt: "Hipódromo de Palermo" }],
    },
  },

  contacto: {
    titulo: "¿Te sumás?",
    texto: "¿Sponsor, expositor o prensa? Contanos qué te trae por acá.",
    grafica: { src: "assets/graficas/el-cambio-empieza-con-vos.png", alt: "El cambio empieza con vos" },
    perfiles: ["Sponsor", "Expositor", "Prensa", "Escuelas", "ONGs"],
    // Sin servicio de envío conectado: el formulario funciona en modo demostración.
    endpoint: null,
    avisoDemo: "Formulario de demostración: todavía no está conectado y no envía mensajes.",
  },

  redes: [
    { red: "Instagram", href: "https://www.instagram.com/bio.feria/" },
    { red: "Facebook", href: "https://www.facebook.com/BioferiaOficial" },
    { red: "TikTok", href: "https://www.tiktok.com/@bioferia" },
    { red: "LinkedIn", href: "https://www.linkedin.com/company/51604338/" },
  ],

  graficas: {
    organismo: "assets/graficas/organismo-rosa.png",
  },
};
