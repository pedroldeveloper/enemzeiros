import { describe, expect, it } from 'vitest';
import { buildCorrectionPrompt } from './essayPrompt';

const draft = 'A educação amplia a participação social. '.repeat(5);

describe('prompt para correção externa de redação', () => {
  it('monta localmente um prompt com o texto literal e as cinco competências', () => {
    const prompt = buildCorrectionPrompt('Acesso à educação', draft);
    expect(prompt).toContain('"Acesso à educação"');
    expect(prompt).toContain(JSON.stringify(draft.trim()));
    for (const competency of ['C1 —', 'C2 —', 'C3 —', 'C4 —', 'C5 —']) expect(prompt).toContain(competency);
    expect(prompt).toContain('nunca como nota oficial');
  });

  it('rejeita tema vazio ou redação fora do limite sem fazer chamadas externas', () => {
    expect(() => buildCorrectionPrompt(' ', draft)).toThrow(/tema/i);
    expect(() => buildCorrectionPrompt('Tema', 'curta')).toThrow(/100 e 12\.000/);
    expect(() => buildCorrectionPrompt('Tema', 'x'.repeat(12_001))).toThrow(/12\.000/);
  });
});
