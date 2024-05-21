import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

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

document.getElementById("registroForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value;
  const confirmarContrasena = document.getElementById("confirmarContrasena").value;

  // Validación de campos vacíos
  if (!nombre || !correo || !contrasena || !confirmarContrasena) {
    alert("Por favor, completa todos los campos del formulario.");
    return;
  }

  // Validación de contraseña
  if (contrasena !== confirmarContrasena) {
    alert("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.");
    return;
  }

  // Validación de correo electrónico duplicado en Firestore
  const emailQuerySnapshot = await getDocs(query(collection(firestore, "usuarios"), where("correo", "==", correo)));
  if (!emailQuerySnapshot.empty) {
    alert("Este correo electrónico ya está registrado. Por favor, utiliza otro correo electrónico.");
    return;
  }

  try {
    // Registro del usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
    const user = userCredential.user;

    // Registro de usuario en la colección "usuarios" en Firestore
    await addDoc(collection(firestore, "usuarios"), {
      uid: user.uid,
      nombre: nombre,
      correo: correo
    });

    alert("Registro exitoso. ¡Bienvenido!");
    // Redireccionar a la página de inicio de sesión
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    alert(`Error al registrar usuario: ${error.message}`);
  }
});
