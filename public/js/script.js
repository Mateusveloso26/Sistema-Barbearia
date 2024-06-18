const telefone = document.getElementById('telefone');
telefone.addEventListener('input', () => {
    let valorAtual = telefone.value.replace(/\D/g, "").substring(0, 11);
    let numeroFormatado = "";

    if (valorAtual.length > 0) {
        numeroFormatado = `(${valorAtual.substring(0, 2)})`;
    }
    if (valorAtual.length > 2) {
        numeroFormatado += ` ${valorAtual.substring(2, 7)}`;
    }
    if (valorAtual.length > 7) {
        numeroFormatado += `-${valorAtual.substring(7, 11)}`;
    }
    telefone.value = numeroFormatado; 
});


