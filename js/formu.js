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

// Función para obtener el correo electrónico del usuario autenticado
function getAuthenticatedUserEmail(callback) {
  auth.onAuthStateChanged(function(user) {
    if (user) {
      const email = user.email;
      console.log("Correo del usuario autenticado: ", email);
      callback(email);
    } else {
      console.log("No hay usuario autenticado");
      callback(null);
    }
  });
}

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
function handleIngresoSubmit(event) {
  event.preventDefault();
  
  const formularioIngreso = event.target;
  if (!validarFormulario(formularioIngreso)) {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  const tipoIngreso = document.getElementById("tipoIngreso").value;
  const descripcion = document.getElementById("descripcionIngreso").value;
  const fecha = document.getElementById("fechaIngreso").value;
  const monto = parseFloat(document.getElementById("montoIngreso").value);
  
  getAuthenticatedUserEmail(async (correo) => {
    if (correo) {
      try {
        await addDoc(collection(firestore, "ingresos"), {
          tipo: tipoIngreso,
          descripcion: descripcion,
          fecha: fecha,
          monto: monto,
          correo: correo
        });
        alert("Ingreso registrado exitosamente");
        formularioIngreso.reset();
        location.reload(); // Recargar la página después de enviar el formulario
      } catch (error) {
        console.error("Error al registrar ingreso: ", error);
        alert("Ocurrió un error al registrar el ingreso. Por favor, inténtalo de nuevo.");
      }
    } else {
      alert("No se pudo obtener el correo del usuario. Por favor, inicia sesión nuevamente.");
    }
  });
}

// Función para manejar el envío del formulario de egresos
function handleEgresoSubmit(event) {
  event.preventDefault();
  
  const formularioEgreso = event.target;
  if (!validarFormulario(formularioEgreso)) {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  const categoriaEgreso = document.getElementById("categoriaEgreso").value;
  const descripcion = document.getElementById("descripcionEgreso").value;
  const fecha = document.getElementById("fechaEgreso").value;
  const monto = parseFloat(document.getElementById("montoEgreso").value);
  
  getAuthenticatedUserEmail(async (correo) => {
    if (correo) {
      try {
        await addDoc(collection(firestore, "gastos"), {
          categoria: categoriaEgreso,
          descripcion: descripcion,
          fecha: fecha,
          monto: monto,
          correo: correo
        });
        alert("Egreso registrado exitosamente");
        formularioEgreso.reset();
        location.reload(); // Recargar la página después de enviar el formulario
      } catch (error) {
        console.error("Error al registrar egreso: ", error);
        alert("Ocurrió un error al registrar el egreso. Por favor, inténtalo de nuevo.");
      }
    } else {
      alert("No se pudo obtener el correo del usuario. Por favor, inicia sesión nuevamente.");
    }
  });
}

document.getElementById("formularioIngreso").addEventListener("submit", handleIngresoSubmit);
document.getElementById("formularioEgreso").addEventListener("submit", handleEgresoSubmit);

// Espera a que el DOM esté completamente cargado para ejcutar recargar pagina 
document.addEventListener('DOMContentLoaded', function() {
    var closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            location.reload(true);
        });
    });
});
