document.addEventListener('DOMContentLoaded', function () {
    console.log("Página cargada. Inicializando simulador...");

    // Variables globales
    let calcularButton = document.getElementById('calcularButton');
    let limpiarHistorialButton = document.getElementById('limpiarHistorial');
    let feriados = ["01/06/2024", "05/10/2024", "21/10/2024", "25/12/2024"].map(fecha => new Date(fecha));
    console.log("Feriados cargados:", feriados);

    // Cargar historial al iniciar
    cargarHistorial();

    calcularButton.addEventListener('click', function (e) {
        e.preventDefault();
        console.log("Botón calcular presionado");

        // Obtener valores del formulario
        let monto = parseFloat(document.getElementById('monto').value);
        let plazo = parseInt(document.getElementById('plazo').value);
        const interes = 0.049; // Interés fijo del 4.9%
        let periodo = document.getElementById('periodo').value;

        console.log("Datos ingresados:", { monto, plazo, periodo, interes });

        if (!validarDatos(monto, plazo)) return;

        // Determinar días del periodo
        let dias_del_periodo = calcularDiasDelPeriodo(periodo);
        console.log("Días del período:", dias_del_periodo);

        // Calcular datos del préstamo
        let tiempoEnMeses = Math.ceil((plazo * dias_del_periodo) / 30);
        let interesTotal = monto * interes * tiempoEnMeses;
        let totalAPagar = monto + interesTotal;
        let cuotaIndividual = totalAPagar / plazo;

        console.log("Cálculos:", { tiempoEnMeses, interesTotal, totalAPagar, cuotaIndividual });

        // Fechas de pago
        let fechaActual = new Date();
        console.log("Fecha actual:", fechaActual);

        let fechaInicioPago = calcularFechaInicioPago(fechaActual, dias_del_periodo, periodo);
        let fechaUltimoPago = calcularFechaFinalPago(fechaInicioPago, plazo, dias_del_periodo, periodo);

        console.log("Fechas calculadas:", { fechaInicioPago, fechaUltimoPago });

        // Mostrar resultados en el DOM
        document.getElementById('totalpagar').value = totalAPagar.toFixed(2);
        document.getElementById('cuotaindividual').value = cuotaIndividual.toFixed(2);
        document.getElementById('interestotal').value = interesTotal.toFixed(2);
        document.getElementById('fechainicio').value = fechaInicioPago.toLocaleDateString();
        document.getElementById('ultimafecha').value = fechaUltimoPago.toLocaleDateString();

        console.log("Resultados mostrados en el DOM");

        // Guardar en el historial
        guardarEnHistorial({
            monto: monto.toFixed(2),
            periodo,
            plazo,
            totalAPagar: totalAPagar.toFixed(2),
            cuotaIndividual: cuotaIndividual.toFixed(2),
            interesTotal: interesTotal.toFixed(2),
            fechaInicio: fechaInicioPago.toLocaleDateString(),
            fechaUltimoPago: fechaUltimoPago.toLocaleDateString()
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
        switch (periodo) {
            case 'Diario': return 1;
            case 'Semanal': return 7;
            case 'Quincenal': return 15;
            case 'Mensual': return 30;
            case 'Bimestral': return 60;
            case 'Trimestral': return 90;
            case 'Medio_ano': return 180;
            case 'Anual': return 365;
            default: return 1;
        }
    }

    function calcularFechaInicioPago(fecha, dias_del_periodo, periodo) {
        console.log("Calculando fecha de inicio de pago", { fecha, dias_del_periodo, periodo });
        let nuevaFecha = new Date(fecha);
        switch (periodo) {
            case 'Diario': nuevaFecha.setDate(nuevaFecha.getDate() + 1); break;
            case 'Semanal': nuevaFecha.setDate(nuevaFecha.getDate() + 7); break;
            case 'Quincenal': nuevaFecha.setDate(nuevaFecha.getDate() + 15); break;
            case 'Mensual': nuevaFecha.setMonth(nuevaFecha.getMonth() + 1); break;
            case 'Bimestral': nuevaFecha.setMonth(nuevaFecha.getMonth() + 2); break;
            case 'Trimestral': nuevaFecha.setMonth(nuevaFecha.getMonth() + 3); break;
            case 'Medio_ano': nuevaFecha.setMonth(nuevaFecha.getMonth() + 6); break;
            case 'Anual': nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1); break;
            default: nuevaFecha.setDate(nuevaFecha.getDate() + dias_del_periodo);
        }
        return fechaHabil(nuevaFecha);
    }

    function calcularFechaFinalPago(fechaInicio, plazo, dias_del_periodo, periodo) {
        console.log("Calculando fecha final de pago", { fechaInicio, plazo, dias_del_periodo, periodo });
        let fechaFinal = new Date(fechaInicio);
        for (let i = 0; i < plazo - 1; i++) {
            switch (periodo) {
                case 'Diario': fechaFinal.setDate(fechaFinal.getDate() + 1); break;
                case 'Semanal': fechaFinal.setDate(fechaFinal.getDate() + 7); break;
                case 'Quincenal': fechaFinal.setDate(fechaFinal.getDate() + 15); break;
                case 'Mensual': fechaFinal.setMonth(fechaFinal.getMonth() + 1); break;
                case 'Bimestral': fechaFinal.setMonth(fechaFinal.getMonth() + 2); break;
                case 'Trimestral': fechaFinal.setMonth(fechaFinal.getMonth() + 3); break;
                case 'Medio_ano': fechaFinal.setMonth(fechaFinal.getMonth() + 6); break;
                case 'Anual': fechaFinal.setFullYear(fechaFinal.getFullYear() + 1); break;
                default: fechaFinal.setDate(fechaFinal.getDate() + dias_del_periodo);
            }
            fechaFinal = fechaHabil(fechaFinal);
        }
        return fechaFinal;
    }

    function fechaHabil(fecha) {
        console.log("Verificando si la fecha es hábil:", fecha);
        while (esDomingoOferiado(fecha)) {
            console.log("Fecha no hábil encontrada:", fecha);
            fecha.setDate(fecha.getDate() + 1);
        }
        return fecha;
    }

    function esDomingoOferiado(fecha) {
        if (fecha.getDay() === 0) return true;
        return feriados.some(feriado => feriado.toLocaleDateString() === fecha.toLocaleDateString());
    }

    function validarDatos(monto, plazo) {
        console.log("Validando datos", { monto, plazo });
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

    function guardarEnHistorial(simulacion) {
        console.log("Guardando en historial:", simulacion);
        let historial = JSON.parse(localStorage.getItem('historial')) || [];
        historial.push(simulacion);
        localStorage.setItem('historial', JSON.stringify(historial));
        cargarHistorial();
    }

    function cargarHistorial() {
        console.log("Cargando historial...");
        let historial = JSON.parse(localStorage.getItem('historial')) || [];
        console.log("Historial cargado:", historial);

        let tabla = document.getElementById('resultadosTabla');
        tabla.innerHTML = '';

        if (historial.length === 0) {
            let filaVacia = document.createElement('tr');
            filaVacia.innerHTML = '<td colspan="8">No hay simulaciones previas.</td>';
            tabla.appendChild(filaVacia);
            return;
        }

        historial.forEach(simulacion => {
            let fila = document.createElement('tr');
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
