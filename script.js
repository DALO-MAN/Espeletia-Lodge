/**
 * Espeletia Lodge - Lógica Interactiva
 * - Calendario interactivo de disponibilidad y selección de fechas
 * - Cotizador en tiempo real de hospedaje y adicionales
 * - Integración de reservas vía WhatsApp directo con Arturo Mier
 * - Traductor interactivo Español / English (Bilingüe)
 * - Menú responsive para móviles
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCalendar();
  initCalculator();
  initBookingForm();
  initLanguageSwitcher();
  initNavbarScroll();
});

/* ==========================================================================
   1. Menú Móvil & Navegación
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   2. Calendario Interactivo de Disponibilidad
   ========================================================================== */
let currentDate = new Date();
// Inicializamos en la fecha actual o temporada alta (ej. Octubre-Diciembre)
let selectedCheckIn = null;
let selectedCheckOut = null;

// Fechas ocupadas simuladas (para realismo de disponibilidad)
const occupiedDaysKeys = new Set([
  '2026-10-10', '2026-10-11', '2026-10-24', '2026-10-25',
  '2026-11-01', '2026-11-02', '2026-11-14',
  '2026-12-24', '2026-12-25', '2026-12-31'
]);

const monthNamesES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const monthNamesEN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function initCalendar() {
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  renderCalendar();
}

function renderCalendar() {
  const monthYearLabel = document.getElementById('calendarMonthYear');
  const daysGrid = document.getElementById('calendarDays');
  if (!daysGrid || !monthYearLabel) return;

  const currentLang = document.documentElement.lang || 'es';
  const monthNames = currentLang === 'en' ? monthNamesEN : monthNamesES;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYearLabel.textContent = `${monthNames[month]} ${year}`;
  daysGrid.innerHTML = '';

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Días vacíos al inicio del mes
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-day empty';
    daysGrid.appendChild(emptyCell);
  }

  // Días del mes
  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'cal-day available';
    dayCell.textContent = day;

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const thisDate = new Date(year, month, day);

    // Verificar si está ocupado
    if (occupiedDaysKeys.has(dateKey)) {
      dayCell.className = 'cal-day occupied';
      dayCell.title = currentLang === 'en' ? 'Reserved' : 'Fecha reservada';
    } else {
      // Verificar selección
      if (selectedCheckIn && isSameDay(thisDate, selectedCheckIn)) {
        dayCell.classList.add('selected');
      } else if (selectedCheckOut && isSameDay(thisDate, selectedCheckOut)) {
        dayCell.classList.add('selected');
      } else if (selectedCheckIn && selectedCheckOut && thisDate > selectedCheckIn && thisDate < selectedCheckOut) {
        dayCell.classList.add('in-range');
      }

      // Evento de selección
      dayCell.addEventListener('click', () => handleDayClick(thisDate));
    }

    daysGrid.appendChild(dayCell);
  }
}

