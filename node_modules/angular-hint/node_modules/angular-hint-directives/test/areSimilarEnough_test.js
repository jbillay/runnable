var areSimilarEnough = require('../lib/areSimilarEnough');

describe('areSimilarEnough()', function() {
  it('should identify if strings are similar enough', function() {
    var sim = ['hello','hellp'];
    var dif = ['asdfg','asqwre'];
    var far = ['hotdog','hamburgers'];
    var res1 = areSimilarEnough(sim[0], sim[1]);
    var res2 = areSimilarEnough(dif[0], dif[1]);
    var res3 = areSimilarEnough(far[0], far[1]);
    expect(res1).toBe(true);
    expect(res2).toBe(false);
    expect(res3).toBe(false);
  });
});
