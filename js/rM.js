import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, query, collection, getDocs, updateDoc, doc, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import './formu.js'; // Importa el archivo formu.js donde se inicializa Firebase

document.addEventListener('DOMContentLoaded', async () => {
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

    // Modal
    const modalPerfil = document.getElementById('modalPerfil');
    const closeModalButtons = document.querySelectorAll('.close');

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

    // Autocompletar campo de correo con el usuario autenticado
    const auth = getAuth(); // Obtener la instancia de autenticación

    // Obtener el correo del usuario autenticado y rellenar el formulario
    auth.onAuthStateChanged((user) => {
        if (user) {
            const email = user.email;
            document.getElementById('correoPerfil').value = email;
            console.log('Correo electrónico capturado:', email);
        } else {
            console.error('No se pudo capturar el correo electrónico del usuario.');
            throw new Error('No se pudo capturar el correo electrónico del usuario.');
        }
    });

    // Manejar el envío del formulario de perfil
    const perfilForm = document.getElementById('perfilForm');
    perfilForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener el valor del campo de nombre
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('correoPerfil').value;

        // Actualizar el nombre del usuario en Firestore
        try {
            await updateNombreUsuario(email, nombre);
            alert('Nombre actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar el nombre:', error);
            alert('Error al actualizar el nombre');
        }

        // Cerrar el modal de perfil
        modalPerfil.style.display = 'none';
    });
});

async function updateNombreUsuario(email, nombre) {
    try {
        const firestore = getFirestore(); // Obtener la instancia de Firestore
        const userQuery = query(collection(firestore, 'usuarios'), where('correo', '==', email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            await updateDoc(doc(firestore, 'usuarios', userDoc.id), {
                nombre: nombre
            });
        } else {
            throw new Error('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error al actualizar el nombre:', error);
        throw error;
    }
}
