import { firestore } from '../firebase_config.js';
import { collection, query, where, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

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
        // Referencia a la colección "Registros"
        const registrosRef = collection(firestore, "Registros");

        // Query para filtrar por correo
        const registrosQuery = query(registrosRef, where("Correo", "==", correo));

        // Obtener los documentos
        const registrosSnapshot = await getDocs(registrosQuery);

        // Contenedor del acordeón
        const accordion = document.querySelector('.accordion');
        accordion.innerHTML = ''; // Limpiar contenido existente

        // Función para crear un elemento de registro
        function crearRegistro(id, Tipo, Categoria, Fecha, Valor) {
            if (Tipo === 'egreso') {
                return `
                    <li data-id="${id}">
                        <input type="radio" name="accordion" id="${id}">
                        <label for="${id}">
                            <div class="registro">
                                <h1>${new Date(Fecha.seconds * 1000).getDate()}</h1>
                                <div class="derecho">
                                    <div class="texto-arriba">${new Date(Fecha.seconds * 1000).toLocaleDateString('es-ES', { weekday: 'long' })}</div>
                                    <div class="texto-abajo">${new Date(Fecha.seconds * 1000).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</div>
                                </div>
                                <div class="izquierdo">
                                    <div class="texto-arribaM-margin">$${Valor.toFixed(2)}</div>
                                    <div class="eliminar" data-id="${id}" style="cursor: pointer;"><i class="fas fa-times-circle"></i></div>
                                </div>
                            </div>
                        </label>
                        <div class="content">
                            <div class="info-registro">
                                <div class="iconos">
                                    <i class="fas fa-coins" style="color: red;"></i>
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
            } else {
                return `
                    <li data-id="${id}">
                        <input type="radio" name="accordion" id="${id}">
                        <label for="${id}">
                            <div class="registro">
                                <h1>${new Date(Fecha.seconds * 1000).getDate()}</h1>
                                <div class="derecho">
                                    <div class="texto-arriba">${new Date(Fecha.seconds * 1000).toLocaleDateString('es-ES', { weekday: 'long' })}</div>
                                    <div class="texto-abajo">${new Date(Fecha.seconds * 1000).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</div>
                                </div>
                                <div class="izquierdo">
                                    <div class="texto-arribaM-margin">$${Valor.toFixed(2)}</div>
                                    <div class="eliminar" data-id="${id}" style="cursor: pointer;"><i class="fas fa-times-circle"></i></div>
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
        }

        // Añadir registros
        registrosSnapshot.forEach((doc) => {
            const registro = doc.data();
            accordion.innerHTML += crearRegistro(doc.id, registro.Tipo, registro.Categoria, registro.Fecha, registro.Valor);
        });

        // Escuchar eventos de clic en los íconos de eliminar
        accordion.addEventListener('click', async (e) => {
            if (e.target.classList.contains('fa-times-circle')) {
                const registroId = e.target.closest('div.eliminar').getAttribute('data-id');
                try {
                    await eliminarRegistro(registroId); // Función para eliminar el registro en la base de datos
                    e.target.closest('li').remove(); // Eliminar visualmente el registro del DOM
                    console.log('Registro eliminado correctamente');
                } catch (error) {
                    console.error('Error al eliminar el registro:', error);
                }
            }
        });

    } catch (error) {
        console.error("Error al obtener registros: ", error);
    }
}

// Función para eliminar el registro de la base de datos
async function eliminarRegistro(id) {
    try {
        await deleteDoc(doc(firestore, 'Registros', id));
        console.log('Registro eliminado de la base de datos');
    } catch (error) {
        console.error('Error al eliminar el registro de la base de datos:', error);
        throw error;
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
