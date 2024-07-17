// Importaciones de Firebase
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, query, collection, getDocs, updateDoc, doc, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

import { firestore } from '../firebase_config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const configuracionLink = document.getElementById('configuracion-link');
    const dropdownContent = document.getElementById('dropdown-content');
    const modalPerfil = document.getElementById('modalPerfil');
    const closeModalButtons = document.querySelectorAll('.close');
    const perfilForm = document.getElementById('perfilForm');
    const deleteCurrentImage = document.getElementById('deleteCurrentImage');

    configuracionLink.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownContent.classList.toggle('show');
    });

    window.addEventListener('click', (e) => {
        if (!e.target.matches('#configuracion-link') && !e.target.matches('#dropdown-content') && !e.target.closest('#dropdown-content')) {
            dropdownContent.classList.remove('show');
        }
    });

    document.querySelector('.dropdown-content a[href="#perfil"]').addEventListener('click', (e) => {
        e.preventDefault();
        modalPerfil.style.display = 'block';
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
    });

    const auth = getAuth();

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
                        document.getElementById('profileImage').src = userProfile.Avatar;
                    }
                }
            } catch (error) {
                console.error('Error al obtener el perfil del usuario:', error);
            }
        } else {
            console.error('No se pudo capturar el correo electrónico del usuario.');
        }
    });

    perfilForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('correoPerfil').value;
        const fileInput = document.getElementById('fileUpload');
        const file = fileInput ? fileInput.files[0] : null;
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
                document.getElementById('profileImage').src = imageURL;
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
                updateData.Avatar = imageURL;
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
                const storage = getStorage();
                const imageRef = ref(storage, userData.Avatar);
                await deleteObject(imageRef);
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

// FUNCIONAMIENTO DEL CAROUSEL 
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
        profileImage.src = src; // Actualiza la imagen del modal
        const email = document.getElementById('correoPerfil').value;
        
        // Guarda el nuevo avatar en Firestore
        updateUsuario(email, document.getElementById('nombre').value, src);
        
        // Actualiza la imagen en la página
        document.getElementById('profileImage').src = src;
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

    showImage(currentIndex);
});