function handleDayClick(date) {
  if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
    selectedCheckIn = date;
    selectedCheckOut = null;
  } else if (selectedCheckIn && !selectedCheckOut) {
    if (date < selectedCheckIn) {
      selectedCheckIn = date;
      selectedCheckOut = null;
    } else if (isSameDay(date, selectedCheckIn)) {
      selectedCheckIn = null;
    } else {
      selectedCheckOut = date;
    }
  }

  updateBookingDatesInputs();
  renderCalendar();
  updateFormSummary();
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function formatDateString(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${d}/${m}/${y}`;
}

function updateBookingDatesInputs() {
  const checkInInput = document.getElementById('checkInDate');
  const checkOutInput = document.getElementById('checkOutDate');

  if (checkInInput) checkInInput.value = formatDateString(selectedCheckIn);
  if (checkOutInput) checkOutInput.value = formatDateString(selectedCheckOut);
}

/* ==========================================================================
   3. Cotizador Rápido de Estadía
   ========================================================================== */
function initCalculator() {
  const guestsInput = document.getElementById('calcGuests');
  const nightsInput = document.getElementById('calcNights');
  const jacuzziCheck = document.getElementById('calcJacuzzi');
  const massagesCheck = document.getElementById('calcMassages');
  const totalDisplay = document.getElementById('calcTotal');
  const applyBtn = document.getElementById('applyToBooking');

  function calculate() {
    const guests = Math.max(1, parseInt(guestsInput.value) || 1);
    const nights = Math.max(1, parseInt(nightsInput.value) || 1);
    const hasJacuzzi = jacuzziCheck.checked;
    const hasMassages = massagesCheck.checked;

    // Hospedaje base: $80 por persona por noche
    let total = guests * 80 * nights;

    // Jacuzzi: +$8 adicionales al final
    if (hasJacuzzi) {
      total += 8;
    }

    // Masajes: +$30 por persona
    if (hasMassages) {
      total += (30 * guests);
    }

    if (totalDisplay) {
      totalDisplay.textContent = `$${total.toFixed(2)} USD`;
    }
  }

  if (guestsInput && nightsInput && jacuzziCheck && massagesCheck) {
    guestsInput.addEventListener('input', calculate);
    nightsInput.addEventListener('input', calculate);
    jacuzziCheck.addEventListener('change', calculate);
    massagesCheck.addEventListener('change', calculate);
    calculate();
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const formGuests = document.getElementById('formGuests');
      const formJacuzzi = document.getElementById('formAddonJacuzzi');
      const formMassages = document.getElementById('formAddonMassage');

      if (formGuests) formGuests.value = guestsInput.value;
      if (formJacuzzi) formJacuzzi.checked = jacuzziCheck.checked;
      if (formMassages) formMassages.checked = massagesCheck.checked;

      updateFormSummary();

      // Scroll suave a la sección de reservas
      const bookingSec = document.getElementById('reservas');
      if (bookingSec) {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* ==========================================================================
   4. Formulario de Reserva & Envío a WhatsApp
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('reservationForm');
  const formGuests = document.getElementById('formGuests');
  const formJacuzzi = document.getElementById('formAddonJacuzzi');
  const formMassages = document.getElementById('formAddonMassage');

  if (formGuests) formGuests.addEventListener('change', updateFormSummary);
  if (formJacuzzi) formJacuzzi.addEventListener('change', updateFormSummary);
  if (formMassages) formMassages.addEventListener('change', updateFormSummary);

  updateFormSummary();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('guestName').value.trim();
      const phone = document.getElementById('guestPhone').value.trim();
      const origin = document.getElementById('guestOrigin').value.trim() || 'No especificada';
      const guests = formGuests.value;
      const checkIn = document.getElementById('checkInDate').value || 'Por definir';
      const checkOut = document.getElementById('checkOutDate').value || 'Por definir';
      const hasJacuzzi = formJacuzzi.checked ? 'Sí (+$8 USD)' : 'No';
      const hasMassages = formMassages.checked ? `Sí ($30 c/u - $${parseInt(guests) * 30} USD)` : 'No';
      const notes = document.getElementById('guestNotes').value.trim() || 'Sin notas adicionales';
      const totalEstimated = document.getElementById('summaryTotalPrice').textContent;

      // Mensaje estructurado y elegante para Arturo Mier
      const message = `🌿 *NUEVA SOLICITUD DE RESERVA - ESPELETIA LODGE* 🌿\n\n` +
        `👤 *Huésped:* ${name}\n` +
        `📱 *Teléfono:* ${phone}\n` +
        `🌎 *Procedencia:* ${origin}\n` +
        `👥 *Número de Personas:* ${guests}\n` +
        `📅 *Check-in:* ${checkIn}\n` +
        `📅 *Check-out:* ${checkOut}\n\n` +
        `✨ *Servicios Incluidos:* Hospedaje, Desayuno, Almuerzo, Merienda, Caminata y Columpio ($80 c/u)\n` +
        `🛁 *Tina de Hidromasaje:* ${hasJacuzzi}\n` +
        `💆 *Sesión de Masajes:* ${hasMassages}\n` +
        `📝 *Notas / Peticiones:* ${notes}\n\n` +
        `💰 *TOTAL ESTIMADO:* ${totalEstimated}\n\n` +
        `_Enviado desde el sitio web oficial de Hostería Espeletia Lodge._`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/593995621296?text=${encodedMessage}`;

      window.open(whatsappURL, '_blank');
    });
  }
}

