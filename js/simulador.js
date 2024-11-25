document.addEventListener('DOMContentLoaded', function () {
    console.log("Página cargada. Inicializando simulador...");

    // Variables globales
    const calcularButton = document.getElementById('calcularButton');
    const limpiarHistorialButton = document.getElementById('limpiarHistorial');

    const { DateTime } = luxon;

    // Función para cargar feriados desde un JSON local
    let feriados = [];
    fetch('./feriados.json')
        .then(response => response.json())
        .then(data => {
            feriados = data.map(fecha => DateTime.fromISO(fecha));
            console.log("Feriados cargados:", feriados);
        })
        .catch(error => console.error("Error al cargar feriados:", error));

    // Cargar historial al iniciar
    cargarHistorial();

    calcularButton.addEventListener('click', function (e) {
        e.preventDefault();
        console.log("Botón calcular presionado");

        // Obtener valores del formulario
        const monto = document.getElementById('monto').value.trim();
        const plazo = document.getElementById('plazo').value.trim();
        const periodo = document.getElementById('periodo').value;

        console.log("Datos ingresados:", { monto, plazo, periodo });

        // Validaciones de formulario usando Validator.js
        if (!validator.isNumeric(monto) || parseFloat(monto) <= 0) {
            alert("Por favor, ingresa un monto válido (número mayor a 0).");
            return;
        }
        if (!validator.isInt(plazo, { min: 1 })) {
            alert("Por favor, ingresa un número entero válido para las cuotas.");
            return;
        }

        const montoNum = parseFloat(monto);
        const plazoNum = parseInt(plazo, 10);
        const interes = 0.049; // Interés fijo del 4.9%
        const dias_del_periodo = calcularDiasDelPeriodo(periodo);

        console.log("Días del período:", dias_del_periodo);

        // Cálculos del préstamo
        const tiempoEnMeses = Math.ceil((plazoNum * dias_del_periodo) / 30);
        const interesTotal = montoNum * interes * tiempoEnMeses;
        const totalAPagar = montoNum + interesTotal;
        const cuotaIndividual = totalAPagar / plazoNum;

        console.log("Cálculos:", { tiempoEnMeses, interesTotal, totalAPagar, cuotaIndividual });

        // Calcular fechas de pago usando Luxon
        const fechaActual = DateTime.now();
        const fechaInicioPago = calcularFechaInicioPago(fechaActual, dias_del_periodo, periodo);
        const fechaUltimoPago = calcularFechaFinalPago(fechaInicioPago, plazoNum, dias_del_periodo, periodo);

        console.log("Fechas calculadas:", { fechaInicioPago, fechaUltimoPago });

        // Mostrar resultados en el DOM
        document.getElementById('totalpagar').value = totalAPagar.toFixed(2);
        document.getElementById('cuotaindividual').value = cuotaIndividual.toFixed(2);
        document.getElementById('interestotal').value = interesTotal.toFixed(2);
        document.getElementById('fechainicio').value = fechaInicioPago.toLocaleString(DateTime.DATE_SHORT);
        document.getElementById('ultimafecha').value = fechaUltimoPago.toLocaleString(DateTime.DATE_SHORT);

        console.log("Resultados mostrados en el DOM");

        // Guardar en el historial
        guardarEnHistorial({
            monto: montoNum.toFixed(2),
            periodo,
            plazo: plazoNum,
            totalAPagar: totalAPagar.toFixed(2),
            cuotaIndividual: cuotaIndividual.toFixed(2),
            interesTotal: interesTotal.toFixed(2),
            fechaInicio: fechaInicioPago.toLocaleString(DateTime.DATE_SHORT),
            fechaUltimoPago: fechaUltimoPago.toLocaleString(DateTime.DATE_SHORT)
        });
    });

    limpiarHistorialButton.addEventListener('click', function () {
        console.log("Botón limpiar historial presionado");
        localStorage.removeItem('historial');
        cargarHistorial();
        alert("Historial borrado exitosamente.");
    });

    function calcularDiasDelPeriodo(periodo) {
        console.log("Calculando días del período:", periodo);
        const periodos = {
            'Diario': 1,
            'Semanal': 7,
            'Quincenal': 15,
            'Mensual': 30,
            'Bimestral': 60,
            'Trimestral': 90,
            'Medio_ano': 180,
            'Anual': 365
        };
        return periodos[periodo] || 1;
    }

    function calcularFechaInicioPago(fecha, dias_del_periodo, periodo) {
        console.log("Calculando fecha de inicio de pago", { fecha, dias_del_periodo, periodo });
        let nuevaFecha = fecha.plus({ days: dias_del_periodo });
        return fechaHabil(nuevaFecha);
    }

    function calcularFechaFinalPago(fechaInicio, plazo, dias_del_periodo, periodo) {
        console.log("Calculando fecha final de pago", { fechaInicio, plazo, dias_del_periodo, periodo });
        let fechaFinal = fechaInicio;
        for (let i = 0; i < plazo - 1; i++) {
            fechaFinal = fechaFinal.plus({ days: dias_del_periodo });
            fechaFinal = fechaHabil(fechaFinal);
        }
        return fechaFinal;
    }

    function fechaHabil(fecha) {
        console.log("Verificando si la fecha es hábil:", fecha);
        while (esDomingoOferiado(fecha)) {
            console.log("Fecha no hábil encontrada:", fecha);
            fecha = fecha.plus({ days: 1 });
        }
        return fecha;
    }

    function esDomingoOferiado(fecha) {
        return fecha.weekday === 7 || feriados.some(feriado => feriado.hasSame(fecha, 'day'));
    }

    function guardarEnHistorial(simulacion) {
        console.log("Guardando en historial:", simulacion);
        const historial = JSON.parse(localStorage.getItem('historial')) || [];
        historial.push(simulacion);
        localStorage.setItem('historial', JSON.stringify(historial));
        cargarHistorial();
    }

    function cargarHistorial() {
        console.log("Cargando historial...");
        const historial = JSON.parse(localStorage.getItem('historial')) || [];
        console.log("Historial cargado:", historial);

        const tabla = document.getElementById('resultadosTabla');
        tabla.innerHTML = '';

        if (historial.length === 0) {
            const filaVacia = document.createElement('tr');
            filaVacia.innerHTML = '<td colspan="8">No hay simulaciones previas.</td>';
            tabla.appendChild(filaVacia);
            return;
        }

        historial.forEach(simulacion => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${simulacion.monto}</td>
                <td>${simulacion.periodo}</td>
                <td>${simulacion.plazo}</td>
                <td>${simulacion.totalAPagar}</td>
                <td>${simulacion.cuotaIndividual}</td>
                <td>${simulacion.interesTotal}</td>
                <td>${simulacion.fechaInicio}</td>
                <td>${simulacion.fechaUltimoPago}</td>
            `;
            tabla.appendChild(fila);
        });
    }
});
