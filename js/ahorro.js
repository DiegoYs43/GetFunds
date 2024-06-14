// ahorro.js
import { auth, firestore } from './firebase_config.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js';
import { query, collection, getDocs, where } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

// Función para crear un elemento de registro de meta
function crearRegistroMeta(nombreMeta, montoMeta) {
    return `
        <div class="registro">
            <i class="fas fa-wallet" style="color: #4CAF50;"></i>
            <div class="derecho">
                <div class="texto-arriba">${nombreMeta}</div>
                <div class="texto-abajo">$${montoMeta.toFixed(2)}</div>
            </div>
        </div>`;
}

// Función para obtener y mostrar la imagen de perfil del usuario
async function mostrarImagenPerfil(email) {
    try {
        const userProfile = await obtenerUsuario(email);
        if (userProfile && userProfile.Avatar) {
            const imageUrl = userProfile.Avatar;
            document.querySelector('.imagen-container img').src = imageUrl;
        } else {
            document.querySelector('.imagen-container img').src = '/img/default-profile.png';
        }
    } catch (error) {
        console.error('Error al obtener la imagen de perfil:', error);
        document.querySelector('.imagen-container img').src = '/img/default-profile.png'; // Imagen por defecto en caso de error
    }
}

// Función para obtener el nombre del usuario
async function mostrarNombreUsuario(email) {
    try {
        const userProfile = await obtenerUsuario(email);
        if (userProfile && userProfile.Nombre) {
            document.querySelector('.text-container p').textContent = userProfile.Nombre;
        }
    } catch (error) {
        console.error('Error al obtener el nombre de usuario:', error);
    }
}

// Función para obtener el saldo total del usuario y mostrarlo en la página
async function mostrarSaldoTotal(email) {
    try {
        const userProfile = await obtenerUsuario(email);
        if (userProfile && userProfile.SaldoTotal) {
            document.getElementById('saldoTotal').textContent = `$${userProfile.SaldoTotal.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error al obtener el saldo total:', error);
    }
}

// Función para obtener datos del usuario desde Firestore
async function obtenerUsuario(email) {
    try {
        const userQuery = query(collection(firestore, 'usuarios'), where('Correo', '==', email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            return userDoc.data();
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        throw error;
    }
}

// Función para inicializar las funciones al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const email = user.email;
            await mostrarImagenPerfil(email);
            await mostrarNombreUsuario(email);
            await mostrarSaldoTotal(email);
        } else {
            console.error('No se pudo capturar el correo electrónico del usuario.');
            throw new Error('No se pudo capturar el correo electrónico del usuario.');
        }
    });

    // Configuración del menú desplegable y los modales
    const configuracionLink = document.getElementById('configuracion-link');
    const dropdownContent = document.getElementById('dropdown-content');
    configuracionLink.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownContent.classList.toggle('show');
    });

    window.addEventListener('click', (e) => {
        if (!e.target.matches('#configuracion-link') && !e.target.matches('#dropdown-content') && !e.target.closest('#dropdown-content')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });

    const modalPerfil = document.getElementById('modalPerfil');
    const modalAgregarMeta = document.getElementById('modalAgregarMeta');
    const closeModalButtons = document.querySelectorAll('.close');

    document.querySelector('.dropdown-content a[href="#perfil"]').addEventListener('click', (e) => {
        e.preventDefault();
        modalPerfil.style.display = 'block';
    });

    document.querySelector('.btnAdd').addEventListener('click', (e) => {
        e.preventDefault();
        modalAgregarMeta.style.display = 'block';
    });

    closeModalButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const modal = document.getElementById(button.getAttribute('data-modal'));
            modal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalPerfil) {
            modalPerfil.style.display = 'none';
        }
        if (event.target === modalAgregarMeta) {
            modalAgregarMeta.style.display = 'none';
        }
    });
});
