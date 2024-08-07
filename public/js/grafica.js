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

            // Configurar gráficas después de obtener el usuario
            await configurarGraficas(email);
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

// Configuración de las gráficas
const configurarGraficas = async (email) => {
    try {
        // Contar documentos en 'Registros' por tipo y sumar valores para el usuario específico
        const registrosQuery = query(collection(firestore, 'Registros'), where('Correo', '==', email));
        const registrosSnapshot = await getDocs(registrosQuery);

        // Contadores para Ingreso y Gasto
        let ingreso = 0;
        let gasto = 0;

        // Sumas de valores de Ingreso y Gasto
        let valorIngreso = 0;
        let valorGasto = 0;

        registrosSnapshot.forEach((doc) => {
            const data = doc.data();
            const tipo = data.Tipo.toLowerCase(); // Asegurar que sea minúscula
            const valor = parseFloat(data.Valor) || 0;

            if (tipo === 'ingreso') {
                ingreso++;
                valorIngreso += valor;
            } else if (tipo === 'egreso') {
                gasto++;
                valorGasto += valor;
            }
        });

        // Imprimir los contadores y sumas por consola para verificar
        console.log('Contadores de ingresos y gastos para el usuario', email);
        console.log('Ingreso:', ingreso);
        console.log('Gasto:', gasto);
        console.log('Suma de valores de Ingreso:', valorIngreso);
        console.log('Suma de valores de Gasto:', valorGasto);

        // Actualizar gráfica de pie con los nuevos datos
        actualizarGraficaPie(ingreso, gasto);
        actualizarGraficaValorPie(valorIngreso, valorGasto);

    } catch (error) {
        console.error('Error al configurar las gráficas:', error);
    }
};

// Función para actualizar la gráfica de pie con nuevos datos
const actualizarGraficaPie = (ingreso, gasto) => {
    // Datos para la gráfica de pie
    const pieData = [ingreso, gasto];
    const labels = ['Ingreso', 'Gasto'];

    // Acceder al contexto del canvas de la gráfica de pie
    const ctxPie = document.getElementById('myPieChart')?.getContext('2d');
    if (ctxPie) {
        new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: pieData,
                    backgroundColor: ['#4CAF50', '#FF6384'],
                    hoverBackgroundColor: ['#4CAF50', '#FF6384']
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
                                return tooltipItem.label + ': ' + tooltipItem.raw + ' registros';
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.error('Elemento canvas para gráfica de pie no encontrado.');
    }
};

// Función para actualizar la nueva gráfica de pie con valores
const actualizarGraficaValorPie = (valorIngreso, valorGasto) => {
    // Datos para la gráfica de pie de valores
    const pieData = [valorIngreso, valorGasto];
    const labels = ['Valor de Ingreso', 'Valor de Gasto'];

    // Acceder al contexto del canvas de la nueva gráfica de pie
    const ctxPie = document.getElementById('myValuePieChart')?.getContext('2d');
    if (ctxPie) {
        new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: pieData,
                    backgroundColor: ['#4CAF50', '#FF6384'],
                    hoverBackgroundColor: ['#4CAF50', '#FF6384']
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
                                return tooltipItem.label + ': $' + tooltipItem.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.error('Elemento canvas para gráfica de pie no encontrado.');
    }
};

// Manejador de errores global
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Error:', message, 'en', source, 'linea', lineno);
    return true;
};
