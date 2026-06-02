import dataSource from '../src/data-source';
import { Product } from '../src/modules/products/entities/product.entity';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: Record<string, number | string | null | undefined>;
};

type NutritionPayload = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugars: number;
  sodium: number;
  servingSize?: string | null;
  externalId?: string | null;
};

const getNumber = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractNutrition = (offProduct: OffProduct): NutritionPayload | null => {
  const nutriments = offProduct.nutriments ?? {};

  const calories =
    getNumber(nutriments['energy-kcal_100g']) ??
    getNumber(nutriments['energy-kcal_serving']) ??
    getNumber(nutriments['energy-kcal']);
  const protein =
    getNumber(nutriments['proteins_100g']) ??
    getNumber(nutriments['proteins_serving']) ??
    getNumber(nutriments['proteins']);
  const carbohydrates =
    getNumber(nutriments['carbohydrates_100g']) ??
    getNumber(nutriments['carbohydrates_serving']) ??
    getNumber(nutriments['carbohydrates']);
  const fat =
    getNumber(nutriments['fat_100g']) ??
    getNumber(nutriments['fat_serving']) ??
    getNumber(nutriments['fat']);
  const fiber =
    getNumber(nutriments['fiber_100g']) ??
    getNumber(nutriments['fiber_serving']) ??
    getNumber(nutriments['fiber']);
  const sugars =
    getNumber(nutriments['sugars_100g']) ??
    getNumber(nutriments['sugars_serving']) ??
    getNumber(nutriments['sugars']);
  const sodium =
    getNumber(nutriments['sodium_100g']) ??
    getNumber(nutriments['sodium_serving']) ??
    getNumber(nutriments['sodium']);

  if (
    calories === null &&
    protein === null &&
    carbohydrates === null &&
    fat === null &&
    fiber === null &&
    sugars === null &&
    sodium === null
  ) {
    return null;
  }

  return {
    calories: Number(calories ?? 0),
    protein: Number(protein ?? 0),
    carbohydrates: Number(carbohydrates ?? 0),
    fat: Number(fat ?? 0),
    fiber: Number(fiber ?? 0),
    sugars: Number(sugars ?? 0),
    sodium: Number(sodium ?? 0),
    servingSize: offProduct.serving_size ?? null,
    externalId: offProduct.code ?? null,
  };
};

const fetchOffByBarcode = async (barcode: string): Promise<OffProduct | null> => {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'Alacena/1.0 (nutrition backfill)' } });
  if (!resp.ok) return null;
  const data = (await resp.json()) as { status?: number; product?: OffProduct };
  if (data.status !== 1 || !data.product) return null;
  return data.product;
};

const fetchOffByName = async (name: string, brand?: string | null): Promise<OffProduct | null> => {
  const terms = [name, brand].filter(Boolean).join(' ');
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    terms,
  )}&search_simple=1&action=process&json=1&page_size=5`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'Alacena/1.0 (nutrition backfill)' } });
  if (!resp.ok) return null;
  const data = (await resp.json()) as { products?: OffProduct[] };
  if (!data.products?.length) return null;
  return data.products.find((product) => extractNutrition(product)) ?? data.products[0] ?? null;
};

const needsBackfill = (product: Product) => {
  return (
    Number(product.niCalories ?? 0) === 0 ||
    Number(product.niProtein ?? 0) === 0 ||
    Number(product.niCarbohydrates ?? 0) === 0 ||
    Number(product.niFat ?? 0) === 0 ||
    Number(product.niFiber ?? 0) === 0 ||
    Number(product.niSugars ?? 0) === 0 ||
    Number(product.niSodium ?? 0) === 0
  );
};

const round2 = (value: number) => Math.round(value * 100) / 100;
const round0 = (value: number) => Math.round(value);

async function run() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(Product);

  const products = await repo
    .createQueryBuilder('product')
    .where(
      'product.niCalories = 0 OR product.niProtein = 0 OR product.niCarbohydrates = 0 OR product.niFat = 0 OR product.niFiber = 0 OR product.niSugars = 0 OR product.niSodium = 0',
    )
    .getMany();

  console.log(`Productos a revisar: ${products.length}`);

  let updated = 0;
  for (const product of products) {
    if (!needsBackfill(product)) continue;

    let offProduct: OffProduct | null = null;
    if (product.barcode) {
      offProduct = await fetchOffByBarcode(product.barcode);
    }

    if (!offProduct) {
      offProduct = await fetchOffByName(product.name, product.brand);
    }

    if (!offProduct) {
      console.warn(`Sin datos para ${product.name} (${product.id}).`);
      await sleep(250);
      continue;
    }

    const nutrition = extractNutrition(offProduct);
    if (!nutrition) {
      console.warn(`Sin nutrimentos útiles para ${product.name} (${product.id}).`);
      await sleep(250);
      continue;
    }

    product.niCalories = round0(nutrition.calories);
    product.niProtein = round2(nutrition.protein);
    product.niCarbohydrates = round2(nutrition.carbohydrates);
    product.niFat = round2(nutrition.fat);
    product.niFiber = round2(nutrition.fiber);
    product.niSugars = round2(nutrition.sugars);
    product.niSodium = round2(nutrition.sodium);
    product.niServingSize = nutrition.servingSize ?? product.niServingSize ?? null;
    product.externalSource = 'open_food_facts';
    product.externalId = nutrition.externalId ?? product.externalId ?? null;

    await repo.save(product);
    updated += 1;
    console.log(`Actualizado: ${product.name} (${product.id}).`);
    await sleep(250);
  }

  console.log(`Actualizados: ${updated}/${products.length}`);
  await dataSource.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
