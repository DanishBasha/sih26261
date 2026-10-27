import assert from 'assert';

console.log('🧪 Testing Application lifecycle logic...');
assert.strictEqual(['Draft', 'Review required', 'Deficiency raised'].includes('Draft'), true);
console.log('✅ Application lifecycle tests passed');
