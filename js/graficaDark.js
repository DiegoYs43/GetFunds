// Importaciones de Firebase
import { auth, firestore } from './firebase_config.js';
import { query, collection, getDocs, updateDoc, where, doc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js';

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

// Función para obtener datos de la colección "registros"
const obtenerRegistros = async (email) => {
    const registrosQuery = query(collection(firestore, 'registros'), where('Correo', '==', email));
    const registrosSnapshot = await getDocs(registrosQuery);
    if (!registrosSnapshot.empty) {
        return registrosSnapshot.docs.map(doc => doc.data());
    }
    return [];
};

// Función para inicializar las gráficas
const inicializarGraficas = (registros) => {
    const ctxPie = document.getElementById('myPieChart').getContext('2d');
    const ctxGastos = document.getElementById('myGastosChart').getContext('2d');
    const ctxIngresos = document.getElementById('myIngresosChart').getContext('2d');

    // Procesar los datos para las gráficas
    console.log('Registros obtenidos:', registros);

    const categorias = ['Factura', 'Servicios', 'Recibos del Hogar', 'Microgasto'];
    const dataPie = categorias.map(categoria => registros.filter(r => r.Categoria === categoria && r.Tipo === 'Gasto').reduce((acc, curr) => acc + curr.Valor, 0));
    const dataGastos = ['Enero', 'Febrero', 'Marzo', 'Abril'].map((mes, index) => registros.filter(r => new Date(r.Fecha).getMonth() === index && r.Tipo === 'Gasto').reduce((acc, curr) => acc + curr.Valor, 0));
    const dataIngresos = ['Enero', 'Febrero', 'Marzo', 'Abril'].map((mes, index) => registros.filter(r => new Date(r.Fecha).getMonth() === index && r.Tipo === 'Ingreso').reduce((acc, curr) => acc + curr.Valor, 0));

    console.log('Datos para Pie Chart:', dataPie);
    console.log('Datos para Gastos Chart:', dataGastos);
    console.log('Datos para Ingresos Chart:', dataIngresos);

    // Pie Chart
    new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: categorias,
            datasets: [{
                data: dataPie,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
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

    // Gráfica de Gastos
    new Chart(ctxGastos, {
        type: 'bar',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril'],
            datasets: [{
                label: 'Gastos',
                data: dataGastos,
                backgroundColor: 'red',
                borderColor: 'red',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { position: 'top' }
            }
        }
    });

    // Gráfica de Ingresos
    new Chart(ctxIngresos, {
        type: 'bar',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril'],
            datasets: [{
                label: 'Ingresos',
                data: dataIngresos,
                backgroundColor: '#4CAF50',
                borderColor: '#4CAF50',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
};

// Inicializar funciones al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const email = user.email;
            await mostrarImagenPerfil(email);
            await mostrarNombreUsuario(email);

            const registros = await obtenerRegistros(email);
            inicializarGraficas(registros);
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
};

// Pie Chart
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funciones de gráficos si los elementos HTML están presentes
    if (document.getElementById('myPieChart') && document.getElementById('myGastosChart') && document.getElementById('myIngresosChart')) {
        const ctxPie = document.getElementById('myPieChart').getContext('2d');
        const ctxGastos = document.getElementById('myGastosChart').getContext('2d');
        const ctxIngresos = document.getElementById('myIngresosChart').getContext('2d');
    }
});
