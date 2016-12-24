var globalVars = {};

// Checks if the element has a scrollbar
(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

// Parses JSON into an object
function fromJSON(json) {
  try {
    var obj = jQuery.parseJSON(json);
    return obj;
  } catch (err) {
    return false;
  }
}

// Encodes an object into JSON
function toJSON(obj) {
  try {
    var json = JSON.stringify(obj);
    return json;
  } catch (err) {
    return false;
  }
}

function validateEmail(email) { 
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
} 

function disableForm(form) {
  form = $(form);
  form.find('input').each(function(index, elem) {
    if ($(elem).val() == '') {
      $(elem).hide();
    } else {
      $(elem).attr('disabled', true);
    }
  });
  form.find('*[type="checkbox"]').each(function(index, elem) {
    $(elem).hide();
    form.find('*[for="'+$(elem).attr('id')+'"]').hide();
  });
  form.find('*[type="submit"]').hide();
}

// Captures a form and forces it to use ajax
// When using the preSubmitCallback you must execute the continueCallback when you are ready
// to submit the form. This allows us to do asyncronous validation/calculations.
function captureForm(form, preSubmitCallback, postSubmitCallback) {
  form = $(form);
  if (!form.data('captured')) {
    form.data('captured', true);
    form.submit(function(e) {
      $('.alert').alert('close');
      var data = form.serialize();
      if (typeof preSubmitCallback == 'function') {
        preSubmitCallback(data, function(data) {
          // submit the form when called by the preSubmitCallback
          $.ajax({
            url : form.attr('action'),
            type : form.attr('method'),
            data : data,
            success : function(data) {
              if (typeof postSubmitCallback == 'function') {
                postSubmitCallback(true, data);
              }
            },
            error : function(data) {
              if (typeof postSubmitCallback == 'function') {
                postSubmitCallback(false, data);
              }
            }
          });
        });
      } else {
        // submit the form directly
        $.ajax({
          url : form.attr('action'),
          type : form.attr('method'),
          data : data,
          success : function(data) {
            if (typeof postSubmitCallback == 'function') {
              postSubmitCallback(true, data);
            }
            
          },
          error : function(data) {
            if (typeof postSubmitCallback == 'function') {
              postSubmitCallback(false, data);
            }
          }
        });
      }
      return false;
    });
  }
}

// // Captures a link and forces it to use the router
// function captureLink(link) {
//   if (!$(link).data('captured')) {
//     $(link).data('captured', true).attr('captured', true);
//     $(link).click(function(e) {
//       e.preventDefault();
//       var confirmation = $(this).data('confirm');
//       if (confirmation) {
//         var c = confirm(confirmation);
//         if (c) {
//           router.route($(this).attr('href'));
//         }
//       } else {
//         router.route($(this).attr('href'));
//       }
//       return false;
//     });
//   }
// }

// growl error
function set_error(message) {
  $('.growl').append('<div class="alert alert-danger fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Error!</strong> '+message+'</div>');
  $('.alert').alert();
  $('.alert-danger').bind('click', function() {
    $(this).alert('close');
  });
}

// growl success
function set_success(message) {
  $('.growl').append('<div class="alert alert-success fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Success!</strong> '+message+'</div>');
  $(".alert").alert();
  delay_alert($('.alert-success'), 5000, 100);
}

// growl notice
function set_notice(message) {
  $('.growl').append('<div class="alert alert-info fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Notice:</strong> '+message+'</div>');
  $(".alert").alert();
  delay_alert($('.alert-info'), 6000, 100);
}

// utility method to set up an automatic dismiss delay on alerts.
function delay_alert(elements, delay, delta) {
  var time_delay = delay + delta * elements.length;
  elements.each(function(index) {
    var myalert = $(this);
    // add a slight delay between each of the alerts
    if(index > 0) {
      time_delay -= delta;
    }
    setTimeout(function() {
      myalert.alert('close');
    }, time_delay);
  }).bind('click', function() {
    $(this).alert('close');
  });
}

function delay(callback, delay) {
  setTimeout(function() {
    callback();
  }, delay);
}

// adds a variable to the global variable storage
function setVar(varName, data) {
  globalVars[varName] = data;
  return data;
}

// Fetches a variable from the global varible storage
function getVar(varName) {
  if (varName in globalVars) {
    return globalVars[varName];
  } else {
    return null;
  }
}

//  Saves an object into the local browser storage
function setLocalStorage(varName, data) {
  if (typeof(Storage) !== 'undefined') {
    localStorage.setItem(varName, toJSON(data));
    return true;
  } else {
    console.debug('Warning: Your browser does not support local storage.');
    return false;
  }
}

// Retrieves an object from the local browser storage.
function getLocalStorage(varName) {
  if (typeof(Storage) !== 'undefined') {
    var data = localStorage.getItem(varName);
    if (data != null) {
      return fromJSON(data);
    } else {
      return null;
    }
  } else {
    console.debug('Warning: Your browser does not support local storage.');
    return null;
  }
}

// Displays a generic dialog with an ok button to dismiss it
function dialog(title, message) {
  var modal = resources.get('dialog');
  $('body').append(
    $(modal)
    .attr({
      id: 'dialog'
    })
  );
  $('#dialog .modal-dialog').addClass('modal-sm');
  $('#dialog .modal-title').html(title);
  $('#dialog .modal-body').html(message);
  $('#dialog').modal({
    show: true
  });
}

// converts camel case to underscores
String.prototype.toUnderscore  = function() {
  var result = this.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
  if (result[0] == '_') result = result.substr(1, result.length);
  return result;
}

// Populates a form from fields in an object
function populateForm(form, obj) {
  for (var property in obj) {
    name = property.toUnderscore();
    var field = $(form).find('[name="'+name+'"]')[0];
    if (field != undefined) {
      if ($(field).attr('type') == 'checkbox') {
        if (obj[property]) {
          $(field).attr('checked', true);
        }
      } else {
        $(field).val(obj[property]);
      }
    }
  }
}

// Prepares a fancy human readable date
function fancyDate(date) {
  date  = date || new Date();
  try {
    var curr_date = date.getDate();
    var curr_month = date.getMonth(); // Months are zero based
    var curr_year = date.getFullYear();
    var curr_hour = date.getHours();
    var curr_minute = date.getMinutes();
    var a = 'AM';
    if (curr_hour > 12) {
      a = 'PM';
      curr_hour -= 12;
    }
    if (curr_minute < 10) {
      curr_minute = '0' + curr_minute;
    }
    if (curr_hour == 0) {
      curr_hour = 12; // for 12 am
    }
    if (curr_hour < 10) {
      curr_hour = '0' + curr_hour;
    }
    return month(curr_month) + ' ' + day_position(curr_date) + ' ' + curr_year + ' at ' + curr_hour + ':' + curr_minute + ' ' + a;
  } catch(e) {
    return '';
  }
}

function day_position(day) {
  var day = day+'';
  var format = '';
  switch(day.charAt(day.length-1)) {
    case '1':
      format = 'st';
      break;
    case '2':
      format = 'nd';
      break;
    case '3':
      format = 'rd';
      break;
    default:
      format = 'th';
  }
  return day + format;
}

function month(index) {
  var month = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  return month[index];
}

// http redirect to a new page
function go(url) {
  url = url || document.URL;
  window.location.replace(url);
}

// Displays a notification in the lower right side of the window.
function set_notification(body, callback, delay) {
  delay = delay || 5000;
  // display the body in the notification and fire the callback if they click on it.
  // they can also ignore it or cancel it.
  // it will fade away after a few moments.
  var modal = '\
<div class="notification-modal modal fade" tabindex="-1" role="dialog">\
  <div class="modal-dialog modal-sm">\
    <div class="modal-content">\
      <div class="modal-body">\
        <button type="button" class="close" data-dismiss="modal">&times;</button>\
        <a href="#" class="notification-link notification-body"></a>\
      </div>\
    </div>\
  </div>\
</div>';
  
  $('#notification-dialog').remove();
  $('body').append(
    $(modal)
    .attr({
      id: 'notification-dialog'
    })
  );
  $('#notification-dialog .notification-body').empty().append(body);
  $('#notification-dialog .notification-link').click(function(e) {
    e.preventDefault();
    $('#notification-dialog').modal('hide');
    if (typeof callback == "function") {
      callback();
    }
  });

  var dialog = $('#notification-dialog');
  dialog.modal({
    show: true,
    backdrop: false,
    keyboard: false
  }).on('shown.bs.modal', function() {
    // start fading
    dialog.animate({
      opacity: 0
    }, delay, 'linear', function() {
      dialog.hide();
    });
  }).hover(function() {
    dialog.stop();
    dialog.animate({
      opacity:1
    }, 100);
  }, function() {
    // restart the fading process
    dialog.animate({
      opacity: 0
    }, delay, 'linear', function() {
      dialog.hide();
    });
  });
}

// Performs an advanced form of message encryption using the cryptico api.
// Adds support for decrypting with the senders public key
function encrypt(plaintext, receiverPublicKey, senderPublicKey, senderPrivateKey) {
  var cipherblock = "";
  var aeskey = cryptico.generateAESKey();
  // console.debug(senderPublicKey);
  try
  {
    cipherblock += cryptico.b16to64(senderPublicKey.encrypt(cryptico.bytes2string(aeskey))); // sender cipher
    cipherblock += "::52cee64bb3a38f6403386519a39ac91c::";
    cipherblock += cryptico.b16to64(receiverPublicKey.encrypt(cryptico.bytes2string(aeskey))) + "?"; // receiver cipher
  }
  catch(err)
  {
    return {status: "Invalid public key"};
  }
  signString = cryptico.b16to64(senderPrivateKey.signString(plaintext, 'sha256'));
  plaintext += "::52cee64bb3a38f6403386519a39ac91c::";
  plaintext += signString;
  cipherblock += cryptico.encryptAESCBC(plaintext, aeskey);
  return {status: "success", cipher: cipherblock};
}

// Performs an advanced form of message decryption using the cryptico api
function decrypt(ciphertext, receiverPrivateKey, senderPublicKey) {
  var cipherblock = ciphertext.split("?");
  aeskeyblock = cipherblock[0].split("::52cee64bb3a38f6403386519a39ac91c::");
  var aeskey = receiverPrivateKey.decrypt(cryptico.b64to16(aeskeyblock[1])); // receiver key
  if (aeskey == null) {
    aeskey = receiverPrivateKey.decrypt(cryptico.b64to16(aeskeyblock[0])); // sender key
  }
  if(aeskey == null)
  {
    return {status: "failure"};
  }
  aeskey = cryptico.string2bytes(aeskey);
  var plaintext = cryptico.decryptAESCBC(cipherblock[1], aeskey).split("::52cee64bb3a38f6403386519a39ac91c::");
  if(plaintext.length == 2)
  {
    var signature = cryptico.b64to16(plaintext[1]);
    if(senderPublicKey.verifyString(plaintext[0], signature))
    {
      return {
        status: "success", 
        plaintext: plaintext[0], 
        signature: "verified", 
      };
    }
    else
    {
      return {
        status: "success", 
        plaintext: plaintext[0], 
        signature: "forged", 
      };
    }
  }
  else
  {
    return {status: "success", plaintext: plaintext[0], signature: "unsigned"};
  }
}

// whites out the content and displays a wait message
function pleaseWait(message, callback) {
  message = message || 'Please Wait...';
  $('body .please-wait').remove();
  $('body').append($('<div/>').addClass('please-wait').append($('<div/>').addClass('wait-message').html(message)).css('opacity', 0));
  $('body .please-wait').animate({
    opacity:1
  }, 150, function() {
    if (typeof callback == 'function') {
      callback();
    }
  });
}
// removes wait message overlay
function pleaseContinue() {
  $('body .please-wait').animate({
    opacity:0,
  }, 150, function() {
    $(this).remove();
  });
}

// http://stackoverflow.com/questions/486896/adding-a-parameter-to-the-url-with-javascript
function parameterizeUrl(url, key, value)
{
  key = encodeURI(key); value = encodeURI(value);
  var kvp = url.split('&')
    , new_url;
  var i=kvp.length; var x; while(i--) 
  {
    x = kvp[i].split('=');
    if (x[0]==key)
    {
      x[1] = value;
      kvp[i] = x.join('=');
      break;
    }
  }
  if(i<0) {kvp[kvp.length] = [key,value].join('=');}
  if(url.split('?').length == 1) {
    new_url =  kvp.join('?');
  } else {
    new_url = kvp.join('&');
  }
  return new_url;
}