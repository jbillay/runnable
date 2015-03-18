var hintLog = require('./hint-log');

describe('hintLog', function() {

  afterEach(function() {
    expect(hintLog.flush()).toEqual([]);
  });

  describe('logMessage', function() {
    it('should add a new message to the message queue', function() {
      hintLog.logMessage('##Hint Directives## An error');
      expect(hintLog.flush()['Hint Directives'][' An error']).toEqual(' An error');
    });


    it('should identify the name of a module given between ##identifiers##', function() {
      hintLog.logMessage('##Hint Dom## An error');
      expect(hintLog.flush()['Hint Dom'][' An error']).toEqual(' An error');
    });


    it('should queue modules without a given name under No Name', function() {
      hintLog.logMessage('An error');
      expect(hintLog.flush()['No Name']['An error']).toEqual('An error');
    });


    it('should prevent the logging of duplicate messages', function() {
      //Same error, only logged once
      hintLog.logMessage('##Hint Dom## An error');
      hintLog.logMessage('##Hint Dom## An error');
      expect(Object.keys(hintLog.flush()['Hint Dom']).length).toBe(1);

      //Different errors, both logged
      hintLog.logMessage('##Hint Dom## An error');
      hintLog.logMessage('##Hint Dom## A second error');
      expect(Object.keys(hintLog.flush()['Hint Dom']).length).toBe(2);

      hintLog.logMessage('An error');
      hintLog.logMessage('An error');
      expect(Object.keys(hintLog.flush()['No Name']).length).toBe(1);

      hintLog.logMessage('An error');
      hintLog.logMessage('A second error');
      expect(Object.keys(hintLog.flush()['No Name']).length).toBe(2);
    });
  });

  describe('flush', function() {
    it('should return the currently queued messages', function() {
      hintLog.logMessage('An error');
      hintLog.logMessage('Another error');
      var log = hintLog.flush();
      expect(log['No Name']['An error']).toEqual('An error');
      expect(log['No Name']['Another error']).toEqual('Another error');
    });


    it('should empty the queued messages', function() {
      hintLog.logMessage('An error');
      hintLog.logMessage('Another error');
      var log = hintLog.flush();
      expect(log['No Name']['An error']).toEqual('An error');
      expect(log['No Name']['Another error']).toEqual('Another error');
      expect(hintLog.flush()).toEqual([]);
    });
  });

  describe('onMessage', function() {
    it('should be called whenever a message is added', function() {
      hintLog.onMessage = jasmine.createSpy('onMessage');
      hintLog.logMessage('An error');
      expect(hintLog.onMessage).toHaveBeenCalledWith('An error');
      hintLog.flush();
    });
  });
});