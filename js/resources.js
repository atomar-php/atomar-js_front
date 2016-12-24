function Resources(view) {
  var self = this;
  self.resources = new Object();

  // Should be ran after the document has finished loading
  // to fetch the resource
  self.fetch = function(name, url) {
    if (name == '' || name == null || url == '' || url == null) {
      console.debug('resoures must have a name and url');
      return self;
    }

    self.resources[name] = {
      name: name,
      url: url,
      status: 'loading'
    };

    // load the resource
    $.ajax({
      url: url,
      type: 'GET',
      success: function(data) {
        self.resources[name].data = data;
        self.resources[name].status = 'ready';
        self.resources[name].tags = null;
        self.resources[name].conditions = null;
        self.resources[name].errorMessage = null;
      },
      error: function(data) {
        self.resources[name].status = 'error';
        self.resources[name].errorMessage = data.error().responseText;
      }
    });
    
    return self;
  }

  // Returns an object representing the resource or false.
  function getResourceObject(name) {
    if (self.resourceIsReady(name)) {
      return self.resources[name];
    } else {
      return false;
    }
  }

  // renders a tag in a template with the supplied value
  function renderTag(template, tag, value) {
    if (!tag) {
      console.log('Resources:renderTag: The tag is invalid');
      return template;
    }
    if (value === null || value === undefined) {
      value = '';
    }
    var regex = new RegExp(tag, 'gmi');
    return template.replace(regex, value);
  }

  // renders a condition in a template given the supplied value
  // NOTE: nested conditions are not currently supported.
  function renderCondition(template, condition, value) {
    if (!condition) {
      console.log('Resources:renderCondition: The condition is invalid');
      return template;
    }
    if (!value) {
      var regex = new RegExp(condition+'.*{{\\s*endif\\s*}}', 'gmi');
      return template.replace(regex, '');
    } else {
      var regex = new RegExp(condition+'(.*){{\\s*endif\\s*}}', 'gmi');
      return template.replace(regex, '$1');
    }
  }

  // Gets a resource if it has been loaded.
  self.get = function(name) {
    var r = getResourceObject(name);
    if (r) {
      return r.data;
    } else {
      return null;
    }
  }

  // Renders a resource template by populating tags with the provided options.
  // Tags must only consist of letters, dashes, and underscores.
  self.render = function(name, options) {
    var resource = getResourceObject(name);

    if (resource) {
      // convert to single line for ease of parsing
      var template = resource.data.replace(/\r\n+\s*|\r\s*|\n\s*/gm, '');
      // render the template conditions
      if (resource.conditions === null) {
        var conditions = template.match(/({{\s*if\s+[a-z\-\_]+\s*}})/gmi);
        resource.conditions = {};
        $.each(conditions, function(index, condition) {
          var conditionName = condition.replace(/{{\s*|\s*}}|if\s*/gm, '');
          // clean the condition tag
          condition = '{{\\s*if\\s*'+conditionName+'\\s*}}';
          resource.conditions[conditionName] = condition;

          // populate condition
          template = renderCondition(template, condition, options[conditionName]);
        });
      } else {
        // populate conditions
        $.each(resource.conditions, function(key, condition) {
          template = renderCondition(template, condition, options[key]);
        });
      }
      // render the template tags
      if (resource.tags === null) {
        // parse resource tags once
        var tags = template.match(/({{\s*[a-z\-\_]+\s*}})/gmi);
        resource.tags = {};
        $.each(tags, function(index, tag) {
          var tagName = tag.replace(/{{|}}|\s+/gm, '');
          // clean the tag
          tag = '{{\\s*'+tagName+'\\s*}}';
          resource.tags[tagName] = tag;
          // populate tag
          template = renderTag(template, tag, options[tagName]);
        });
      } else {
        // populate tags
        $.each(resource.tags, function(key, tag) {
          template = renderTag(template, tag, options[key]);
        });
      }
      return template;
    } else {
      return null;
    }
  }

  // Checks if a single resource is ready to be used.
  self.resourceIsReady = function(name) {
    var r = self.resources[name];
    return r != undefined && r.status == 'ready';
  }
}