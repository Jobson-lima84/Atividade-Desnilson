// Importações via CDN do Firebase v10
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCuGDSIIpHCyOqsS-9hIWHQh6S40lT-1Es",
  authDomain: "site-olho-no-tempo.firebaseapp.com",
  projectId: "site-olho-no-tempo",
  storageBucket: "site-olho-no-tempo.firebasestorage.app",
  messagingSenderId: "151682343947",
  appId: "1:151682343947:web:397e8a2bdf614ff71a930e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  console.log("Script telalogin.js carregado com sucesso!");

  const formLogin = document.getElementById('formLogin');

  if (formLogin) {
    formLogin.addEventListener('submit', async (event) => {
      event.preventDefault();
      console.log("Tentativa de login iniciada...");

      const emailInput = document.getElementById('email');
      const senhaInput = document.getElementById('senha');

      const email = emailInput ? emailInput.value.trim() : '';
      const senha = senhaInput ? senhaInput.value : '';

      let eValido = true;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        exibirErro('erro-email', 'Introduza um e-mail válido.');
        eValido = false;
      } else {
        limparErro('erro-email');
      }

      if (senha.length < 6) {
        exibirErro('erro-senha', 'A palavra-passe deve ter pelo menos 6 caracteres.');
        eValido = false;
      } else {
        limparErro('erro-senha');
      }

      if (!eValido) return;

      try {
        console.log("A autenticar utilizador no Firebase...");

        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        console.log("Login efetuado com sucesso!", user.email);

        localStorage.setItem('usuario_logado', JSON.stringify({ uid: user.uid, email: user.email, nome: user.displayName }));
        window.location.href = "home.html";

      } catch (error) {
        console.error("Erro no login Firebase:", error.code, error.message);

        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          exibirErro('erro-senha', 'E-mail ou palavra-passe incorretos.');
        } else if (error.code === 'auth/invalid-email') {
          exibirErro('erro-email', 'Formato de e-mail inválido.');
        } else if (error.code === 'auth/too-many-requests') {
          alert('Muitas tentativas falhadas. Acesso temporariamente bloqueado.');
        } else {
          alert('Erro ao entrar: ' + error.message);
        }
      }
    });
  } else {
    console.error("Erro: Elemento 'formLogin' não encontrado.");
  }
});

function exibirErro(idElemento, mensagem) {
  const el = document.getElementById(idElemento);
  if (el) {
    el.innerText = mensagem;
    el.style.display = 'block';
  }
}

function limparErro(idElemento) {
  const el = document.getElementById(idElemento);
  if (el) {
    el.innerText = '';
    el.style.display = 'none';
  }
}