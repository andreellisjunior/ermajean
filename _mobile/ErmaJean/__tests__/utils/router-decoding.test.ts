const queryString = require('query-string');
describe('patched Router query decoder',()=>{
 it('preserves unicode and recovery query fields',()=>{expect(queryString.parse('name=caf%C3%A9&code=abc-123')).toEqual({name:'café',code:'abc-123'});});
 it('handles long malformed percent input without recursive explosion',()=>{const value='%FF'.repeat(10000);expect(queryString.parse(`q=${value}`).q).toBe(value);});
});
