export function blendWithWhite(hex: string, opacity: number): string {
  try {
    let cleanHex = hex.replace('#', '');
    
    // Si no es un hex de 3 o 6 caracteres, retornamos fallback
    if (cleanHex.length !== 3 && cleanHex.length !== 6) {
      return '#f9fafb';
    }

    // Expandir formato de 3 caracteres (ej. "abc" -> "aabbcc")
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return '#f9fafb';
    }

    // Fórmula para mezclar color con blanco sobre sus respectivos canales
    const blend = (channel: number) => Math.round(channel * opacity + 255 * (1 - opacity));

    const newR = blend(r).toString(16).padStart(2, '0');
    const newG = blend(g).toString(16).padStart(2, '0');
    const newB = blend(b).toString(16).padStart(2, '0');

    return `#${newR}${newG}${newB}`;
  } catch (error) {
    return '#f9fafb';
  }
}
