import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

document.getElementById("Subir").addEventListener("click", async function (event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;
  const confirmarContrasena = document.getElementById("confirmarContrasena").value;

  // Validación de contraseña
  if (contrasena !== confirmarContrasena) {
    alert("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.");
    return;
  }

  // Validación de correo electrónico duplicado
  const emailQuerySnapshot = await getDocs(query(collection(firestore, "usuarios"), where("correo", "==", correo)));
  if (!emailQuerySnapshot.empty) {
    alert("Este correo electrónico ya está registrado. Por favor, utiliza otro correo electrónico.");
    return;
  }

  // Validación de nombre duplicado
  const nombreQuerySnapshot = await getDocs(query(collection(firestore, "usuarios"), where("nombre", "==", nombre)));
  if (!nombreQuerySnapshot.empty) {
    alert("Este nombre ya está en uso. Por favor, elige otro nombre.");
    return;
  }

  // Registro de usuario si las validaciones son exitosas
  try {
    await addDoc(collection(firestore, "usuarios"), {
      nombre: nombre,
      correo: correo,
      contraseña: contrasena
    });
    alert("Registro exitoso. ¡Bienvenido!");
  } catch (error) {
    console.error("Error al agregar datos", error);
    alert("Ocurrió un error durante el registro. Por favor, inténtalo de nuevo más tarde.");
  }
});
