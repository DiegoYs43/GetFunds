import { firestore } from './firebase_config.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

// Función para obtener el correo electrónico del usuario autenticado
function getAuthenticatedUserEmail(callback) {
    const email = localStorage.getItem('userEmail');
    if (email) {
        callback(email);
    } else {
        console.log("No hay usuario autenticado");
        callback(null);
    }
}

// Función para calcular y mostrar los totales de ingresos y egresos
async function calcularTotales(correo) {
    try {
        // Referencia a la colección "Registros"
        const registrosRef = collection(firestore, "Registros");

        // Query para filtrar por correo
        const registrosQuery = query(registrosRef, where("Correo", "==", correo));

        // Obtener los documentos
        const registrosSnapshot = await getDocs(registrosQuery);

        let totalIngresos = 0;
        let totalEgresos = 0;

        // Calcular totales
        registrosSnapshot.forEach((doc) => {
            const registro = doc.data();

            if (registro.Tipo === 'ingreso') {
                totalIngresos += registro.Valor;
            } else if (registro.Tipo === 'egreso') {
                totalEgresos += registro.Valor;
            }
        });

        // Actualizar valores en el HTML
        document.getElementById('totalIngresos').textContent = `$${totalIngresos.toFixed(2)}`;
        document.getElementById('totalEgresos').textContent = `$${totalEgresos.toFixed(2)}`;
        document.getElementById('saldoTotal').textContent = `$${(totalIngresos - totalEgresos).toFixed(2)}`;
        document.getElementById('balance').textContent = `$${(totalIngresos - totalEgresos).toFixed(2)}`;

    } catch (error) {
        console.error("Error al calcular totales: ", error);
    }
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    getAuthenticatedUserEmail((correo) => {
        if (correo) {
            calcularTotales(correo);
        } else {
            console.error("No hay usuario autenticado");
        }
    });
});
