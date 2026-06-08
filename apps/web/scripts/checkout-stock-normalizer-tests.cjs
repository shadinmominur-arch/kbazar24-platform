const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'src', 'lib', 'stock.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;

const sandbox = {
  exports: {},
  module: { exports: {} },
  require,
};
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(compiled, sandbox, { filename: sourcePath });

const { checkoutStockErrorMessage, normalizeStockAvailability } = sandbox.module.exports;

function product(overrides) {
  return {
    id: 100,
    name: 'Test Product',
    type: 'simple',
    status: 'publish',
    purchasable: true,
    stock_status: 'instock',
    manage_stock: false,
    stock_quantity: null,
    backorders: 'no',
    ...overrides,
  };
}

const cases = [
  {
    name: 'unmanaged instock null quantity is allowed',
    product: product({ manage_stock: false, stock_status: 'instock', stock_quantity: null }),
    quantity: 3,
    available: true,
  },
  {
    name: 'managed stock with enough quantity is allowed',
    product: product({ manage_stock: true, stock_quantity: 10 }),
    quantity: 3,
    available: true,
  },
  {
    name: 'managed zero stock is blocked',
    product: product({ manage_stock: true, stock_quantity: 0 }),
    quantity: 1,
    available: false,
  },
  {
    name: 'explicit outofstock is blocked',
    product: product({ stock_status: 'outofstock', manage_stock: false, stock_quantity: null }),
    quantity: 1,
    available: false,
  },
  {
    name: 'available variation overrides unavailable parent stock',
    product: product({ id: 200, name: 'Variable Parent', type: 'variable', purchasable: false, stock_status: 'outofstock' }),
    variation: product({ id: 201, parent_id: 200, name: 'Variation Shade A', type: 'variation', stock_status: 'instock', manage_stock: false }),
    quantity: 1,
    available: true,
  },
  {
    name: 'stale cart refresh blocks latest outofstock product',
    product: product({ id: 300, name: 'Fresh Woo Product', stock_status: 'outofstock' }),
    quantity: 1,
    available: false,
  },
];

for (const item of cases) {
  const result = normalizeStockAvailability(item.product, item.quantity, item.variation);
  assert.equal(result.available, item.available, item.name);
}

const blocked = normalizeStockAvailability(product({ name: 'Named Product', stock_status: 'outofstock' }), 1);
const message = checkoutStockErrorMessage(blocked);
assert.equal(message, 'Named Product is currently out of stock. Please remove it from cart or contact us.');
assert(!message.includes('Product #'), 'checkout error should use product name');

console.log(`checkout stock normalizer tests passed (${cases.length + 1})`);
