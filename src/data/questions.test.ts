import { describe, expect, it } from 'vitest';
import { questions, validateGeneratedQuestions, type PracticeQuestion } from './questions';

const generatedQuestion: PracticeQuestion = {
  id: 'treino-ia-teste-001', area: 'Linguagens', subject: 'Linguagens', topicId: 'linguagens-interpretação-de-textos',
  difficulty: 'Fácil', source: 'ai_generated', prompt: 'Leia o contexto e identifique o objetivo principal do texto apresentado.',
  options: ['Informar', 'Narrar', 'Criticar', 'Instruir', 'Descrever'], answerIndex: 0,
  explanation: 'O texto apresenta um dado ao leitor, sem sequência narrativa ou instrução.',
  distractorNotes: ['Correta: comunica uma informação.', 'Não relata acontecimentos em sequência.', 'Não apresenta avaliação crítica.', 'Não orienta uma ação.', 'Não caracteriza atributos de um objeto.'],
};

describe('acervo de questões', () => {
  it('identifica itens autorais de treino e mantém alternativas e justificativas completas', () => {
    expect(questions.length).toBeGreaterThan(0);
    for (const question of questions) {
      expect(question.source).toBe('authorial');
      expect(question.options).toHaveLength(5);
      expect(question.answerIndex).toBeGreaterThanOrEqual(0);
      expect(question.answerIndex).toBeLessThan(5);
      expect(question.distractorNotes).toHaveLength(5);
    }
  });

  it('aceita questões geradas válidas e rotuladas como inéditas de IA', () => {
    expect(validateGeneratedQuestions([generatedQuestion])).toEqual([generatedQuestion]);
  });

  it('rejeita origem oficial inventada, id sem prefixo de treino ou gabarito inválido', () => {
    expect(validateGeneratedQuestions([{ ...generatedQuestion, source: 'official_reference' }])).toBeNull();
    expect(validateGeneratedQuestions([{ ...generatedQuestion, id: 'oficial-2026-01' }])).toBeNull();
    expect(validateGeneratedQuestions([{ ...generatedQuestion, answerIndex: 5 }])).toBeNull();
  });
});
