import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateStorePricesTables1780200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de tiendas
    await queryRunner.createTable(
      new Table({
        name: 'stores',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '24',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'numeric',
            precision: 10,
            scale: 6,
            isNullable: false,
          },
          {
            name: 'longitude',
            type: 'numeric',
            precision: 10,
            scale: 6,
            isNullable: false,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'website',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );

    // Crear índices para tabla stores
    await queryRunner.createIndex(
      'stores',
      new TableIndex({
        name: 'idx_store_location',
        columnNames: ['latitude', 'longitude'],
      }),
    );

    await queryRunner.createIndex(
      'stores',
      new TableIndex({
        name: 'idx_store_active',
        columnNames: ['is_active'],
      }),
    );

    // Crear tabla de precios de tiendas
    await queryRunner.createTable(
      new Table({
        name: 'store_prices',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '24',
            isPrimary: true,
          },
          {
            name: 'store_id',
            type: 'char',
            length: '24',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'char',
            length: '24',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'is_available',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );

    // Crear índices para tabla store_prices
    await queryRunner.createIndex(
      'store_prices',
      new TableIndex({
        name: 'idx_store_price_store',
        columnNames: ['store_id'],
      }),
    );

    await queryRunner.createIndex(
      'store_prices',
      new TableIndex({
        name: 'idx_store_price_product',
        columnNames: ['product_id'],
      }),
    );

    await queryRunner.createIndex(
      'store_prices',
      new TableIndex({
        name: 'idx_store_price_store_product',
        columnNames: ['store_id', 'product_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'store_prices',
      new TableIndex({
        name: 'idx_store_price_updated',
        columnNames: ['updated_at'],
      }),
    );

    // Crear relaciones de clave foránea
    await queryRunner.createForeignKey(
      'store_prices',
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stores',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'store_prices',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar relaciones de clave foránea
    const table = await queryRunner.getTable('store_prices');
    const foreignKeys = table?.foreignKeys.filter(
      (fk) => fk.columnNames.indexOf('store_id') !== -1 || fk.columnNames.indexOf('product_id') !== -1,
    );

    if (foreignKeys) {
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('store_prices', fk);
      }
    }

    // Eliminar índices
    await queryRunner.dropIndex('store_prices', 'idx_store_price_updated');
    await queryRunner.dropIndex('store_prices', 'idx_store_price_store_product');
    await queryRunner.dropIndex('store_prices', 'idx_store_price_product');
    await queryRunner.dropIndex('store_prices', 'idx_store_price_store');
    await queryRunner.dropIndex('stores', 'idx_store_active');
    await queryRunner.dropIndex('stores', 'idx_store_location');

    // Eliminar tablas
    await queryRunner.dropTable('store_prices');
    await queryRunner.dropTable('stores');
  }
}
