// Importaciones de Firebase
import { auth, firestore } from '../firebase_config.js';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

// Función para eliminar una meta de Firestore
const eliminarMeta = async (metaId) => {
    try {
        await deleteDoc(doc(firestore, 'Ahorro', metaId));
        console.log('Meta eliminada de la base de datos');
    } catch (error) {
        console.error('Error al eliminar la meta de la base de datos:', error);
        throw error;
    }
};

// Función para obtener las metas del usuario desde Firestore
export async function obtenerMetasUsuario() {
    const user = auth.currentUser;
    if (!user) {
        console.error('Usuario no autenticado');
        return;
    }

    const correo = user.email;
    const metasContainer = document.querySelector('.metas-container');

    try {
        // Consultar las metas filtrando por correo del usuario
        const metasQuery = query(collection(firestore, 'Ahorro'), where('Correo', '==', correo));
        const metasSnapshot = await getDocs(metasQuery);

        // Limpiar el contenedor antes de agregar nuevas metas
        metasContainer.innerHTML = '';

        // Iterar sobre los documentos y renderizar las metas en el contenedor
        metasSnapshot.forEach((doc) => {
            const meta = doc.data();
            metasContainer.innerHTML += `
                <div class="ahorro" id="${doc.id}">
                    <i class="fas fa-wallet " style="color: #4CAF50;"></i>
                    <div class="derecho">
                        <div class="texto-arriba">${meta.Nombre}</div>
                        <div class="texto-abajo">$${meta.Monto_Mensual.toFixed(2)}</div>
                        <div class="texto-duracion">Duración: ${meta.Duracion_Meses} meses</div> <!-- Nuevo -->
                        <div class="eliminar-meta" style="cursor: pointer;"><i class="fas fa-times-circle" style=" font-size: 20px; color:#38713a"></i></div>
                    </div>
                </div>
            `;
        });

        // Agregar evento de clic para los íconos de eliminar metas
        const iconosEliminar = document.querySelectorAll('.eliminar-meta');
        iconosEliminar.forEach((icono) => {
            icono.addEventListener('click', async () => {
                const metaId = icono.closest('.ahorro').id;
                try {
                    await eliminarMeta(metaId); // Función para eliminar la meta en la base de datos
                    icono.closest('.ahorro').remove(); // Eliminar visualmente el elemento de la interfaz
                    console.log('Meta eliminada correctamente');
                } catch (error) {
                    console.error('Error al eliminar la meta:', error);
                }
            });
        });

    } catch (error) {
        console.error('Error al obtener las metas del usuario:', error);
    }
}

// Función para completar el campo de correo automáticamente
const completarCorreoUsuario = () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('correoMeta').value = user.email;
        } else {
            console.error('No se pudo capturar el correo electrónico del usuario.');
        }
    });
};

// Inicializar funciones al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    completarCorreoUsuario(); // Llamar a la función para completar el campo de correo automáticamente

    // Verificar si el usuario está autenticado antes de llamar a obtenerMetasUsuario
    auth.onAuthStateChanged((user) => {
        if (user) {
            obtenerMetasUsuario(); // Llamar a la función para obtener las metas del usuario
        } else {
            console.error('Usuario no autenticado.');
            // Aquí podrías mostrar un mensaje al usuario o redirigirlo a la página de inicio de sesión
            // Por ejemplo:
            // alert('Debe iniciar sesión para ver sus metas');
            // window.location.href = 'inicio-sesion.html';
        }
    });

    // Escuchar el evento submit del formulario para agregar una nueva meta
    const formAgregarMeta = document.getElementById('formAgregarMeta');
    formAgregarMeta.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombreMeta = document.getElementById('nombreMeta').value;
        const montoMeta = parseFloat(document.getElementById('montoMeta').value);
        const duracionMeta = parseInt(document.getElementById('duracionMeta').value, 10);
        const correoMeta = document.getElementById('correoMeta').value;

        try {
            // Agregar la nueva meta a Firestore
            await addDoc(collection(firestore, 'Ahorro'), {
                Nombre: nombreMeta,
                Monto_Mensual: montoMeta,
                Duracion_Meses: duracionMeta,
                Correo: correoMeta
            });

            // Actualizar la lista de metas mostradas
            await obtenerMetasUsuario();

            // Mostrar mensaje de éxito y resetear el formulario
            alert('Meta guardada exitosamente');
            formAgregarMeta.reset();
        } catch (error) {
            console.error('Error al guardar la meta:', error);
            alert('Error al guardar la meta');
        }
    });

});
