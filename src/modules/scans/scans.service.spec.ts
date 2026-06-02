import { ScansService } from './scans.service';

const labelDetectionMock = jest.fn();

jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
    labelDetection: labelDetectionMock,
  })),
}));

describe('ScansService', () => {
  let service: ScansService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ScansService();
  });

  it('detecta banana desde etiquetas de Vision', async () => {
    labelDetectionMock.mockResolvedValue([
      {
        labelAnnotations: [{ description: 'Banana' }, { description: 'Fruit' }],
      },
    ]);

    const result = await service.analyzeImage(Buffer.from('fake-image'));

    expect(result.labels).toContain('banana');
    expect(result.detected).toEqual({
      name: 'banana',
      category: 'fruta',
    });
  });

  it('normaliza acentos en etiquetas (plátano -> platano)', async () => {
    labelDetectionMock.mockResolvedValue([
      {
        labelAnnotations: [{ description: 'Plátano' }],
      },
    ]);

    const result = await service.analyzeImage(Buffer.from('fake-image'));

    expect(result.labels).toContain('platano');
    expect(result.detected).toEqual({
      name: 'banana',
      category: 'fruta',
    });
  });

  it('retorna desconocido cuando no hay coincidencias', async () => {
    labelDetectionMock.mockResolvedValue([
      {
        labelAnnotations: [{ description: 'Car' }, { description: 'Vehicle' }],
      },
    ]);

    const result = await service.analyzeImage(Buffer.from('fake-image'));

    expect(result.detected).toEqual({
      name: 'desconocido',
      category: 'desconocido',
    });
  });
});
