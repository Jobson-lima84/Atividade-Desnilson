document.addEventListener('DOMContentLoaded', () => {
    const formNovoPost = document.getElementById('formNovoPost');
    const tituloInput = document.getElementById('tituloPost');
    const conteudoInput = document.getElementById('conteudoPost');
    const imagemInput = document.getElementById('imagemPost');
    const nomeArquivoImagem = document.getElementById('nomeArquivoImagem');
    const btnRemoverImagem = document.getElementById('btnRemoverImagem');
    const previewContainer = document.getElementById('previewContainer');
    const previewImagem = document.getElementById('previewImagem');
    const feedPosts = document.getElementById('feedPosts');

    let imagemSelecionadaDataUrl = '';

    // Prévia ao selecionar imagem
    if (imagemInput) {
        imagemInput.addEventListener('change', () => {
            const arquivo = imagemInput.files?.[0];
            if (!arquivo) {
                limparAnexoImagem();
                return;
            }

            if (!arquivo.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem válido.');
                limparAnexoImagem();
                return;
            }

            const leitor = new FileReader();
            leitor.onload = (evento) => {
                imagemSelecionadaDataUrl = String(evento.target?.result || '');
                previewImagem.src = imagemSelecionadaDataUrl;
                previewContainer.style.display = 'block';
                nomeArquivoImagem.textContent = arquivo.name;
                btnRemoverImagem.style.display = 'inline-flex';
            };
            leitor.readAsDataURL(arquivo);
        });
    }

    // Remover imagem antes de publicar
    if (btnRemoverImagem) {
        btnRemoverImagem.addEventListener('click', limparAnexoImagem);
    }

    function limparAnexoImagem() {
        imagemSelecionadaDataUrl = '';
        if (imagemInput) imagemInput.value = '';
        if (previewImagem) previewImagem.src = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (nomeArquivoImagem) nomeArquivoImagem.textContent = 'Nenhuma imagem selecionada';
        if (btnRemoverImagem) btnRemoverImagem.style.display = 'none';
    }

    // Criação de novo post (sempre abaixo do post fixado)
    if (formNovoPost && feedPosts) {
        formNovoPost.addEventListener('submit', (e) => {
            e.preventDefault();

            const titulo = tituloInput.value.trim();
            const conteudo = conteudoInput.value.trim();

            if (!titulo || !conteudo) return;

            const novoPostCard = document.createElement('article');
            novoPostCard.className = 'post-card';

            const blocoImagem = imagemSelecionadaDataUrl
                ? `<div class="post-imagem"><img src="${imagemSelecionadaDataUrl}" alt="Foto anexada por Você"></div>`
                : '';

            novoPostCard.innerHTML = `
                <div class="post-avatar" aria-hidden="true">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="post-conteudo">
                    <div class="post-info">
                        <span class="post-autor">Você</span>
                        <span class="post-tempo">Agora mesmo</span>
                    </div>
                    <h4 class="post-titulo">${escapeHTML(titulo)}</h4>
                    <p class="post-texto">${escapeHTML(conteudo)}</p>
                    ${blocoImagem}
                    <div class="post-acoes">
                        <button type="button" class="btn-acao btn-curtir" aria-label="Curtir publicação">
                            <i class="fa-solid fa-heart"></i> <span>0</span>
                        </button>
                        <button type="button" class="btn-acao btn-comentar" aria-label="Ver ou adicionar comentários">
                            <i class="fa-solid fa-comment"></i> <span>0</span>
                        </button>
                        <button type="button" class="btn-acao btn-denunciar" aria-label="Denunciar publicação">
                            <i class="fa-solid fa-flag"></i> <span>Denunciar</span>
                        </button>
                    </div>
                </div>
            `;

            const postsFixados = feedPosts.querySelectorAll('.post-card.post-pinned');
            if (postsFixados.length > 0) {
                const ultimoFixado = postsFixados[postsFixados.length - 1];
                ultimoFixado.insertAdjacentElement('afterend', novoPostCard);
            } else {
                feedPosts.prepend(novoPostCard);
            }

            tituloInput.value = '';
            conteudoInput.value = '';
            limparAnexoImagem();
        });
    }

    // Delegação de eventos para curtidas, comentários e denúncias
    if (feedPosts) {
        feedPosts.addEventListener('click', (e) => {
            // 1. Curtir / Descurtir
            const btnCurtir = e.target.closest('.btn-curtir');
            if (btnCurtir) {
                const spanContador = btnCurtir.querySelector('span');
                const totalAtual = parseInt(spanContador?.textContent || '0', 10) || 0;
                const curtidoAgora = btnCurtir.classList.toggle('ativo');

                if (spanContador) {
                    spanContador.textContent = String(curtidoAgora ? totalAtual + 1 : Math.max(0, totalAtual - 1));
                }
                return;
            }

            // 2. Denunciar / Remover denúncia
            const btnDenunciar = e.target.closest('.btn-denunciar');
            if (btnDenunciar) {
                const jaDenunciado = btnDenunciar.classList.toggle('denunciado');
                const spanTexto = btnDenunciar.querySelector('span');
                if (spanTexto) {
                    spanTexto.textContent = jaDenunciado ? 'Denunciado' : 'Denunciar';
                }
                return;
            }

            // 3. Abrir/fechar área de comentários
            const btnComentar = e.target.closest('.btn-comentar, .post-acoes .btn-acao:not(.btn-curtir):not(.btn-denunciar)');
            if (btnComentar) {
                const postConteudo = btnComentar.closest('.post-conteudo');
                if (!postConteudo) return;

                let secaoComentarios = postConteudo.querySelector('.secao-comentarios');
                if (!secaoComentarios) {
                    secaoComentarios = criarSecaoComentarios(btnComentar);
                    postConteudo.appendChild(secaoComentarios);
                } else {
                    const estaVisivel = secaoComentarios.style.display !== 'none';
                    secaoComentarios.style.display = estaVisivel ? 'none' : 'flex';
                }

                const inputComentario = secaoComentarios.querySelector('.input-comentario');
                if (secaoComentarios.style.display !== 'none' && inputComentario) {
                    inputComentario.focus();
                }
            }
        });

        // Envio de novo comentário dentro de qualquer post
        feedPosts.addEventListener('submit', (e) => {
            const formComentario = e.target.closest('.form-comentario');
            if (!formComentario) return;

            e.preventDefault();

            const inputComentario = formComentario.querySelector('.input-comentario');
            const textoComentario = inputComentario?.value.trim() || '';
            if (!textoComentario) return;

            const secaoComentarios = formComentario.closest('.secao-comentarios');
            const listaComentarios = secaoComentarios?.querySelector('.lista-comentarios');
            const postConteudo = formComentario.closest('.post-conteudo');
            const btnComentar = postConteudo?.querySelector('.btn-comentar, .post-acoes .btn-acao:not(.btn-curtir):not(.btn-denunciar)');
            const spanContador = btnComentar?.querySelector('span');

            if (listaComentarios) {
                const item = document.createElement('div');
                item.className = 'item-comentario';
                item.innerHTML = `
                    <span class="comentario-autor">Você</span>
                    <p class="comentario-texto">${escapeHTML(textoComentario)}</p>
                `;
                listaComentarios.appendChild(item);
            }

            if (spanContador) {
                const atual = parseInt(spanContador.textContent || '0', 10) || 0;
                spanContador.textContent = String(atual + 1);
            }

            inputComentario.value = '';
        });
    }

    function criarSecaoComentarios() {
        const container = document.createElement('div');
        container.className = 'secao-comentarios';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.marginTop = '10px';
        container.style.paddingTop = '12px';
        container.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';

        container.innerHTML = `
            <div class="lista-comentarios" style="display: flex; flex-direction: column; gap: 8px;"></div>
            <form class="form-comentario" style="display: flex; gap: 8px;">
                <input
                    type="text"
                    class="input-comentario"
                    placeholder="Escreva um comentário..."
                    required
                    style="flex: 1; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 10px; padding: 8px 12px; color: #ffffff; font-size: 0.88rem; outline: none;"
                >
                <button
                    type="submit"
                    style="background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.45); color: #7dd3fc; border-radius: 10px; padding: 8px 14px; font-size: 0.85rem; font-weight: 600; cursor: pointer;"
                >
                    Enviar
                </button>
            </form>
        `;

        return container;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});