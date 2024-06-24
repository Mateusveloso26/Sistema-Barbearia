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

// VOLTAR AO TOPO
window.onscroll = function () {
    scrollFunction()
  }
  
  function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.getElementById('btnTop').style.display = 'block'
    } else {
      document.getElementById('btnTop').style.display = 'none'
    }
  }
  
  function topFunction() {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }

