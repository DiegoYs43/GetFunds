// Importaciones de Firebase
import { firestore, auth } from './firebase_config.js';
import { collection, addDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

// Función para manejar el cambio en el tipo (Ingreso / Egreso)
function handleTipoChange() {
    const tipo = document.getElementById('tipo').value;
    const categoriaSelect = document.getElementById('categoria');

    // Limpiar opciones existentes
    categoriaSelect.innerHTML = '';

    // Definir opciones según el tipo seleccionado
    if (tipo === 'egreso') {
        const opcionesEgreso = [
            { value: 'factura', label: 'Factura' },
            { value: 'recibo', label: 'Recibo' },
            { value: 'gastoDiario', label: 'Gasto Diario' },
            { value: 'microgasto', label: 'Microgasto' },
            { value: 'deuda', label: 'Deuda' }
        ];

        opcionesEgreso.forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion.value;
            option.textContent = opcion.label;
            categoriaSelect.appendChild(option);
        });

        // Cambiar color del botón a rojo (estilo para egreso)
        document.querySelector('.btn-primary').classList.remove('btn-success');
        document.querySelector('.btn-primary').classList.add('btn-danger');
    } else if (tipo === 'ingreso') {
        const opcionesIngreso = [
            { value: 'salario', label: 'Salario' },
            { value: 'cobroDeuda', label: 'Cobro de Deuda' },
            { value: 'horasExtra', label: 'Horas Extra' }
        ];

        opcionesIngreso.forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion.value;
            option.textContent = opcion.label;
            categoriaSelect.appendChild(option);
        });

        // Cambiar color del botón a verde (estilo para ingreso)
        document.querySelector('.btn-primary').classList.remove('btn-danger');
        document.querySelector('.btn-primary').classList.add('btn-success');
    }
}

// Función de validación de formularios
function validarFormulario(formulario) {
    let valido = true;
    const inputs = formulario.querySelectorAll('input, select, textarea');
    inputs.forEach(function (input) {
        if (input.value.trim() === '' && !input.readOnly) {
            valido = false;
        }
    });
    return valido;
}

// Función para manejar el envío del formulario
async function handleSubmit(event) {
    event.preventDefault();

    const formulario = event.target;
    const correo = document.getElementById("email").value;

    if (!validarFormulario(formulario)) {
        alert("Por favor, complete todos los campos obligatorios.");
        return;
    }

    const categoria = document.getElementById("categoria").value;
    const fecha = new Date(document.getElementById("fecha").value);
    const tipo = document.getElementById("tipo").value;
    const valor = parseFloat(document.getElementById("valor").value);

    try {
        if (correo) {
            await addDoc(collection(firestore, "Registros"), {
                Categoria: categoria,
                Correo: correo,
                Fecha: Timestamp.fromDate(fecha),
                Tipo: tipo,
                Valor: valor
            });
            alert("Registro añadido exitosamente");
            formulario.reset();
            location.reload(); // Recargar la página después de enviar el formulario
        } else {
            alert("No se pudo obtener el correo del usuario. Por favor, inicia sesión nuevamente.");
        }
    } catch (error) {
        console.error("Error al añadir registro: ", error);
        alert("Ocurrió un error al añadir el registro. Por favor, inténtalo de nuevo.");
    }
}

// Obtener el correo del usuario autenticado y rellenar el formulario
auth.onAuthStateChanged((user) => {
    if (user) {
        const email = user.email;
        document.getElementById("email").value = email;
    }
});

// Manejar el evento 'DOMContentLoaded' para inicializar el formulario
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar opciones de categoría según el tipo seleccionado
    document.getElementById('tipo').addEventListener('change', handleTipoChange);
    handleTipoChange(); // Llamar a la función al inicio para establecer las opciones por defecto

    // Escuchar el evento de submit del formulario
    document.getElementById("formulario").addEventListener("submit", handleSubmit);

    // Manejar el evento 'click' en los botones de cerrar para recargar la página
    var closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            location.reload(true);
        });
    });
});
