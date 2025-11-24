document.addEventListener("DOMContentLoaded", function () {
  const phoneInput = document.getElementById("phone");

  if (!phoneInput) return;

  function formatBRPhone(value) {
    // pega só dígitos e limita a 11 (DDD + 9 dígitos)
    let d = value.replace(/\D/g, "").slice(0, 11);
    const len = d.length;

    if (len === 0) return "";
    if (len < 3) return `(${d}`;
    if (len < 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`; // (XX) XXXX...
    if (len <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`; // (XX) XXXX-XXXX
    // len === 11
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; // (XX) 9XXXX-XXXX
  }

  phoneInput.addEventListener("input", function (e) {
    const el = e.target;
    const oldValue = el.value;
    const oldCursor = el.selectionStart || 0;

    // Quantos dígitos havia antes do cursor (para preservar posição)
    const digitsBeforeCursor = oldValue
      .slice(0, oldCursor)
      .replace(/\D/g, "").length;

    const newFormatted = formatBRPhone(oldValue);

    // Atualiza valor
    el.value = newFormatted;

    // Reposiciona cursor aproximando para o mesmo "índice de dígitos"
    if (digitsBeforeCursor === 0) {
      // coloca no início (após possível "(")
      el.setSelectionRange(
        newFormatted.indexOf("(") === 0 ? 1 : 0,
        newFormatted.indexOf("(") === 0 ? 1 : 0
      );
      return;
    }

    // encontra posição no string formatado que corresponde ao digitsBeforeCursor
    let pos = 0;
    let digitsSeen = 0;
    while (pos < newFormatted.length && digitsSeen < digitsBeforeCursor) {
      if (/\d/.test(newFormatted.charAt(pos))) digitsSeen++;
      pos++;
    }
    el.setSelectionRange(pos, pos);
  });

  // opcional: quando perder foco, se tiver apenas "(" ou "(" + DDD incompleto, limpa
  phoneInput.addEventListener("blur", function (e) {
    if (!e.target.value.replace(/\D/g, "").length) e.target.value = "";
  });
});
