import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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
// Función para mostrar los registros filtrados por correo
async function mostrarRegistrosPorCorreo(correo) {
    try {
        const firestore = getFirestore(); // Inicialización de Firestore

        // Referencia a la colección "Registros"
        const registrosRef = collection(firestore, "Registros");

        // Query para filtrar por correo
        const registrosQuery = query(registrosRef, where("Correo", "==", correo));

        // Obtener los documentos
        const registrosSnapshot = await getDocs(registrosQuery);

        // Contenedor del acordeón
        const accordion = document.querySelector('.accordion');
        accordion.innerHTML = ''; // Limpiar contenido existente

        let totalIngresos = 0;
        let totalEgresos = 0;

        // Función para crear un elemento de registro
        function crearRegistro(id, Tipo, Categoria, Fecha, Valor) {
            return `
                <li>
                    <input type="radio" name="accordion" id="${id}">
                    <label for="${id}">
                        <div class="registro">
                            <h1>${new Date(Fecha.seconds * 1000).getDate()}</h1>
                            <div class="derecho">
                                <div class="texto-arriba">${new Date(Fecha.seconds * 1000).toLocaleDateString('es-ES', { weekday: 'long' })}</div>
                                <div class="texto-abajo">${new Date(Fecha.seconds * 1000).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</div>
                            </div>
                            <div class="izquierdo">
                                <div class="texto-arribaM">$${Valor.toFixed(2)}</div>
                            </div>
                        </div>
                    </label>
                    <div class="content">
                        <div class="info-registro">
                            <div class="iconos">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="derecho">
                                <div class="texto-arriba">${Tipo}</div>
                                <div class="texto-abajo">${Categoria}</div>
                            </div>
                            <div class="izquierdo">
                                <div class="texto-arribaM">$${Valor.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </li>`;
        }

        // Añadir registros
        registrosSnapshot.forEach((doc) => {
            const registro = doc.data();
            accordion.innerHTML += crearRegistro(doc.id, registro.Tipo, registro.Categoria, registro.Fecha, registro.Valor);

            // Calcular totales
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
        console.error("Error al obtener registros: ", error);
    }
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    getAuthenticatedUserEmail((correo) => {
        if (correo) {
            mostrarRegistrosPorCorreo(correo);
        } else {
            console.error("No hay usuario autenticado");
        }
    });
});