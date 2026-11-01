// Importações via CDN do Firebase v10
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
  console.log("Script telaCadastro.js carregado com sucesso!");

  const formCadastro = document.getElementById('formCadastro');

  if (formCadastro) {
    formCadastro.addEventListener('submit', async (event) => {
      event.preventDefault();
      console.log("Formulário de cadastro submetido...");

      const nomeInput = document.getElementById('nome');
      const emailInput = document.getElementById('email');
      const senhaInput = document.getElementById('senha');
      const confirmarSenhaInput = document.getElementById('confirmarSenha');

      const nome = nomeInput ? nomeInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const senha = senhaInput ? senhaInput.value : '';
      const confirmarSenha = confirmarSenhaInput ? confirmarSenhaInput.value : '';

      let eValido = true;

      // Validações locais
      if (nome.length < 3) {
        exibirErro('erro-nome', 'Introduza o seu nome (no mínimo 3 caracteres).');
        eValido = false;
      } else {
        limparErro('erro-nome');
      }

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

      if (senha !== confirmarSenha) {
        exibirErro('erro-confirmarSenha', 'As palavras-passe não coincidem.');
        eValido = false;
      } else {
        limparErro('erro-confirmarSenha');
      }

      if (!eValido) return;

      try {
        console.log("A criar utilizador no Firebase...");

        // Criação no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Atualiza o perfil com o Nome Completo (displayName)
        await updateProfile(user, {
          displayName: nome
        });

        console.log("Utilizador criado com sucesso!", user.email);

        alert("Cadastro realizado com sucesso! Clique em OK para ir para o login.");
        window.location.href = "index.html";

      } catch (error) {
        console.error("Erro no cadastro Firebase:", error.code, error.message);

        if (error.code === 'auth/email-already-in-use') {
          exibirErro('erro-email', 'Este e-mail já está em uso.');
        } else if (error.code === 'auth/weak-password') {
          exibirErro('erro-senha', 'A palavra-passe deve ter pelo menos 6 caracteres.');
        } else if (error.code === 'auth/invalid-email') {
          exibirErro('erro-email', 'Formato de e-mail inválido.');
        } else {
          alert('Erro ao registar: ' + error.message);
        }
      }
    });
  } else {
    console.error("Erro: Elemento 'formCadastro' não encontrado.");
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