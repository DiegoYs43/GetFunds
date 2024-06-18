// Importaciones de Firebase
import { auth, firestore } from './firebase_config.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js';
import { query, collection, getDocs, updateDoc, where, doc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

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

// Función para mostrar la imagen de perfil del usuario
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

// Función para mostrar el nombre del usuario
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

// Función para actualizar el perfil del usuario
async function updateUsuario(email, nombre, imageURL) {
    try {
        const userQuery = query(collection(firestore, 'usuarios'), where('Correo', '==', email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const updateData = { Nombre: nombre };

            if (imageURL) {
                updateData.Avatar = imageURL; // Cambiado a 'Avatar'
            }

            await updateDoc(doc(firestore, 'usuarios', userDoc.id), updateData);
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        throw error;
    }
}

// Función para eliminar la imagen de perfil del usuario
async function eliminarImagenPerfil(email) {
    try {
        const userQuery = query(collection(firestore, 'usuarios'), where('Correo', '==', email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.Avatar) {
                // Eliminar la imagen del storage
                const storage = getStorage(); // Obtener la instancia de Firebase Storage
                const imageRef = ref(storage, userData.Avatar);
                await deleteObject(imageRef);

                // Eliminar el campo de imagen en Firestore
                await updateDoc(doc(firestore, 'usuarios', userDoc.id), { Avatar: null });
            }
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error al eliminar la imagen de perfil:', error);
        throw error;
    }
}

// Inicializar funciones al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const email = user.email;
            await mostrarImagenPerfil(email);
            await mostrarNombreUsuario(email);
        } else {
            console.error('No se pudo capturar el correo electrónico del usuario.');
            throw new Error('No se pudo capturar el correo electrónico del usuario.');
        }
    });

    // Configuración del menú desplegable y los modales
    configurarMenuDesplegable();
    configurarModales();
});

// Configuración del menú desplegable
function configurarMenuDesplegable() {
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
}

// Configuración de los modales
function configurarModales() {
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

    configurarModalPerfil(modalPerfil);
}

// Configuración del modal de perfil
function configurarModalPerfil(modalPerfil) {
    const perfilForm = document.getElementById('perfilForm');
    const deleteCurrentImage = document.getElementById('deleteCurrentImage');

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const email = user.email;
            document.getElementById('correoPerfil').value = email;

            try {
                const userProfile = await obtenerUsuario(email);
                if (userProfile) {
                    document.getElementById('nombre').value = userProfile.Nombre;
                    document.querySelector('.text-container p').textContent = userProfile.Nombre;

                    if (userProfile.Avatar) {
                        document.getElementById('modalProfileImage').src = userProfile.Avatar;
                    }
                }
            } catch (error) {
                console.error('Error al obtener el perfil del usuario:', error);
            }
        }
    });

    perfilForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('correoPerfil').value;
        const fileInput = document.getElementById('fileUpload');
        const file = fileInput.files[0];
        let imageURL = null;

        if (file) {
            const storage = getStorage();

            try {
                const storageRef = ref(storage, 'prueba/' + file.name);
                const snapshot = await uploadBytes(storageRef, file);
                imageURL = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error('Error al subir el archivo:', error);
                alert('Error al subir el archivo');
                return;
            }
        }

        try {
            await updateUsuario(email, nombre, imageURL);
            alert('Perfil actualizado correctamente');
            document.querySelector('.text-container p').textContent = nombre;

            if (imageURL) {
                document.getElementById('modalProfileImage').src = imageURL;
            }
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            alert('Error al actualizar el perfil');
        }

        modalPerfil.style.display = 'none';
    });

    deleteCurrentImage.addEventListener('click', async () => {
        const email = document.getElementById('correoPerfil').value;
        try {
            await eliminarImagenPerfil(email);
            alert('Imagen de perfil eliminada correctamente');
            document.getElementById('modalProfileImage').src = '/img/default-profile.png';
            document.getElementById('profileImage').src = '/img/default-profile.png';
        } catch (error) {
            console.error('Error al eliminar la imagen de perfil:', error);
            alert('Error al eliminar la imagen de perfil');
        }
    });
}
