// Variables
const feriados = ["01/06/2024", "05/10/2024", "21/10/2024", "25/12/2024"].map(fecha => new Date(fecha));
const interes = 0.049;

// Función principal
function iniciarCalculo() {
    let monto = parseFloat(prompt('Ingrese el monto:'));
    let plazo = parseInt(prompt('Ingrese el plazo (número de pagos):'));
    let periodo = prompt('Ingrese el periodo (Diario, Semanal, Quincenal, Mensual, Bimestral, Trimestral, Medio Año, Anual):');

    if (!validarDatos(monto, plazo)) return;

    console.log(`Monto: ${monto}, Plazo: ${plazo}, Interés: ${interes}, Periodo: ${periodo}`);

    let dias_del_periodo;
    switch (periodo) {
        case 'Diario': dias_del_periodo = 1; break;
        case 'Semanal': dias_del_periodo = 7; break;
        case 'Quincenal': dias_del_periodo = 15; break;
        case 'Mensual': dias_del_periodo = 30; break;
        case 'Bimestral': dias_del_periodo = 60; break;
        case 'Trimestral': dias_del_periodo = 90; break;
        case 'Medio Año': dias_del_periodo = 180; break;
        case 'Anual': dias_del_periodo = 365; break;
        default: dias_del_periodo = 1;
    }

    console.log(`Días del periodo: ${dias_del_periodo}`);

    let tiempoEnMeses = Math.ceil((plazo * dias_del_periodo) / 30);
    let interesTotal = monto * interes * tiempoEnMeses;
    let totalAPagar = monto + interesTotal;
    let cuotaIndividual = totalAPagar / plazo;

    console.log(`Interés Total: ${interesTotal.toFixed(2)}`);
    console.log(`Total a Pagar: ${totalAPagar.toFixed(2)}`);
    console.log(`Cuota Individual: ${cuotaIndividual.toFixed(2)}`);

    let fechaActual = new Date();
    let fechaInicioPago = calcularFechaInicioPago(fechaActual, dias_del_periodo);
    let fechaUltimoPago = calcularFechaFinalPago(fechaInicioPago, plazo, dias_del_periodo);

    console.log(`Fecha de Inicio de Pago: ${fechaInicioPago.toLocaleDateString()}`);
    console.log(`Fecha del Último Pago: ${fechaUltimoPago.toLocaleDateString()}`);
}

// Funciones para el cálculo de fechas
function calcularFechaInicioPago(fecha, dias_del_periodo) {
    let nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias_del_periodo);
    return fechaHabil(nuevaFecha);
}

function calcularFechaFinalPago(fechaInicio, plazo, dias_del_periodo) {
    let fechaFinal = new Date(fechaInicio);
    fechaFinal.setDate(fechaFinal.getDate() + (dias_del_periodo * (plazo - 1)));
    return fechaHabil(fechaFinal);
}

function fechaHabil(fecha) {
    while (esDomingoOferiado(fecha)) {
        fecha.setDate(fecha.getDate() + 1);
    }
    return fecha;
}

function esDomingoOferiado(fecha) {
    if (fecha.getDay() === 0) return true;
    let dateString = fecha.toLocaleDateString();
    return feriados.some(feriado => feriado.toLocaleDateString() === dateString);
}

// Validación de datos
function validarDatos(monto, plazo) {
    if (isNaN(monto) || monto <= 0) {
        alert("Por favor, ingrese un monto válido.");
        return false;
    }
    if (isNaN(plazo) || plazo <= 0) {
        alert("Por favor, ingrese un plazo válido.");
        return false;
    }
    return true;
}

// Inicia el cálculo
iniciarCalculo();
