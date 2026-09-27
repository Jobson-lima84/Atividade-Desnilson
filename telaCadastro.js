document.addEventListener('DOMContentLoaded', () => {
    console.log("Script telaCadastro.js carregado com sucesso!");

    const formCadastro = document.getElementById('formCadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', function (event) {
            // 1. Impede a página de recarregar
            event.preventDefault();
            console.log("Formulário submetido! A iniciar validação...");

            // 2. Captura dos valores
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmarSenha').value;

            let eValido = true;

            // Validação simples de Nome
            if (nome.length < 3) {
                exibirErro('erro-nome', 'Introduza o seu nome (no mínimo 3 caracteres).');
                eValido = false;
            } else {
                limparErro('erro-nome');
            }

            // Validação de E-mail
            if (!email.includes('@') || !email.includes('.')) {
                exibirErro('erro-email', 'Introduza um e-mail válido.');
                eValido = false;
            } else {
                limparErro('erro-email');
            }

            // Validação de Senha
            if (senha.length < 6) {
                exibirErro('erro-senha', 'A palavra-passe deve ter pelo menos 6 caracteres.');
                eValido = false;
            } else {
                limparErro('erro-senha');
            }

            // Confirmação de Senha
            if (senha !== confirmarSenha) {
                exibirErro('erro-confirmarSenha', 'As palavras-passe não coincidem.');
                eValido = false;
            } else {
                limparErro('erro-confirmarSenha');
            }

            // 3. Se tudo estiver correto, exibe o modal e redireciona
            if (eValido) {
                console.log("Validação OK! Exibindo modal...");

                // Salva no LocalStorage
                salvarUsuario({ nome, email, senha });

                // Oculta o formulário e exibe o modal
                const cardCadastro = document.getElementById('cardCadastro');
                const modalSucesso = document.getElementById('modalSucesso');

                if (cardCadastro) cardCadastro.style.display = 'none';
                if (modalSucesso) modalSucesso.style.display = 'block';

                // Contador regressivo para redirecionar
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

function salvarUsuario(usuario) {
    try {
        let usuarios = JSON.parse(localStorage.getItem('usuarios_olho_tempo')) || [];
        usuarios.push(usuario);
        localStorage.setItem('usuarios_olho_tempo', JSON.stringify(usuarios));
    } catch (e) {
        console.error("Erro ao guardar dados:", e);
    }
}