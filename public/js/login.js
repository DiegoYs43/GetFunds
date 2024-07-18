// Importar configuración de Firebase
import { firestore, auth } from './firebase_config.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';

// Manejar el inicio de sesión
document.querySelector("form").addEventListener("submit", async function(event) {
  event.preventDefault();

  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, correo, contrasena);
    const user = userCredential.user;

    // Obtener el nombre del usuario desde Firestore
    const userDoc = await getDocs(query(collection(firestore, "usuarios"), where("Correo", "==", correo)));
    if (!userDoc.empty) {
      const userData = userDoc.docs[0].data();
      const nombre = userData.Nombre; // Utilizar Nombre con mayúscula

      alert(`¡Hola ${nombre}! Bienvenido`);
    } else {
      alert("Usuario encontrado en Firebase Authentication pero no en la base de datos");
    }

    // Redireccionar a la página "registroMonetario.html"
    window.location.href = "/html/rM.html";
  } catch (error) {
    console.error("Error al iniciar sesión:", error.code, error.message);
    alert(`Error al iniciar sesión: ${error.message}`);
  }
});

// Mostrar el modal de recuperación de contraseña
document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("forgotPasswordModal").classList.add("active");
});

// Cerrar el modal de recuperación de contraseña
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("forgotPasswordModal").classList.remove("active");
});

// Manejar el envío del formulario de recuperación de contraseña
document.getElementById("forgotPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgotEmail").value;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Correo de recuperación enviado. Por favor, revisa tu bandeja de entrada.");
    document.getElementById("forgotPasswordModal").classList.remove("active");
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error);
    alert("Error al enviar correo de recuperación: " + error.message);
  }
});
