App.FlashMessagesService = Ember.Service.extend({
  queue: Ember.A([]),
  isEmpty: Ember.computed.equal('queue.length', 0),
  defaultTimeout: 2000,
  isStack: true,
  success: function(message, timeout) {
    this._add(message, 'success', timeout);
  },
  danger: function(message, timeout) {
    this._add(message, 'danger', timeout);
  },
  _add: function(message, type, timeout) {
    var flash;
    timeout = (timeout === undefined) ? this.get('defaultTimeout') : timeout;
    flash = this._newFlash(message, type, timeout);
    if (this.get('isStack')) {
      this.get('queue').insertAt(0, flash);
    } else {
      this.get('queue').pushObject(flash);
    }
    return flash;
  },
  _newFlash: function(message, type, timeout) {
    var self = this;
    return Ember.Object.create({
      type: type,
      message: message,
      timer: null,
      init: function() {
        this.set('timer', Ember.run.later(this, 'destroyMessage', timeout));
      },
      destroyMessage: function() {
        self.get('queue').removeObject(this);
        this.destroy();
      },
      willDestroy: function() {
        var timer = this.get('timer');
        if (timer) {
          Ember.run.cancel(timer);
          this.set('timer', null);
        }
      }
    });
  }
});