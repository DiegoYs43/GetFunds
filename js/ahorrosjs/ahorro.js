// Importaciones de Firebase
import { auth, firestore } from '../firebase_config.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js';
import { query, collection, getDocs, updateDoc, where, doc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';


// Función para obtener datos del usuario desde Firestore
const obtenerUsuario = async (email) => {
    const userQuery = query(collection(firestore, 'usuarios'), where('Correo', '==', email));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
        return userSnapshot.docs[0].data();
    }
    throw new Error('Usuario no encontrado');
};

// Función para mostrar la imagen de perfil del usuario
const mostrarImagenPerfil = async (email) => {
    try {
        const userProfile = await obtenerUsuario(email);
        const imageUrl = userProfile.Avatar || '/img/default-profile.png';
        document.querySelector('.imagen-container img').src = imageUrl;
    } catch {
        document.querySelector('.imagen-container img').src = '/img/default-profile.png';
    }
};

// Función para mostrar el nombre del usuario
const mostrarNombreUsuario = async (email) => {
    try {
        const userProfile = await obtenerUsuario(email);
        if (userProfile.Nombre) {
            document.querySelector('.text-container p').textContent = userProfile.Nombre;
        }
    } catch (error) {
        console.error('Error al obtener el nombre de usuario:', error);
    }
};

// Función para actualizar el perfil del usuario
const updateUsuario = async (email, nombre, imageURL) => {
    const userQuery = query(collection(firestore, 'usuarios'), where('Correo', '==', email));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const updateData = { Nombre: nombre, Avatar: imageURL || null };
        await updateDoc(doc(firestore, 'usuarios', userDoc.id), updateData);
    } else {
        throw new Error('Usuario no encontrado');
    }
};

// Función para eliminar la imagen de perfil del usuario
const eliminarImagenPerfil = async (email) => {
    const userQuery = query(collection(firestore, 'usuarios'), where('Correo', '==', email));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        if (userData.Avatar) {
            const storage = getStorage();
            await deleteObject(ref(storage, userData.Avatar));
            await updateDoc(doc(firestore, 'usuarios', userDoc.id), { Avatar: null });
        }
    } else {
        throw new Error('Usuario no encontrado');
    }
};

// Inicializar funciones al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const email = user.email;
            await mostrarImagenPerfil(email);
            await mostrarNombreUsuario(email);
        } else {
            console.error('No se pudo capturar el correo electrónico del usuario.');
        }
    });

    configurarMenuDesplegable();
    configurarModales();
});

// Configuración del menú desplegable
const configurarMenuDesplegable = () => {
    const configuracionLink = document.getElementById('configuracion-link');
    const dropdownContent = document.getElementById('dropdown-content');
    configuracionLink.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownContent.classList.toggle('show');
    });

    window.addEventListener('click', (e) => {
        if (!e.target.closest('#configuracion-link, #dropdown-content')) {
            dropdownContent.classList.remove('show');
        }
    });
};

// Configuración de los modales
const configurarModales = () => {
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
        if (event.target === modalPerfil) modalPerfil.style.display = 'none';
        if (event.target === modalAgregarMeta) modalAgregarMeta.style.display = 'none';
    });

    configurarModalPerfil(modalPerfil);
};

// Configuración del modal de perfil
const configurarModalPerfil = (modalPerfil) => {
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
                    document.getElementById('modalProfileImage').src = userProfile.Avatar || '/img/default-profile.png';
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
                const storageRef = ref(storage, `prueba/${file.name}`);
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
};

//FUNCIONAMIENTO DEL CAROUSEL 

document.addEventListener('DOMContentLoaded', () => {
    const carouselImages = document.querySelectorAll('.carousel-image');
    const profileImage = document.getElementById('modalProfileImage');
    const prevButton = document.getElementById('carouselPrev');
    const nextButton = document.getElementById('carouselNext');
    let currentIndex = 0;

    function showImage(index) {
        carouselImages.forEach((img, i) => {
            img.style.display = i === index ? 'block' : 'none';
        });
    }

    function updateProfileImage(src) {
        profileImage.src = src;
    }

    carouselImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            updateProfileImage(img.src);
        });
    });

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselImages.length - 1;
        showImage(currentIndex);
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex < carouselImages.length - 1) ? currentIndex + 1 : 0;
        showImage(currentIndex);
    });

    // Mostrar la primera imagen inicialmente
    showImage(currentIndex);
});
