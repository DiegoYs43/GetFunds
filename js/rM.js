// Importaciones de Firebase
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, query, collection, getDocs, updateDoc, doc, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// Importación del archivo firebase_config.js donde se inicializa Firebase
import { firestore, auth } from './firebase_config.js';

// Función para ejecutar código después de que el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
    // Variables para manejar el menú desplegable y el modal
    const configuracionLink = document.getElementById('configuracion-link');
    const dropdownContent = document.getElementById('dropdown-content');
    const modalPerfil = document.getElementById('modalPerfil');
    const closeModalButtons = document.querySelectorAll('.close');
    const perfilForm = document.getElementById('perfilForm');
    const deleteCurrentImage = document.getElementById('deleteCurrentImage');

    // Mostrar o ocultar el menú desplegable al hacer clic en el enlace de configuración
    configuracionLink.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownContent.classList.toggle('show');
    });

    // Cerrar el menú desplegable si se hace clic fuera de él
    window.addEventListener('click', (e) => {
        if (!e.target.matches('#configuracion-link') && !e.target.matches('#dropdown-content') && !e.target.closest('#dropdown-content')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });

    // Abrir el modal de perfil al hacer clic en el enlace correspondiente en el menú desplegable
    document.querySelector('.dropdown-content a[href="#perfil"]').addEventListener('click', (e) => {
        e.preventDefault();
        modalPerfil.style.display = 'block';
    });

    // Cerrar el modal al hacer clic en los botones de cerrar
    closeModalButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const modal = document.getElementById(button.getAttribute('data-modal'));
            modal.style.display = 'none';
        });
    });

    // Cerrar el modal si se hace clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modalPerfil) {
            modalPerfil.style.display = 'none';
        }
    });

    // Autocompletar campo de correo con el usuario autenticado
    const auth = getAuth(); // Obtener la instancia de autenticación

    // Obtener el correo del usuario autenticado y rellenar el formulario de perfil
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const email = user.email;
            document.getElementById('correoPerfil').value = email;
            console.log('Correo electrónico capturado:', email);

            // Obtener el nombre del usuario y la imagen desde Firestore
            try {
                const userProfile = await obtenerUsuario(email);
                if (userProfile) {
                    document.getElementById('nombre').value = userProfile.Nombre;
                    document.querySelector('.text-container p').textContent = userProfile.Nombre;

                    // Mostrar la imagen de perfil si está disponible en el modal
                    if (userProfile.Avatar) {
                        document.getElementById('modalProfileImage').src = userProfile.Avatar;
                    }

                    // Mostrar la imagen de perfil estática si está disponible en la página rM.html
                    if (userProfile.Avatar) {
                        document.getElementById('profileImage').src = userProfile.Avatar;
                    }
                }
            } catch (error) {
                console.error('Error al obtener el perfil del usuario:', error);
            }
        } else {
            console.error('No se pudo capturar el correo electrónico del usuario.');
            throw new Error('No se pudo capturar el correo electrónico del usuario.');
        }
    });

    // Manejar el envío del formulario de perfil
    perfilForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener el valor del campo de nombre y el archivo de imagen
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('correoPerfil').value;
        const fileInput = document.getElementById('fileUpload');
        const file = fileInput.files[0];
        let imageURL = null;

        if (file) {
            const storage = getStorage(); // Obtener la instancia de Firebase Storage

            try {
                // Subir el nuevo archivo
                const storageRef = ref(storage, 'prueba/' + file.name);
                const snapshot = await uploadBytes(storageRef, file);
                imageURL = await getDownloadURL(snapshot.ref);
                console.log('Archivo disponible en:', imageURL);
            } catch (error) {
                console.error('Error al subir el archivo:', error);
                alert('Error al subir el archivo');
                return;
            }
        }

        // Actualizar el nombre del usuario en Firestore y guardar la URL de la imagen
        try {
            await updateUsuario(email, nombre, imageURL);
            alert('Perfil actualizado correctamente');
            document.querySelector('.text-container p').textContent = nombre;

            // Actualizar la imagen de perfil en el modal si se ha cambiado
            if (imageURL) {
                document.getElementById('modalProfileImage').src = imageURL;
            }

            // Actualizar la imagen de perfil estática en rM.html si se ha cambiado
            if (imageURL) {
                document.getElementById('profileImage').src = imageURL;
            }
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            alert('Error al actualizar el perfil');
        }

        // Cerrar el modal de perfil
        modalPerfil.style.display = 'none';
    });

    // Botón para eliminar la imagen actual del perfil
    deleteCurrentImage.addEventListener('click', async () => {
        const email = document.getElementById('correoPerfil').value;
        try {
            await eliminarImagenPerfil(email);
            alert('Imagen de perfil eliminada correctamente');
            document.getElementById('modalProfileImage').src = '/img/default-profile.png'; // Cambiar a la imagen por defecto
            document.getElementById('profileImage').src = '/img/default-profile.png'; // Cambiar la imagen estática por defecto en rM.html
        } catch (error) {
            console.error('Error al eliminar la imagen de perfil:', error);
            alert('Error al eliminar la imagen de perfil');
        }
    });
});

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
        console.error('Error al obtener el perfil del usuario:', error);
        throw error;
    }
}

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
