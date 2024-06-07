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

// Manejo del evento de envío del formulario para agregar una nueva meta
document.getElementById('formAgregarMeta').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario

    // Obtener los valores del formulario
    const nombreMeta = document.getElementById('nombreMeta').value;
    const montoMeta = parseFloat(document.getElementById('montoMeta').value);

    // Llamar a la función crearRegistroMeta con estos valores y agregar el resultado al contenedor de registros
    const contenedorRegistros = document.querySelector('.right-container');
    contenedorRegistros.innerHTML += crearRegistroMeta(nombreMeta, montoMeta);

    // Cerrar el modal después de agregar la meta
    const modal = document.getElementById('modalAgregarMeta');
    modal.style.display = 'none';

    
});

 document.addEventListener('DOMContentLoaded', (event) => {
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
