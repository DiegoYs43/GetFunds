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

        // Referencias a las colecciones "ingresos" y "gastos"
        const ingresosRef = collection(firestore, "ingresos");
        const gastosRef = collection(firestore, "gastos");

        // Queries para filtrar por correo
        const ingresosQuery = query(ingresosRef, where("correo", "==", correo));
        const gastosQuery = query(gastosRef, where("correo", "==", correo));

        // Obtener los documentos
        const ingresosSnapshot = await getDocs(ingresosQuery);
        const gastosSnapshot = await getDocs(gastosQuery);

        // Contenedor del acordeón
        const accordion = document.querySelector('.accordion');
        accordion.innerHTML = ''; // Limpiar contenido existente

        // Función para crear un elemento de registro
        function crearRegistro(id, tipo, descripcion, fecha, monto) {
            return `
                <li>
                    <input type="radio" name="accordion" id="${id}">
                    <label for="${id}">
                        <div class="registro">
                            <h1>${new Date(fecha).getDate()}</h1>
                            <div class="derecho">
                                <div class="texto-arriba">${new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long' })}</div>
                                <div class="texto-abajo">${new Date(fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</div>
                            </div>
                            <div class="izquierdo">
                                <div class="texto-arribaM">$${monto.toFixed(2)}</div>
                            </div>
                        </div>
                    </label>
                    <div class="content">
                        <div class="info-registro">
                            <div class="iconos">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="derecho">
                                <div class="texto-arriba">${tipo}</div>
                                <div class="texto-abajo">${descripcion}</div>
                            </div>
                            <div class="izquierdo">
                                <div class="texto-arribaM">$${monto.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </li>`;
        }

        // Añadir registros de ingresos
        ingresosSnapshot.forEach((doc) => {
            const ingreso = doc.data();
            accordion.innerHTML += crearRegistro(doc.id, ingreso.tipo, ingreso.descripcion, ingreso.fecha, ingreso.monto);
        });

        // Añadir registros de gastos
        gastosSnapshot.forEach((doc) => {
            const gasto = doc.data();
            accordion.innerHTML += crearRegistro(doc.id, gasto.categoria, gasto.descripcion, gasto.fecha, gasto.monto);
        });

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
