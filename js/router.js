function Router(view) {
  var self = this;
  self.view = view;
  self.routes = {};
  self.controllers = {};
  self.defaultRoute = '/';
  self.viewStack = {};
  self.executeBefore = null;
  self.executeAfter = null;
  self.defaultTitle = null;

  // Performs the visual transition of the view content.
  function transitionView(route, options) {
    if (route.template !== false) {
      if (!route.modal && !options.inheriting) {
        try { window.history.pushState({}, '', options.href); } catch(e) {}
        if (route.title) {
          document.title = route.title;
        } else if(self.defaultTitle) {
          document.title = self.defaultTitle;
        }
      }

      if (route.modal) {
        // build the modal
        $('#lightbox').remove();
        var lightbox = $(route.template).attr('id','lightbox');

        options.state = 'pre.load';
        options.templateView = lightbox;
        var ok = executeController(route, options);
        if(!ok) return;

        $('body').append(lightbox);
        lightbox.modal({
          'backdrop':'static',
          'show':true,
          'keyboard':true
        });
        lightbox.on('shown.bs.modal', function(e) {
          if (self.executeAfter != null) {
            self.executeAfter();
            if (options.callbacks && options.callbacks.after) {
              options.callbacks.after();
            }
          }
          
          options.state = 'post.load';
          options.templateView = lightbox;
          var ok = executeController(route, options);
          if(!ok) $(this).modal('hide');
        });
        lightbox.find('button[type="submit"]').on('click', function(e) {
          $(this).button('loading');
          $('.alert').alert('close');
          // validate fields
          var valid = true;
          lightbox.find('form [required]').each(function(index, element) {
            if(!element.checkValidity()) {
              valid = false;
            }
          });
          if (valid) {
            lightbox.find('form').submit();
          } else {
            set_notice('Please fill in all required fields');
            $(this).button('reset');
          }
        });
        // capture the form
        lightbox.find('form').submit(function(e) {
          var form = $(this);
          var data = form.serialize();
          options.state = 'pre.submit';
          options.data = data;
          options.templateView = lightbox;
          var ok = executeController(route, options);
          if(!ok) return;
          $.ajax({
            url : form.attr('action'),
            type : form.attr('method'),
            data : data,
            success : function(response) {
              lightbox.modal('hide');
              options.success = true;
              options.response = response;
              options.state = 'post.submit';
              executeController(route, options);
            },
            error : function(response) {
              lightbox.modal('hide');
              options.success = false;
              options.response = response;
              options.state = 'post.submit';
              executeController(route, options);
            }
          });
          return false;
        });
      } else {
        var templateView = $(route.template);

        options.state = 'pre.load';
        options.templateView = templateView;
        var ok = executeController(route, options);
        if(!ok) return;

        // transition to the new view
        $(options.view).fadeOut(options.speed, function() {
          $(this).html(templateView).fadeIn(options.speed, function() {
            if (self.executeAfter != null) {
              self.executeAfter();
            }
            if (options.callbacks && options.callbacks.after) {
              options.callbacks.after();
            }

            // push the route onto the view stack so we can do view inheritance.
            self.viewStack[route.url] = {
              view:options.view,
              route:route.url
            };

            // call the controller
            options.state = 'post.load';
            options.templateView = templateView;
            executeController(route, options);
          });
        });
      }
    } else {
      // just call the controller
      options.state = 'post.load';
      executeController(route, options);
    }
  }

  // Handles the controller execution of a route
  function executeController(route, options) {
    // default state is post view loading
    options.state = options.state || 'post.load';
    if(jQuery.inArray(route.controller, self.controllers) && typeof self.controllers[route.controller] == 'function') {
      var ok = self.controllers[route.controller](options);
      return ok !== false;
    } else {
      console.debug('Unknown controller '+route.controller);
      return true;
    }
  }

  // Handles cleanup when a template fails to load
  function templateLoadFailed(route) {
    console.debug('The template "'+route.templateUrl+'" could not be loaded from "'+route.url+'". Response was "'+route.errorMessage+'"');
  }

  // Performs the default route
  function executeDefaultRoute() {
    var r = self.routes[self.defaultRoute];
    if (r != undefined) {
      self.route(self.defaultRoute);
    } else {
      console.debug('Exception! The default route does not exist');
    }
  }

  // Runs before the route begings
  self.before = function(callback) {
    if (callback != undefined && typeof callback == 'function') {
      self.executeBefore = callback;
    }
    return self;
  }

  // Runs after the route is complete.
  // Note this only applies where a template is involved
  // This will most often run after the controller, but don't count on it.
  self.after = function(callback) {
    if (callback != undefined && typeof callback == 'function') {
      self.executeAfter = callback;
    }
    return self;
  }

  // Should be ran after the document has finished loading
  // to connect the view and load the routes
  self.when = function(url, config) {
    // Force empty strings to be null
    if (config.controller == '') config.controller = null;
    if (config.templateUrl == '') config.templateUrl = null;
    config.modal = config.modal || false;

    // Require at least a templateUrl or controller.
    if (config.templateUrl == null && config.controller == null) {
      console.debug('route configuration is incomplete. Route "'+url+'" needs to specify a templateUrl and/or controller');
      return self;
    }

    // configure settings
    var route = {
      url: url,
      controller:config.controller,
      templateUrl:config.templateUrl,
      modal:config.modal,
      title:config.title
    }

    // validate parent inheritance config
    if (config.parent != undefined) {
      if (config.parent.view == '' || config.parent.view == undefined || config.parent.route == '' || config.parent.route == undefined) {
        console.debug('route inheritance configuration is incomplete. Route "'+url+'" needs to specify the parent view and route');
        return self;
      } else {
        route.parent = config.parent;
      }
    }

    // set the status of the template loading.
    if (config.templateUrl != null) {
      route.status = 'loading';
    } else {
      route.status = 'ready';
      route.template = false;
    }

    self.routes[url] = route;

    // load the template
    if (config.templateUrl != null) {
      $.ajax({
        url: config.templateUrl,
        type: 'GET',
        success: function(data) {
          self.routes[url].template = data;
          self.routes[url].status = 'ready';
          self.routes[url].errorMessage = null;
          $(self.routes[url]).trigger('ready');
        },
        error: function(data) {
          self.routes[url].status = 'error';
          self.routes[url].errorMessage = data.error().responseText;
          $(self.routes[url]).trigger('ready');
        }
      });
    }
    
    return self;
  }

  // Specify the default route if a route cannot be found.
  self.otherwise = function(config) {
    self.defaultRoute = config.redirectTo;
    return self;
  }

  // Specify the default route title
  self.defaultTitle = function(title) {
    self.defaultTitle = title;
    return self;
  }

// Creates a new controller.
  self.controller = function(name, fun) {
    self.controllers[name] = fun;
    return self;
  }

// Returns a routes raw template. Will either return the template or execute the callback
  self.getRouteTemplate = function(url, callback) {
    if (url.indexOf('?') != -1) {
      url = url.split('?')[0];
    }

    var  r = self.routes[url];
    // validate route
    if (r == undefined) {
      console.debug('The route "'+url+'" could not be found.');
      if (callback && typeof callback === 'function') { 
        callback(false);
      } else {
        return false;
      }
    }

    // get template
    if (r.status == 'ready') {
      if (callback && typeof callback === 'function') { 
        callback(r.template);
      } else {
        return r.template;
      }
    } else if(r.status == 'loading' && callback && typeof callback === 'function') {
      // wait for the template to load only if using a callback
      $(r).on('ready', function() {
        if (this.status == 'ready') {
          callback(r.template);
        } else {
          // The template could not be loaded.
          console.debug('The template could not be loaded for the route "'+url+'"');
          callback(false);
        }
      });
    } else {
      // The template could not be loaded.
      console.debug('The template could not be loaded for the route "'+url+'"');
      if (callback && typeof callback === 'function') { 
        callback(false);
      } else {
        return false;
      }
    }
  }

  // Executes a route in the application
  self.route = function(url, options) {
    url = url || window.location.href.toString().split(window.location.host)[1];

    // You may optionally overide the speed of the visual transition
    options = options || {};
    options.speed = options.speed || 100;
    options.view = self.view
    options.parameters = [];
    options.href = url; // important to keep the fully parameterized url

    if (url.indexOf('?') != -1) {
      var pieces = url.split('?')
        , arguments = pieces[1];
      url = pieces[0];
      var args = arguments.split('&');
      $.each(args, function(index, arg) {
        var argPieces = arg.split('=');
        options.parameters[argPieces[0]] = argPieces[1];
      });
    }

    if (options.reload) {
      go(options.href);
      return;
    }

    var  r = self.routes[url];

    // validate route
    if (r == undefined) {
      console.debug('Unknown route "'+url+'" executing default route...');
      return executeDefaultRoute();
    }

    if (self.executeBefore != null) {
      self.executeBefore();
    }

    // handle view inheritance (modals do not inherit anything).
    if (!r.modal) {
      if (r.parent != undefined && !(r.parent.route in self.viewStack)) {
        // load parent view
        options.inheriting = true; // certain features are disabled durring inheritance.
        self.route(r.parent.route,  {
          inheriting: true,
          callbacks: {
            after: function() {
              // Continue this route after the parent has loaded
              self.route(options.href);
            }
          }
        });
        return;
      } else if(r.parent != undefined) {
        // parent view is already loaded
        options.view = r.parent.view;
      } else if(r.template !== false) {
        // reset the stack (no template inheritance)
        self.viewStack = {};
      }
    }

    // execute the route
    if (r.status == 'ready') {
      transitionView(r, options);
    } else if(r.status == 'loading') {
      // wait for the template to load
      $(r).on('ready', function() {
        if (this.status == 'ready') {
          transitionView(r, options);
        } else {
          // The template could not be loaded.
          templateLoadFailed(r);
        }
      });
      // TODO: display loading.
    } else {
      // The template could not be loaded.
      templateLoadFailed(r);
    }
  }

  // Captures a link and forces it to use the router
  self.captureLink = function(link) {
    if (!$(link).data('captured')) {
      $(link).data('captured', true);
      $(link).click(function(e) {
        e.preventDefault();
        var confirmation = $(this).data('confirm');
        if (confirmation) {
          var c = confirm(confirmation);
          if (c) {
            self.route($(this).attr('href'));
          }
        } else {
          self.route($(this).attr('href'));
        }
        return false;
      });
    }
  }
}