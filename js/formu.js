import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Verificar si la aplicación de Firebase ya está inicializada
if (!getApps().length) {
  const firebaseConfig = {
    apiKey: "AIzaSyCOX4l0eA8l-NNtX6j0XN96PBnZepzWBh0",
    authDomain: "getfunds-d99f9.firebaseapp.com",
    projectId: "getfunds-d99f9",
    storageBucket: "getfunds-d99f9.appspot.com",
    messagingSenderId: "915683707396",
    appId: "1:915683707396:web:4b8c39399776e2a62a8351"
  };

  initializeApp(firebaseConfig);
}

const firestore = getFirestore();
const auth = getAuth();

// Función de validación de formularios
function validarFormulario(formulario) {
  let valido = true;
  const inputs = formulario.querySelectorAll('input, select, textarea');
  inputs.forEach(function(input) {
    if (input.value.trim() === '' && !input.readOnly) {
      valido = false;
    }
  });
  return valido;
}

// Función para manejar el envío del formulario
async function handleSubmit(event) {
  event.preventDefault();

  const formulario = event.target;
  const correo = document.getElementById("email").value;

  if (!validarFormulario(formulario)) {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  const categoria = document.getElementById("categoria").value;
  const fecha = new Date(document.getElementById("fecha").value);
  const tipo = document.getElementById("tipo").value;
  const valor = parseFloat(document.getElementById("valor").value);

  try {
    if (correo) {
      await addDoc(collection(firestore, "Registros"), {
        Categoria: categoria,
        Correo: correo,
        Fecha: Timestamp.fromDate(fecha),
        Tipo: tipo,
        Valor: valor
      });
      alert("Registro añadido exitosamente");
      formulario.reset();
      location.reload(); // Recargar la página después de enviar el formulario
    } else {
      alert("No se pudo obtener el correo del usuario. Por favor, inicia sesión nuevamente.");
    }
  } catch (error) {
    console.error("Error al añadir registro: ", error);
    alert("Ocurrió un error al añadir el registro. Por favor, inténtalo de nuevo.");
  }
}

// Obtener el correo del usuario autenticado y rellenar el formulario
auth.onAuthStateChanged((user) => {
  if (user) {
    const email = user.email;
    document.getElementById("email").value = email;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("formulario").addEventListener("submit", handleSubmit);

  var closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      location.reload(true);
    });
  });
});
