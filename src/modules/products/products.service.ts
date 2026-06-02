import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) {}

  private generateId(): string {
    return randomBytes(12).toString('hex');
  }

  async create(createProductDto: CreateProductDto) {
    const existingByName = await this.repo.findOneBy({
      name: createProductDto.name,
    });

    if (existingByName) {
      throw new ConflictException('Ya existe un producto con ese nombre.');
    }

    if (createProductDto.barcode) {
      const existingByBarcode = await this.repo.findOneBy({
        barcode: createProductDto.barcode,
      });

      if (existingByBarcode) {
        throw new ConflictException('Ya existe un producto con ese código.');
      }
    }

    const product = this.repo.create({
      id: this.generateId(),
      ...createProductDto,
    });

    return this.repo.save(product);
  }

  async findAll(query?: { q?: string; category?: string }) {
    const where: any = {};

    if (query?.q) {
      where.name = ILike(`%${query.q}%`);
    }

    if (query?.category) {
      where.category = query.category;
    }

    return this.repo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const product = await this.repo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.repo.findOneBy({ barcode });

    if (!product) {
      throw new NotFoundException('Producto no encontrado por código de barras.');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (updateProductDto.name) {
      const existingByName = await this.repo.findOneBy({
        name: updateProductDto.name,
      });

      if (existingByName && existingByName.id !== id) {
        throw new ConflictException('Ya existe un producto con ese nombre.');
      }
    }

    if (updateProductDto.barcode) {
      const existingByBarcode = await this.repo.findOneBy({
        barcode: updateProductDto.barcode,
      });

      if (existingByBarcode && existingByBarcode.id !== id) {
        throw new ConflictException('Ya existe un producto con ese código.');
      }
    }

    Object.assign(product, updateProductDto);

    return this.repo.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return this.repo.remove(product);
  }

async smartFindProduct(input: string): Promise<Product[]> {
  const cleanInput = input.trim().toLowerCase();

  // 1. Buscar por barcode exacto
  const exactBarcode = await this.repo.findOneBy({
    barcode: cleanInput,
  });

  if (exactBarcode) {
    return [exactBarcode];
  }

  // 2. Buscar nombre exacto
  const exactName = await this.repo.find({
    where: {
      name: ILike(cleanInput),
    },
    take: 5,
  });

  if (exactName.length > 0) {
    return exactName;
  }

  // 3. Buscar coincidencias parciales
  const partialMatches = await this.repo.find({
    where: {
      name: ILike(`%${cleanInput}%`),
    },
    order: {
      name: 'ASC',
    },
    take: 10,
  });

  if (partialMatches.length > 0) {
    return partialMatches;
  }

  // 4. Fallback fuzzy search
  const fuzzyMatches = await this.repo
    .createQueryBuilder('product')
    .select([
      'product.id',
      'product.name',
      'product.barcode',
      'product.category',
      'product.brand',
    ])
    .addSelect(
      `similarity(lower(product.name), lower(:input))`,
      'score',
    )
    .where(
      `similarity(lower(product.name), lower(:input)) > 0.35`,
    )
    .setParameter('input', cleanInput)
    .orderBy('score', 'DESC')
    .limit(10)
    .getMany();

  if (fuzzyMatches.length > 0) {
    return fuzzyMatches;
  }

  throw new NotFoundException(
    'No se encontraron productos relacionados.',
  );
}
}