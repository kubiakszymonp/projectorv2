import { parseScenarioFile, buildScenarioFile, ScenarioParseError } from './scenario-parser';

const VALID = `schemaVersion: scenario-1
id: 01HXZ3R8E7Q2V4VJ6T9G2J8N1P
title: Niedziela 11:00
steps:
  - text: songs/barka__01HXZ3R8E7Q2V4VJ6T9G2J8N1P
  - heading: Pieśni
  - blank: true
  - qrcode: https://parafia.example/intencje
`;

describe('scenario-parser', () => {
  it('parses a valid scenario with mixed step types', () => {
    const doc = parseScenarioFile(VALID, 'scenarios/test.yaml');
    expect(doc.meta.title).toBe('Niedziela 11:00');
    expect(doc.steps).toHaveLength(4);
    expect(doc.steps[3]).toEqual({ qrcode: 'https://parafia.example/intencje' });
  });

  it('reads optional date', () => {
    const doc = parseScenarioFile(VALID + 'date: "2026-06-14"\n', 'scenarios/test.yaml');
    expect(doc.meta.date).toBe('2026-06-14');
  });

  it('rejects wrong schemaVersion', () => {
    expect(() => parseScenarioFile('schemaVersion: x\nid: a\ntitle: t\nsteps: []', 'f.yaml')).toThrow(
      ScenarioParseError,
    );
  });

  it('rejects a step with multiple keys', () => {
    const bad = `schemaVersion: scenario-1
id: a
title: t
steps:
  - text: a
    heading: b
`;
    expect(() => parseScenarioFile(bad, 'f.yaml')).toThrow(ScenarioParseError);
  });

  it('round-trips through buildScenarioFile', () => {
    const doc = parseScenarioFile(VALID, 'scenarios/test.yaml');
    const rebuilt = buildScenarioFile(doc.meta, doc.steps);
    const reparsed = parseScenarioFile(rebuilt, 'scenarios/test.yaml');
    expect(reparsed.steps).toEqual(doc.steps);
    expect(reparsed.meta.id).toBe(doc.meta.id);
  });
});