function updateFormSummary() {
  const formGuests = document.getElementById('formGuests');
  const formJacuzzi = document.getElementById('formAddonJacuzzi');
  const formMassages = document.getElementById('formAddonMassage');

  const basePriceElem = document.getElementById('summaryBasePrice');
  const extrasPriceElem = document.getElementById('summaryExtrasPrice');
  const totalPriceElem = document.getElementById('summaryTotalPrice');

  if (!formGuests || !basePriceElem || !extrasPriceElem || !totalPriceElem) return;

  const guests = parseInt(formGuests.value) || 2;
  
  // Calcular noches si están seleccionadas en calendario
  let nights = 1;
  if (selectedCheckIn && selectedCheckOut) {
    const diffTime = Math.abs(selectedCheckOut - selectedCheckIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    nights = diffDays > 0 ? diffDays : 1;
  }

  const baseTotal = guests * 80 * nights;
  let extrasTotal = 0;

  if (formJacuzzi && formJacuzzi.checked) {
    extrasTotal += 8;
  }

  if (formMassages && formMassages.checked) {
    extrasTotal += (guests * 30);
  }

  const total = baseTotal + extrasTotal;

  basePriceElem.textContent = `$${baseTotal.toFixed(2)} USD (${nights} noche${nights > 1 ? 's' : ''})`;
  extrasPriceElem.textContent = `$${extrasTotal.toFixed(2)} USD`;
  totalPriceElem.textContent = `$${total.toFixed(2)} USD`;
}

/* ==========================================================================
   5. Sistema de Traducción Bilingüe (Español / English)
   ========================================================================== */
const translations = {
  es: {
    'nav.home': 'Inicio',
    'nav.forest': 'El Santuario',
    'nav.lodging': 'Hospedaje & Tarifas',
    'nav.food': 'Gastronomía',
    'nav.activities': 'Actividades',
    'nav.payments': 'Formas de Pago',
    'nav.location': 'Ubicación',
    'nav.bookNow': 'Reservar Ahora',

    'hero.tagline': 'Refugio Místico en las Alturas del Carchi',
    'hero.title': 'Donde el silencio abraza la niebla y los frailejones velan tu descanso',
    'hero.poem': '"Respira el suspiro milenario del páramo andino. Deja que la bruma disuelva tus pesares, mientras el calor de nuestras cabañas de madera y el latido del bosque de papel te devuelven a lo esencial."',
    'hero.ctaReserve': 'Ver Disponibilidad y Reservar',
    'hero.ctaExplore': 'Descubrir la Experiencia',

    'hero.feat1Title': 'Bosque de Polylepis',
    'hero.feat1Sub': 'Árbol de papel milenario',
    'hero.feat2Title': 'Confort Térmico',
    'hero.feat2Sub': 'Hidromasaje y cobijas térmicas',
    'hero.feat3Title': 'Pensión Completa',
    'hero.feat3Sub': 'Desayuno, almuerzo y merienda',
    'hero.feat4Title': 'Lunes a Domingo',
    'hero.feat4Sub': 'Atención y reservas todo el año',

    'mystic.subtitle': 'El Legado Natural de El Ángel',
    'mystic.title': 'El Árbol de Papel y el Misticismo del Páramo',
    'mystic.quote': '"Sus troncos retorcidos, de una profunda tonalidad cobriza y rojiza, están cubiertos por múltiples capas de corteza delgada que se desprenden como hojas de pergamino, guardando en cada pliegue los secretos de los siglos. Caminar bajo su dosel es cruzar un umbral hacia la magia."',
    'mystic.p1': 'En la Reserva Ecológica El Ángel, la Hostería Espeletia Lodge es un refugio protegido por musgos, líquenes y helechos que parecen salidos de un cuento de hadas donde el tiempo se detiene. Aquí desafiamos la altitud y el frío andino brindándote un santuario cálido de paz, idílico para venir en pareja, familia o con tus personas más queridas.',
    'mystic.pillar1Title': 'Aire Puro e Inmaculado',
    'mystic.pillar1Text': 'Desconexión total del estrés urbano a más de 3,600 metros de altitud.',
    'mystic.pillar2Title': 'Bienestar Corporal',
    'mystic.pillar2Text': 'Fusión de hidroterapia caliente con la contemplación infinita de las montañas.',
    'mystic.badgeTitle': 'Complejo en Ladera',
    'mystic.badgeSub': 'Entre miles de Frailejones',

    'lodging.subtitle': 'Planes Todo Incluido & Confort',
    'lodging.title': 'Hospedaje Cálido & Precios Transparentes',
    'lodging.desc': 'Cabañas de madera construidas sobre palafitos con amplios ventanales, equipadas con cobijas eléctricas para un descanso insuperable.',
    'lodging.ribbon': 'Experiencia Recomendada',
    'lodging.planName': 'Paquete Integral Espeletia',
    'lodging.planTag': 'Todo incluido por persona por noche',
    'lodging.includesHeader': 'Tu estadía incluye:',
    'lodging.f1B': 'Alojamiento en Cabaña de Madera:',
    'lodging.f1': 'Habitación con vista panorámica y cobija eléctrica.',
    'lodging.f2B': 'Desayuno Andino Completo:',
    'lodging.f2': 'Fruta fresca, huevos, tostadas calientes y bebida aromática.',
    'lodging.f3B': 'Almuerzo Gourmet:',
    'lodging.f3': 'Plato fuerte tradicional (trucha / carnes con guarniciones y salsa de champiñones).',
    'lodging.f4B': 'Merienda Típica de Páramo:',
    'lodging.f4': 'Tortillas de tiesto al calor del fuego y café/infusión.',
    'lodging.f5B': 'Caminata Guiada:',
    'lodging.f5': 'Sendero místico por la laguna y el interior del bosque de Polylepis.',
    'lodging.f6B': 'Paseo en el Columpio Extremo:',
    'lodging.f6': 'Vuelo panorámico con vista a las laderas del páramo.',
    'lodging.btnReserve': 'Seleccionar Fechas',
    'lodging.jacuzziTitle': 'Tina de Hidromasaje Panorámica',
    'lodging.jacuzziDesc': 'Relájate en agua caliente con hidrojets mientras contemplas a través del gran ventanal las colinas y el misterio del páramo. (Adicional sobre el precio final de tu paquete).',
    'lodging.massageTitle': 'Sesión de Masajes Antiestrés',
    'lodging.massageDesc': 'Terapeutas especializados para desvanecer contracturas y elevar tu vivencia hacia el éxtasis de la paz interior en la calidez de la cabaña.',

    'calc.title': 'Cotizador Rápido de Estadía',
    'calc.people': 'Huéspedes:',
    'calc.nights': 'Noches:',
    'calc.addJacuzzi': 'Incluir Tina de Hidromasaje (+$8)',
    'calc.addMassage': 'Añadir Masajes ($30 c/u)',
    'calc.totalLabel': 'Total Estimado:',
    'calc.applyBtn': 'Llevar a Reservas',

    'food.subtitle': 'Sabores Entrañables & Tradición',
    'food.title': 'Gastronomía de Altura: Del Tiesto a tu Mesa',
    'food.desc': 'En el clima frío del páramo, cada plato es un abrazo cálido para el alma. Tu hospedaje incluye los tres momentos del día preparados con ingredientes frescos y amor andino.',
    'food.b1': 'Mañanas con Energía',
    'food.c1Title': 'Desayuno Andino Nutritivo',
    'food.c1Desc': 'Selección de frutas frescas picadas (papaya, kiwi, uvas), huevos revueltos suaves y esponjosos, crujientes tostadas doradas y café de altura recién pasado.',
    'food.b2': 'Sabor Gourmet',
    'food.c2Title': 'Almuerzo Especial de Páramo',
    'food.c2Desc': 'Filete dorado a la plancha bañado en salsa cremosa de champiñones silvestres, acompañado de papas rústicas crocantes, arroz andino y ensalada de huerto.',
    'food.b3': 'Tradición al Fuego',
    'food.c3Title': 'Merienda Típica & Tertulia',
    'food.c3Desc': 'Tortillas de tiesto artesanales asadas a la brasa, servidas con una reconfortante taza humeante de café o infusión de hierbas locales, para abrigar la caída de la tarde.',
    'food.included': 'Incluido en tu estadía',
    'food.restSub': 'Salón Comedor y Cafetería',
    'food.restTitle': 'Un Mirador Cálido frente al Bosque',
    'food.restP': 'Nuestro restaurante cuenta con amplios ventanales panorámicos que permiten contemplar los troncos retorcidos del Polylepis mientras disfrutas tus alimentos. Para tu confort, disponemos de calefactores de ambiente que mantienen un clima acogedor en todo momento.',

    'activities.subtitle': 'Experiencias Memorables',
    'activities.title': 'Aventura, Senderismo & Adrenalina Serena',
    'activities.act1Tag': 'Adrenalina en las Alturas',
    'activities.act1Title': 'El Columpio Extremo del Páramo',
    'activities.act1Desc': 'Balancéate sobre el abismo verde rodeado de frailejones y montañas envueltas en nubes. La foto perfecta y una sensación inigualable de libertad absoluta. (Incluido en tu paquete).',
    'activities.act2Tag': 'Misticismo & Flora',
    'activities.act2Title': 'Caminata Guiada por la Laguna',
    'activities.act2Desc': 'Senderos serpenteantes que bordean espejos de agua cristalina y la corteza rojiza del bosque milenario. (Incluido en tu paquete).',
    'activities.act3Tag': 'Paz Interior',
    'activities.act3Title': 'Cabañas con Miradores & Juegos',
    'activities.act3Desc': 'Disfruta de juegos de mesa de madera, lectura junto al ventanal y silencio reparador, lejos de la rutina y las pantallas.',

    'booking.subtitle': 'Planifica tus Vacaciones',
    'booking.title': 'Disponibilidad & Reserva Directa',
    'booking.desc': 'Consulta en tiempo real los días disponibles, selecciona tus fechas y confirma con Arturo Mier para asegurar tu cabaña en el páramo.',
    'cal.sun': 'Dom', 'cal.mon': 'Lun', 'cal.tue': 'Mar', 'cal.wed': 'Mié', 'cal.thu': 'Jue', 'cal.fri': 'Vie', 'cal.sat': 'Sáb',
    'cal.avail': 'Disponible', 'cal.sel': 'Seleccionado', 'cal.occ': 'Reservado',

    'bookForm.title': 'Tu Reserva en Espeletia',
    'bookForm.checkIn': 'Check-in:',
    'bookForm.checkOut': 'Check-out:',
    'bookForm.name': 'Nombre Completo:',
    'bookForm.phone': 'Teléfono / WhatsApp:',
    'bookForm.guests': 'Número de Personas ($80 c/u):',
    'bookForm.origin': 'Procedencia:',
    'bookForm.servicesTitle': 'Servicios Adicionales Deseados:',
    'bookForm.jacuzziOpt': 'Tina de Hidromasaje con vista (+$8 USD al total)',
    'bookForm.massageOpt': 'Sesión de Masajes Antiestrés ($30 USD por persona)',
    'bookForm.notes': 'Petición Especial / Requerimientos Alimenticios:',
    'bookForm.baseCost': 'Hospedaje Integral:',
    'bookForm.extrasCost': 'Adicionales seleccionados:',
    'bookForm.total': 'Total Estimado:',
    'bookForm.btnSubmit': 'Confirmar Reserva por WhatsApp',
    'bookForm.disclaimer': 'Se abrirá un chat directo con Arturo Mier (0995621296) con los detalles listos.',

    'payments.subtitle': 'Facilidades & Seguridad',
    'payments.title': 'Formas de Pago Aceptadas',
    'payments.desc': 'Ponemos a tu disposición métodos convenientes y seguros para gestionar tu abono o pago completo.',
    'payments.p1Title': 'Efectivo',
    'payments.p1Desc': 'Puedes realizar el pago en efectivo directamente en la recepción de la hostería al momento de tu llegada o check-in.',
    'payments.p1Badge': 'Recepción Lodge',
    'payments.p2Featured': 'Recomendado Nacional',
    'payments.p2Title': 'Transferencia Bancaria',
    'payments.p2Desc': 'Para asegurar tu cupo previo, aceptamos transferencias y depósitos bancarios directos:',
    'payments.p2Badge': 'Transferencia Directa',
    'payments.p3Title': 'Tarjetas de Crédito / Débito',
    'payments.p3Desc': 'Aceptamos las principales tarjetas nacionales e internacionales para turistas del país y extranjeros.',
    'payments.p3Badge': 'Procesamiento Seguro',

    'location.subtitle': 'Encuéntranos en las Alturas',
    'location.title': '¿Cómo Llegar a Espeletia Lodge?',
    'location.desc': 'Ubicados en el corazón de la Reserva Ecológica El Ángel, Carchi, Ecuador.',
    'location.natTitle': 'Para Visitantes Nacionales (Carro Propio)',
    'location.natDesc': 'Desde Quito o Ibarra, toma la ruta Panamericana Norte hacia el Carchi. Al llegar a la vía hacia El Ángel, sigue la señalización hacia la Reserva Ecológica.',
    'location.intTitle': 'Para Turistas Extranjeros & Tours',
    'location.intDesc': 'Visitantes internacionales pueden coordinar transporte en buses turísticos o servicios privados directamente hasta el lodge.',
    'location.tipsTitle': 'Recomendaciones para el Páramo',
    'location.tipsDesc': 'Llevar ropa abrigada e impermeable, calzado cómodo de trekking y cámara fotográfica.',

    'reviews.subtitle': 'Huellas en el Páramo',
    'reviews.title': 'Voces de Quienes Vivieron la Magia'
  },
  en: {
    'nav.home': 'Home',
    'nav.forest': 'The Sanctuary',
    'nav.lodging': 'Lodging & Rates',
    'nav.food': 'Gastronomy',
    'nav.activities': 'Activities',
    'nav.payments': 'Payment Methods',
    'nav.location': 'Location',
    'nav.bookNow': 'Book Now',

    'hero.tagline': 'Mystical Refuge in the Heights of Carchi',
    'hero.title': 'Where silence embraces the mist and ancient Frailejones guard your rest',
    'hero.poem': '"Breathe the millennial sigh of the Andean moorland. Let the mist dissolve your worries while the warmth of our wooden cabins and the rhythm of the paper tree forest bring you back to what matters."',
    'hero.ctaReserve': 'Check Availability & Book',
    'hero.ctaExplore': 'Discover the Experience',

    'hero.feat1Title': 'Polylepis Forest',
    'hero.feat1Sub': 'Millennial Paper Tree',
    'hero.feat2Title': 'Thermal Comfort',
    'hero.feat2Sub': 'Hot tub & heated blankets',
    'hero.feat3Title': 'All-Inclusive Meals',
    'hero.feat3Sub': 'Breakfast, lunch & evening tea',
    'hero.feat4Title': 'Monday to Sunday',
    'hero.feat4Sub': 'Open all year round',

    'mystic.subtitle': 'The Natural Legacy of El Ángel',
    'mystic.title': 'The Paper Tree & The Mysticism of the Páramo',
    'mystic.quote': '"Its twisted copper and reddish trunks are wrapped in paper-thin bark peeling off like parchment leaves, holding the secrets of centuries. Walking beneath its canopy is stepping through the threshold of magic."',
    'mystic.p1': 'Within El Ángel Ecological Reserve, Espeletia Lodge is a fairy-tale sanctuary embraced by mosses, lichens, and ferns where time stands still. We defy the cold Andean altitude by offering a cozy haven of peace, perfect for couples, families, and nature lovers.',
    'mystic.pillar1Title': 'Pure Andean Air',
    'mystic.pillar1Text': 'Total disconnection from urban stress at over 3,600 meters above sea level.',
    'mystic.pillar2Title': 'Body Wellness',
    'mystic.pillar2Text': 'A soothing fusion of hot hydrotherapy and endless contemplation of the peaks.',
    'mystic.badgeTitle': 'Hillside Complex',
    'mystic.badgeSub': 'Surrounded by Frailejones',

    'lodging.subtitle': 'All-Inclusive Plans & Comfort',
    'lodging.title': 'Cozy Lodging & Clear Pricing',
    'lodging.desc': 'Handcrafted stilt cabins with panoramic windows, equipped with electric blankets for blissful sleep.',
    'lodging.ribbon': 'Recommended Choice',
    'lodging.planName': 'Espeletia Full Package',
    'lodging.planTag': 'All-inclusive per person per night',
    'lodging.includesHeader': 'Your stay includes:',
    'lodging.f1B': 'Wooden Cabin Accommodation:',
    'lodging.f1': 'Panoramic room with electric thermal blankets.',
    'lodging.f2B': 'Complete Andean Breakfast:',
    'lodging.f2': 'Fresh fruits, eggs, golden toast and hot Andean coffee/tea.',
    'lodging.f3B': 'Gourmet Lunch:',
    'lodging.f3': 'Traditional dish (trout/beef with mushroom sauce & sides).',
    'lodging.f4B': 'Traditional Páramo Tea:',
    'lodging.f4': 'Artisanal clay-pan bread (tortillas de tiesto) & hot drinks.',
    'lodging.f5B': 'Guided Forest Trek:',
    'lodging.f5': 'Mystical trail by the lagoon and through the Polylepis forest.',
    'lodging.f6B': 'Extreme Mountain Swing:',
    'lodging.f6': 'Breathtaking swing overlooking the Andean slopes.',
    'lodging.btnReserve': 'Choose Dates',
    'lodging.jacuzziTitle': 'Panoramic Hydrotherapy Hot Tub',
    'lodging.jacuzziDesc': 'Relax in soothing warm waters while admiring mountain vistas through floor-to-ceiling glass. (Add-on on final total).',
    'lodging.massageTitle': 'Anti-Stress Massage Session',
    'lodging.massageDesc': 'Specialized massage therapists to relieve muscle tension in the cozy warmth of your cabin.',

    'calc.title': 'Quick Stay Calculator',
    'calc.people': 'Guests:',
    'calc.nights': 'Nights:',
    'calc.addJacuzzi': 'Include Hot Tub (+$8)',
    'calc.addMassage': 'Add Massages ($30 each)',
    'calc.totalLabel': 'Estimated Total:',
    'calc.applyBtn': 'Apply to Booking',

    'food.subtitle': 'Soulful Flavors & Tradition',
    'food.title': 'Highland Cuisine: From Fire to Table',
    'food.desc': 'In the crisp mountain air, each meal is a warm hug for your spirit. Your stay includes breakfast, lunch, and evening snacks made with local care.',
    'food.b1': 'Energetic Mornings',
    'food.c1Title': 'Nutritious Andean Breakfast',
    'food.c1Desc': 'Fresh sliced fruits, scrambled eggs, toasted bread, and freshly brewed highland coffee.',
    'food.b2': 'Gourmet Flavors',
    'food.c2Title': 'Special Páramo Lunch',
    'food.c2Desc': 'Pan-seared trout or cutlet smothered in wild mushroom cream sauce, rustic potatoes, and fresh salad.',
    'food.b3': 'Fireside Tradition',
    'food.c3Title': 'Evening Hearth Snack',
    'food.c3Desc': 'Artisanal clay-pan flatbreads hot from the stove, served with aromatic local herbal tea or hot coffee.',
    'food.included': 'Included in your stay',
    'food.restSub': 'Dining Room & Coffee Lounge',
    'food.restTitle': 'A Warm Viewpoint over the Forest',
    'food.restP': 'Our dining room offers wide panoramic windows looking directly out onto the ancient Polylepis trees, with indoor space heaters to keep you cozy.',

    'activities.subtitle': 'Memorable Experiences',
    'activities.title': 'Adventure, Hiking & Serene Thrills',
    'activities.act1Tag': 'Highland Thrills',
    'activities.act1Title': 'The Extreme Páramo Swing',
    'activities.act1Desc': 'Soar over the green valley surrounded by Frailejones and misty clouds. The ultimate photo spot! (Included).',
    'activities.act2Tag': 'Mysticism & Flora',
    'activities.act2Title': 'Guided Lake & Forest Trek',
    'activities.act2Desc': 'Winding paths along mirror-like waters and ancient red-barked paper trees. (Included).',
    'activities.act3Tag': 'Inner Peace',
    'activities.act3Title': 'Cabins with Board Games & Views',
    'activities.act3Desc': 'Enjoy wooden board games, read by the window, and reconnect with quiet nature.',

    'booking.subtitle': 'Plan Your Holiday',
    'booking.title': 'Availability & Direct Booking',
    'booking.desc': 'Check available dates in real time and confirm directly with host Arturo Mier via WhatsApp.',
    'cal.sun': 'Sun', 'cal.mon': 'Mon', 'cal.tue': 'Tue', 'cal.wed': 'Wed', 'cal.thu': 'Thu', 'cal.fri': 'Fri', 'cal.sat': 'Sat',
    'cal.avail': 'Available', 'cal.sel': 'Selected', 'cal.occ': 'Reserved',

    'bookForm.title': 'Your Reservation at Espeletia',
    'bookForm.checkIn': 'Check-in:',
    'bookForm.checkOut': 'Check-out:',
    'bookForm.name': 'Full Name:',
    'bookForm.phone': 'Phone / WhatsApp:',
    'bookForm.guests': 'Number of Guests ($80 each):',
    'bookForm.origin': 'Origin / Country:',
    'bookForm.servicesTitle': 'Selected Extra Amenities:',
    'bookForm.jacuzziOpt': 'Panoramic Hot Tub (+$8 USD total)',
    'bookForm.massageOpt': 'Anti-Stress Massage ($30 USD per person)',
    'bookForm.notes': 'Special Request / Dietary Needs:',
    'bookForm.baseCost': 'Full Lodging Package:',
    'bookForm.extrasCost': 'Selected Extras:',
    'bookForm.total': 'Estimated Total:',
    'bookForm.btnSubmit': 'Confirm Booking on WhatsApp',
    'bookForm.disclaimer': 'This opens a direct chat with Arturo Mier (0995621296) with your details ready.',

    'payments.subtitle': 'Convenience & Trust',
    'payments.title': 'Accepted Payment Methods',
    'payments.desc': 'We offer safe, flexible payment channels for your convenience.',
    'payments.p1Title': 'Cash',
    'payments.p1Desc': 'Pay in cash upon arrival at the lodge reception desk during your check-in.',
    'payments.p1Badge': 'Lodge Reception',
    'payments.p2Featured': 'Recommended in Ecuador',
    'payments.p2Title': 'Bank Transfer',
    'payments.p2Desc': 'Direct bank deposit to secure your booking in advance:',
    'payments.p2Badge': 'Direct Transfer',
    'payments.p3Title': 'Credit & Debit Cards',
    'payments.p3Desc': 'We accept Visa, Mastercard, and American Express for international and domestic guests.',
    'payments.p3Badge': 'Secure Processing',

    'location.subtitle': 'Find Us in the Highlands',
    'location.title': 'How to Reach Espeletia Lodge',
    'location.desc': 'Located in the heart of El Ángel Ecological Reserve, Carchi, Ecuador.',
    'location.natTitle': 'For Domestic Travelers (Private Car)',
    'location.natDesc': 'From Quito or Ibarra, take the Pan-American Highway North into Carchi. Follow signs towards El Ángel Reserve.',
    'location.intTitle': 'For International Guests & Tours',
    'location.intDesc': 'Guests from Germany, Switzerland, the US, Colombia, and Argentina can arrange chartered tour transport directly to the lodge.',
    'location.tipsTitle': 'Highland Travel Tips',
    'location.tipsDesc': 'Bring warm windproof clothing, sturdy hiking shoes, sunscreen, and a camera.',

    'reviews.subtitle': 'Guest Memories',
    'reviews.title': 'Stories from Those Who Lived the Magic'
  }
};

function initLanguageSwitcher() {
  const langBtn = document.getElementById('lang-btn');
  const langText = document.getElementById('current-lang-text');
  let currentLanguage = 'es';

  if (langBtn && langText) {
    langBtn.addEventListener('click', () => {
      currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
      document.documentElement.lang = currentLanguage;
      langText.textContent = currentLanguage === 'es' ? 'EN' : 'ES';
      applyTranslations(currentLanguage);
      renderCalendar();
    });
  }
}

function applyTranslations(lang) {
  const dict = translations[lang];
  if (!dict) return;

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}
