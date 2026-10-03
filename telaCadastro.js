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
      console.log("Formulário submetido! A iniciar validação...");

      // Captura dos elementos e valores
      const nomeInput = document.getElementById('nome');
      const emailInput = document.getElementById('email');
      const senhaInput = document.getElementById('senha');
      const confirmarSenhaInput = document.getElementById('confirmarSenha');

      const nome = nomeInput ? nomeInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const senha = senhaInput ? senhaInput.value : '';
      const confirmarSenha = confirmarSenhaInput ? confirmarSenhaInput.value : '';

      let eValido = true;

      // 1. Validação de Nome
      if (nome.length < 3) {
        exibirErro('erro-nome', 'Introduza o seu nome (no mínimo 3 caracteres).');
        eValido = false;
      } else {
        limparErro('erro-nome');
      }

      // 2. Validação de E-mail (expressão regular)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        exibirErro('erro-email', 'Introduza um e-mail válido.');
        eValido = false;
      } else {
        limparErro('erro-email');
      }

      // 3. Validação de Senha
      if (senha.length < 6) {
        exibirErro('erro-senha', 'A palavra-passe deve ter pelo menos 6 caracteres.');
        eValido = false;
      } else {
        limparErro('erro-senha');
      }

      // 4. Confirmação de Senha
      if (senha !== confirmarSenha) {
        exibirErro('erro-confirmarSenha', 'As palavras-passe não coincidem.');
        eValido = false;
      } else {
        limparErro('erro-confirmarSenha');
      }

      // Se a validação local falhar, interrompe o envio
      if (!eValido) return;

      try {
        console.log("A criar utilizador no Firebase...");

        // Criar o utilizador no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Salvar o Nome no Perfil do Utilizador
        await updateProfile(user, {
          displayName: nome
        });

        // Opcional: Guardar dados locais (sem a palavra-passe)
        salvarUsuarioLocal({ uid: user.uid, nome, email });

        // Exibir Modal de Sucesso
        const cardCadastro = document.getElementById('cardCadastro');
        const modalSucesso = document.getElementById('modalSucesso');

        if (cardCadastro) cardCadastro.style.display = 'none';
        if (modalSucesso) modalSucesso.style.display = 'block';

        // Contagem regressiva para redirecionamento
        let tempoRestante = 3;
        const contadorEl = document.getElementById('contador');

        const intervalo = setInterval(() => {
          tempoRestante--;
          if (contadorEl) contadorEl.innerText = tempoRestante;

          if (tempoRestante <= 0) {
            clearInterval(intervalo);
            console.log("Redirecionando para index.html...");
            window.location.href = "index.html";
          }
        }, 1000);

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

// Funções auxiliares de erro
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

// Função para guardar dados do utilizador localmente (sem palavra-passe)
function salvarUsuarioLocal(usuario) {
  try {
    let usuarios = JSON.parse(localStorage.getItem('usuarios_olho_tempo')) || [];
    usuarios.push(usuario);
    localStorage.setItem('usuarios_olho_tempo', JSON.stringify(usuarios));
  } catch (e) {
    console.error("Erro ao guardar dados no localStorage:", e);
  }
}