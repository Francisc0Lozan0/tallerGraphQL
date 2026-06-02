export interface FoodRule {
  name: string;
  category: string;
  keywords: string[];
}

export const UNKNOWN_FOOD = {
  name: 'desconocido',
  category: 'desconocido',
};

export const FOOD_RULES: FoodRule[] = [
  // Frutas
  { name: 'manzana', category: 'fruta', keywords: ['apple', 'manzana'] },
  { name: 'banana', category: 'fruta', keywords: ['banana', 'platano'] },
  { name: 'naranja', category: 'fruta', keywords: ['orange', 'naranja'] },
  { name: 'limon', category: 'fruta', keywords: ['lemon', 'lime', 'limon'] },
  { name: 'pera', category: 'fruta', keywords: ['pear', 'pera'] },
  { name: 'uva', category: 'fruta', keywords: ['grape', 'uva'] },
  {
    name: 'fresa',
    category: 'fruta',
    keywords: ['strawberry', 'fresa', 'berries'],
  },
  {
    name: 'arandano',
    category: 'fruta',
    keywords: ['blueberry', 'arandano'],
  },
  { name: 'mango', category: 'fruta', keywords: ['mango'] },
  { name: 'pina', category: 'fruta', keywords: ['pineapple', 'pina'] },
  {
    name: 'aguacate',
    category: 'fruta',
    keywords: ['avocado', 'aguacate', 'palta'],
  },
  { name: 'sandia', category: 'fruta', keywords: ['watermelon', 'sandia'] },
  { name: 'melon', category: 'fruta', keywords: ['melon', 'cantaloupe'] },
  { name: 'papaya', category: 'fruta', keywords: ['papaya'] },

  // Verduras
  { name: 'tomate', category: 'verdura', keywords: ['tomato', 'tomate'] },
  { name: 'cebolla', category: 'verdura', keywords: ['onion', 'cebolla'] },
  { name: 'ajo', category: 'verdura', keywords: ['garlic', 'ajo'] },
  { name: 'zanahoria', category: 'verdura', keywords: ['carrot', 'zanahoria'] },
  {
    name: 'lechuga',
    category: 'verdura',
    keywords: ['lettuce', 'lechuga', 'salad'],
  },
  {
    name: 'pepino',
    category: 'verdura',
    keywords: ['cucumber', 'pepino'],
  },
  {
    name: 'brocoli',
    category: 'verdura',
    keywords: ['broccoli', 'brocoli'],
  },
  {
    name: 'coliflor',
    category: 'verdura',
    keywords: ['cauliflower', 'coliflor'],
  },
  {
    name: 'espinaca',
    category: 'verdura',
    keywords: ['spinach', 'espinaca'],
  },
  {
    name: 'pimiento',
    category: 'verdura',
    keywords: ['pepper', 'bell pepper', 'pimiento'],
  },
  {
    name: 'papa',
    category: 'verdura',
    keywords: ['potato', 'papa'],
  },
  {
    name: 'camote',
    category: 'verdura',
    keywords: ['sweet potato', 'camote'],
  },
  { name: 'yuca', category: 'verdura', keywords: ['cassava', 'yuca'] },
  {
    name: 'berenjena',
    category: 'verdura',
    keywords: ['eggplant', 'berenjena'],
  },
  {
    name: 'champiñon',
    category: 'verdura',
    keywords: ['mushroom', 'champiñon', 'fungi'],
  },

  // Proteínas animales
  {
    name: 'pollo',
    category: 'proteina',
    keywords: ['chicken', 'pollo', 'poultry'],
  },
  {
    name: 'res',
    category: 'proteina',
    keywords: ['beef', 'steak', 'res'],
  },
  {
    name: 'cerdo',
    category: 'proteina',
    keywords: ['pork', 'cerdo', 'ham', 'bacon'],
  },
  {
    name: 'pavo',
    category: 'proteina',
    keywords: ['turkey', 'pavo'],
  },
  {
    name: 'pescado',
    category: 'proteina',
    keywords: ['fish', 'pescado', 'salmon', 'tuna'],
  },
  {
    name: 'camaron',
    category: 'proteina',
    keywords: ['shrimp', 'prawn', 'camaron'],
  },
  {
    name: 'huevo',
    category: 'proteina',
    keywords: ['egg', 'huevo', 'omelette'],
  },

  // Lácteos
  {
    name: 'leche',
    category: 'lacteo',
    keywords: ['milk', 'leche', 'dairy'],
  },
  {
    name: 'queso',
    category: 'lacteo',
    keywords: ['cheese', 'queso'],
  },
  {
    name: 'yogur',
    category: 'lacteo',
    keywords: ['yogurt', 'yoghurt', 'yogur'],
  },
  {
    name: 'mantequilla',
    category: 'lacteo',
    keywords: ['butter', 'mantequilla'],
  },
  {
    name: 'crema',
    category: 'lacteo',
    keywords: ['cream', 'crema'],
  },

  // Granos y cereales
  { name: 'arroz', category: 'grano', keywords: ['rice', 'arroz'] },
  {
    name: 'pasta',
    category: 'grano',
    keywords: ['pasta', 'noodle', 'spaghetti', 'macaroni'],
  },
  { name: 'avena', category: 'grano', keywords: ['oat', 'oatmeal', 'avena'] },
  {
    name: 'quinoa',
    category: 'grano',
    keywords: ['quinoa'],
  },
  {
    name: 'maiz',
    category: 'grano',
    keywords: ['corn', 'maize', 'maiz'],
  },
  {
    name: 'trigo',
    category: 'grano',
    keywords: ['wheat', 'trigo', 'flour'],
  },
  {
    name: 'pan',
    category: 'grano',
    keywords: ['bread', 'pan', 'toast', 'bun'],
  },
  {
    name: 'tortilla',
    category: 'grano',
    keywords: ['tortilla', 'wrap'],
  },

  // Legumbres
  {
    name: 'frijol',
    category: 'legumbre',
    keywords: ['bean', 'frijol', 'black bean', 'kidney bean'],
  },
  {
    name: 'lenteja',
    category: 'legumbre',
    keywords: ['lentil', 'lenteja'],
  },
  {
    name: 'garbanzo',
    category: 'legumbre',
    keywords: ['chickpea', 'garbanzo'],
  },
  {
    name: 'guisante',
    category: 'legumbre',
    keywords: ['pea', 'guisante'],
  },

  // Frutos secos y semillas
  {
    name: 'almendra',
    category: 'fruto_seco',
    keywords: ['almond', 'almendra'],
  },
  {
    name: 'nuez',
    category: 'fruto_seco',
    keywords: ['walnut', 'nuez'],
  },
  {
    name: 'mani',
    category: 'fruto_seco',
    keywords: ['peanut', 'mani'],
  },
  {
    name: 'pistacho',
    category: 'fruto_seco',
    keywords: ['pistachio', 'pistacho'],
  },
  {
    name: 'chia',
    category: 'semilla',
    keywords: ['chia'],
  },

  // Condimentos y aceites
  {
    name: 'aceite de oliva',
    category: 'condimento',
    keywords: ['olive oil', 'aceite'],
  },
  {
    name: 'vinagre',
    category: 'condimento',
    keywords: ['vinegar', 'vinagre'],
  },
  {
    name: 'sal',
    category: 'condimento',
    keywords: ['salt', 'sal'],
  },
  {
    name: 'azucar',
    category: 'condimento',
    keywords: ['sugar', 'azucar'],
  },
  {
    name: 'miel',
    category: 'condimento',
    keywords: ['honey', 'miel'],
  },

  // Preparados frecuentes
  {
    name: 'sopa',
    category: 'preparado',
    keywords: ['soup', 'sopa'],
  },
  {
    name: 'ensalada',
    category: 'preparado',
    keywords: ['salad', 'ensalada'],
  },
  {
    name: 'pizza',
    category: 'preparado',
    keywords: ['pizza'],
  },
  {
    name: 'hamburguesa',
    category: 'preparado',
    keywords: ['burger', 'hamburger', 'hamburguesa'],
  },
  {
    name: 'sandwich',
    category: 'preparado',
    keywords: ['sandwich'],
  },
  {
    name: 'taco',
    category: 'preparado',
    keywords: ['taco'],
  },
  {
    name: 'sushi',
    category: 'preparado',
    keywords: ['sushi'],
  },
  {
    name: 'cereal',
    category: 'preparado',
    keywords: ['cereal', 'breakfast cereal'],
  },
];