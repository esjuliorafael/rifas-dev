export function injectThemeColorIntoSvg(dataUrl: string, color: string): string {
  if (!dataUrl.startsWith('data:image/svg+xml;base64,')) {
    return dataUrl;
  }

  try {
    const base64Str = dataUrl.replace('data:image/svg+xml;base64,', '');
    
    // Decode base64 handling UTF-8 safely
    const binaryString = window.atob(base64Str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    let svgText = new TextDecoder('utf-8').decode(bytes);

    // Insertar style="color: {color};" en el elemento raíz <svg>
    svgText = svgText.replace(/(<svg\b[^>]*?)>/i, `$1 style="color: ${color};">`);

    // CASO 1: Bloques <style>...<style>
    svgText = svgText.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, styleContent) => {
      let modifiedStyle = styleContent;
      
      // Reemplazar fill: ...
      modifiedStyle = modifiedStyle.replace(/(fill\s*:\s*)([^;}]+)/gi, (m: string, prefix: string, val: string) => {
        const v = val.trim().toLowerCase();
        if (v === 'none' || v === 'transparent') return m;
        return `${prefix}${color}`;
      });

      // Reemplazar stroke: ...
      modifiedStyle = modifiedStyle.replace(/(stroke\s*:\s*)([^;}]+)/gi, (m: string, prefix: string, val: string) => {
        const v = val.trim().toLowerCase();
        if (v === 'none' || v === 'transparent') return m;
        return `${prefix}${color}`;
      });

      return match.replace(styleContent, modifiedStyle);
    });

    // CASO 2: Atributos inline fill="..." y stroke="..."
    svgText = svgText.replace(/fill=(['"])(.*?)\1/gi, (match, quote, value) => {
      const v = value.trim().toLowerCase();
      return (v === 'none' || v === 'transparent') ? match : `fill="${color}"`;
    });

    svgText = svgText.replace(/stroke=(['"])(.*?)\1/gi, (match, quote, value) => {
      const v = value.trim().toLowerCase();
      return (v === 'none' || v === 'transparent') ? match : `stroke="${color}"`;
    });

    // Encode again handling UTF-8 safely
    const modifiedBytes = new TextEncoder().encode(svgText);
    let newBinaryString = "";
    for (let i = 0; i < modifiedBytes.length; i++) {
        newBinaryString += String.fromCharCode(modifiedBytes[i]);
    }
    const newBase64 = window.btoa(newBinaryString);
    
    return `data:image/svg+xml;base64,${newBase64}`;
  } catch (error) {
    return dataUrl;
  }
}
