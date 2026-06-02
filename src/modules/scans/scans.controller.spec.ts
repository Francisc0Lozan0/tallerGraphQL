import { BadRequestException } from '@nestjs/common';
import { ScansController } from './scans.controller';

describe('ScansController', () => {
  const analyzeImage = jest.fn();
  const create = jest.fn();
  const notificationCreate = jest.fn();

  const scansService = {
    analyzeImage,
  };

  const inventoryService = {
    create,
  };

  const notificationsService = {
    create: notificationCreate,
  };

  let controller: ScansController;

  const mockReq = {
    user: {
      id: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ScansController(
      scansService as never,
      inventoryService as never,
      notificationsService as never,
    );
  });

  it('lanza error si no se envía archivo', async () => {
    await expect(controller.scan(undefined, mockReq)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('responde No reconocido cuando no detecta producto', async () => {
    analyzeImage.mockResolvedValue({
      detected: { name: 'desconocido', category: 'desconocido' },
      labels: ['car', 'vehicle'],
    });

    const response = await controller.scan(
      { buffer: Buffer.from('image') },
      mockReq,
    );

    expect(response).toEqual({
      message: 'No reconocido',
      labels: ['car', 'vehicle'],
    });
    expect(create).not.toHaveBeenCalled();
    expect(notificationCreate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ type: 'scan_unrecognized' }),
    );
  });

  it('guarda en inventario cuando se confirma un escaneo', async () => {
    create.mockResolvedValue({
      id: 1,
      productName: 'manzana',
      category: 'fruta',
      quantity: 1,
    });

    const response = await controller.confirm(
      {
        detectedName: 'manzana',
        category: 'fruta',
        quantity: 1,
        unit: 'pieces',
      } as any,
      mockReq,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        productName: 'manzana',
        category: 'fruta',
        userId: 1,
        unit: 'pieces',
      }),
    );

    expect(response).toEqual({
      saved: {
        id: 1,
        productName: 'manzana',
        category: 'fruta',
        quantity: 1,
      },
    });
  });
});