import { BmnFactory } from '../src/lib/server/db/factories.ts';

const data = BmnFactory.getStandardBmn();
console.log('Total items in factory:', data.length);
console.log('Sample item:', JSON.stringify(data[0], null, 2));

if (data.length === 13376) {
    console.log('Verification SUCCESS: Item count matches expected.');
} else {
    console.log('Verification FAILURE: Item count mismatch.');
}
