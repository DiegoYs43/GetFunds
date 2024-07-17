// Importaciones de Firebase
import { auth, firestore } from './firebase_config.js';
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
        if (event.target === modalPerfil) modalPerfil.style.display = 'none';
    });

    configurarModalPerfil(modalPerfil);
};

// Configuración del modal de perfil
const configurarModalPerfil = (modalPerfil) => {
    const perfilForm = document.getElementById('perfilForm');

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

        try {
            await updateUsuario(email, nombre);
            alert('Perfil actualizado correctamente');
            document.querySelector('.text-container p').textContent = nombre;
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            alert('Error al actualizar el perfil');
        }

        modalPerfil.style.display = 'none';
    });
};

// Función para actualizar el perfil del usuario
const updateUsuario = async (email, nombre) => {
    const userQuery = query(collection(firestore, 'usuarios'), where('Correo', '==', email));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const updateData = { Nombre: nombre };
        await updateDoc(doc(firestore, 'usuarios', userDoc.id), updateData);
    } else {
        throw new Error('Usuario no encontrado');
    }
};

// Manejador de errores global
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Error:', message, 'en', source, 'linea', lineno);
    return true;
};
//grafica integrda 
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myPieChart').getContext('2d');
    const myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Factura', 'Servicios', 'Recibos del Hogar', 'Microgasto'],
            datasets: [{
                data: [10, 20, 30, 40],  // Replace with your data
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw + '%';
                        }
                    }
                }
            }
        }
    });
});