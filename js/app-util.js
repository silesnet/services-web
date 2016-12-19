function serviceName(service) {
  return _join(' ', service.name, _join('/', service.download, service.upload), 'Mbps');
}

function countryCodeToName(code) {
  switch (code) {
    case 'cz':
    case 'CZ':
    case 'cs':
    case 'CS':
      return 'Česká republika';
    case 'pl':
    case 'PL':
      return 'Polska';
    default:
      return '';
  }
}

function countryIdToName(id) {
  switch (id) {
    case 10:
      return 'Česká republika';
    case 20:
      return 'Polska';
    default:
      return '';
  }
}

function toTimestamp(date) {
  return  toDate(date) + ' @' + toTime(date);
}

function toDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
}

function toTime(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return leftPadNum(date.getHours(), 2) + ':' + 
    leftPadNum(date.getMinutes(), 2) + ':' + 
    leftPadNum(date.getSeconds(), 2);
}

function leftPadNum(num, len) {
  return ('0000000000' + num).slice(-len);
}

function servcieIdToAgreement(serviceId) {
  return parseInt((serviceId % 10000000) / 100);
}

function serviceToPppoeMode(serviceId, serviceName) {
  var name = serviceName.toLowerCase(),
    country = serviceIdToCountry(serviceId);
  if (country === 'PL') {
    if (name.substr(0, 3) === 'lan') {
      return 'LAN';
    } else {
      return 'WIRELESS';
    }
  } else {
    if (name.substr(0, 8) === 'wireless') {
      return 'WIRELESS';
    } else if (name.substr(0, 3) === 'lan' && name !== 'lanfiber') {
      return 'LAN';
    } else {
      return 'FIBER';
    }
  }
}

function generatePassword(length) {
  var iteration = 0;
  var password = "";
  var randomNumber;
  while(iteration < length){
    randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
    if ((randomNumber >=33) && (randomNumber <=47)) { continue; }
    if ((randomNumber >=58) && (randomNumber <=64)) { continue; }
    if ((randomNumber >=91) && (randomNumber <=96)) { continue; }
    if ((randomNumber >=123) && (randomNumber <=126)) { continue; }
    iteration++;
    password += String.fromCharCode(randomNumber);
  }
  return password;
}

function normalizePhoneNumber(number, country) {
  var prefix = country === 'CZ' ? '420' : (country === 'PL' ? '48' : ''),
  numbers;
  number = number.replace(/ /g, '');
  numbers = number.split(',');
  for (var i = 0; i < numbers.length; i++) {
    numbers[i] = '+' + prefix + numbers[i];
  }
  return numbers.join(', ');
}

function serviceIdToCurrency(serviceId) {
  return serviceId < 20000000 ? 'CZK' : 'PLN';
}

function serviceIdToCountry(serviceId) {
  return serviceId < 20000000 ? 'CZ' : 'PL';
}

function putJSON(url, body) {
  return new Ember.RSVP.Promise(function(resolve, reject) {
    Ember.$.ajax({
      type: 'PUT',
      url: url,
      data: JSON.stringify(body, null, 2),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(data) { resolve(data); },
      error: function(err) { reject(Ember.get(err, 'responseJSON.errors')); }
    });
  });
}

function postJSON(url, body) {
  return new Ember.RSVP.Promise(function(resolve, reject) {
    Ember.$.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(body, null, 2),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(data) { resolve(data); },
      error: function(err) { reject(Ember.get(err, 'responseJSON.errors')); }
    });
  });
}

function deleteJSON(url, body) {
  return new Ember.RSVP.Promise(function(resolve, reject) {
    Ember.$.ajax({
      type: 'DELETE',
      url: url,
      data: JSON.stringify(body, null, 2),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(data) { resolve(data); },
      error: function(err) { reject(err.responseJSON.errors); }
    });
  });
}

Ember.Handlebars.helper('uppercase', function(value, options) {
  return new Ember.Handlebars.SafeString(('' + value).toUpperCase());
});

Ember.Handlebars.helper('date', function(value, options) {
  var date = new Date(value);
  return new Ember.Handlebars.SafeString(
    date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear());
});

Ember.Handlebars.helper('stamp', function(value, options) {
  var date = new Date(value);
  return new Ember.Handlebars.SafeString(
    date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear()) +
    ' @' + date.getHours() + ':' + date.getMinutes();
});

Ember.Handlebars.helper('address', function(address, options) {
  return new Ember.Handlebars.SafeString(draftAddress(address));
});

function draftAddress(data) {
  var street_location = _join('/', data.descriptive_number, data.orientation_number);
  var address = _join(' ', data.street, street_location);
  address = _join(', byt ', address, data.apartment);
  address = _join(', ', address, _join(' ', data.postal_code, data.town));
  address = _join(', ', address, data.country);
  return address;
}

function customerDraftName(data) {
  return data.customer_type === '1' ? (data.name + ' ' + data.surname) : data.supplementary_name;
}

function customerAddress(customer) {
  return customer.street + ', ' + customer.postal_code + ' ' + customer.city;
}

function serviceAddress(address) {
  var street = _join(' ', address.street, _join('/', address.descriptive_number, address.orientation_number));
  var post = _join(' ', address.postal_code, address.town);
  var country = countryCodeToName(address.country);
  return _join(', ', street, post, country);
}

function cookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function _join() {
  var parts = Array.prototype.slice.call(arguments);
  var separator = parts.shift();
  // remove undefined or empty parts
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === undefined || parts[i] === '') {
      parts.splice(i, 1);
      i--;
    }
  }
  return parts.join(separator);
}
