import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
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

// Función para manejar el envío del formulario de ingresos
async function handleIngresoSubmit(event) {
  event.preventDefault();

  const formularioIngreso = event.target;
  const correo = document.getElementById("emailIngreso").value;

  if (!validarFormulario(formularioIngreso)) {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  const tipoIngreso = document.getElementById("tipoIngreso").value;
  const fecha = document.getElementById("fechaIngreso").value;
  const monto = parseFloat(document.getElementById("montoIngreso").value);

  try {
    if (correo) {
      await addDoc(collection(firestore, "ingresos"), {
        tipo: tipoIngreso,
        fecha: fecha,
        monto: monto,
        correo: correo
      });
      alert("Ingreso registrado exitosamente");
      formularioIngreso.reset();
      location.reload(); // Recargar la página después de enviar el formulario
    } else {
      alert("No se pudo obtener el correo del usuario. Por favor, inicia sesión nuevamente.");
    }
  } catch (error) {
    console.error("Error al registrar ingreso: ", error);
    alert("Ocurrió un error al registrar el ingreso. Por favor, inténtalo de nuevo.");
  }
}

// Función para manejar el envío del formulario de egresos
async function handleEgresoSubmit(event) {
  event.preventDefault();

  const formularioEgreso = event.target;
  const correo = document.getElementById("emailEgreso").value;

  if (!validarFormulario(formularioEgreso)) {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  const categoriaEgreso = document.getElementById("categoriaEgreso").value;
  const fecha = document.getElementById("fechaEgreso").value;
  const monto = parseFloat(document.getElementById("montoEgreso").value);

  try {
    if (correo) {
      await addDoc(collection(firestore, "gastos"), {
        categoria: categoriaEgreso,
        fecha: fecha,
        monto: monto,
        correo: correo
      });
      alert("Egreso registrado exitosamente");
      formularioEgreso.reset();
      location.reload(); // Recargar la página después de enviar el formulario
    } else {
      alert("No se pudo obtener el correo del usuario. Por favor, inicia sesión nuevamente.");
    }
  } catch (error) {
    console.error("Error al registrar egreso: ", error);
    alert("Ocurrió un error al registrar el egreso. Por favor, inténtalo de nuevo.");
  }
}

// Obtener el correo del usuario autenticado y rellenar el formulario
auth.onAuthStateChanged((user) => {
  if (user) {
    const email = user.email;

    // Rellenar los campos de correo en los formularios
    document.getElementById("emailIngreso").value = email;
    document.getElementById("emailEgreso").value = email;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("formularioIngreso").addEventListener("submit", handleIngresoSubmit);
  document.getElementById("formularioEgreso").addEventListener("submit", handleEgresoSubmit);

  var closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(function(button) {
      button.addEventListener('click', function() {
          location.reload(true);
      });
  });
});
