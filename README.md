JS Front
========

This extension adds the ability to easily create a JS Front End website. This will allow the developer to load content dynamically (ajax) while still maintaining support for search engines.

###How to use it

####PHP
When you enable this extension a new php class becomes available named `JSFrontController`. Using this class in place of the core `Controller` class will give your controllers the ability to correctly render content for the front end.
Example

        // use
        class CDemoIndex extends JSFrontController {
        ...
        // as apposed to
        class CDemoIndex extends Controller {
        ...

The extension will use the presence of the url parameter `ajax` to determine how the template should be rendered. e.g.

        http://example.com/?ajax=1
If `ajax=1` the extension will render the template without inheriting any parent templates. Otherwise it will use the parent template defined by the user.

You **must** define the parent template in order for the extension to function properly. You can define the parent template by passing it as an argument to the `render_view` method.

        // we define the parent template as 'demo/views/_base.html'
        echo $this->render_view('demo/views/index.html', array (
            'parent_template'=>'demo/views/_base.html'
        ));
####Javascript
Now that the backend is setup you can define your routes in javascript. Several new javascript class are are automatically included in the template. The only one we are concerned about right now is the `Router`.

The `Router` class allows you to define routes and their responding controllers (not to be confused with the PHP controllers on the server). 

        var router = new Router('#app-view')
            // executed after a view is loaded
            .after(function() {
                // capture local links each time
              $('a[href^="/"]').each(function(index, elem) {
                router.captureLink(elem);
              });
              // initialize lightboxes
              $('[data-lightbox]').each(function() {
                var lightbox = new Lightbox($(this).data('lightbox'), $(this));
              });
            })
            .when('/', {
                controller:'IndexCtrl',
                templateUrl:'/?ajax=1'
            })
            .when('/test', {
                controller:'TestCtrl',
                templateUrl:'/test?ajax=1'
            })
            .controller('IndexCtrl', function(params) {
                // perform any js actions
            })
            .controller('TestCtrl', function(params) {
                // perform any js actions
            });
        
        // capture local links.
        // We must do this to bind all of the initial links to the router.
        $('a[href^="/"]').each(function(index, elem) {
          router.captureLink(elem);
        });

####HTML
Now that we have both the php and javascript set up we must make one small change to the html templates.
In our example above we are rendering the template `demo/views/index.html`. Normally the begining of this file would look like this:

        {% extends demo/views/_base.html %}

However we need to change it to use the `parent_template` parameter that will either be the user defined value or a value defined by the extension in order to render the template for ajax.

        {% extends parent_template %}

And that's it!
However, if you ran this as is you would be disappointed because we didn't create any pages to link to.
This was also a simple example. If  you try creating some more pages you will soon realize that you have to define the router in each page you create. In order to make this scaleable we must create an intermediate class within our demo extension. This class will define our routes and we will use that in our controllers instead of the `JSFrontController`

We will create a new class in our demo extension's API `DemoAPI.php` located at `includes/extensions/demo/DemoAPI.php`.

        class DemoController extends JSFrontController {
            public function render_view($view, $args=array(), $options=array()) {
                S::$js_onload[] = <<< JS
        // define your routes here so we don't need to do so in every class
        JS;
                // define the parent_template here so we don't need to do so in every class
                if(!isset($args['parent_template'])) {
                    $args['parent_template'] = 'demo/views/_base.html';
                }
                // render the template with JSFrontController
                return parent::render_view($view, $args, $options);
            }
        }

Now everything has been abstracted out of your controller files. Here's what they look like now.

        class CDemoIndex extends DemoController {
            function GET($matches) {
                echo $this->render_view('demo/views/index.html');
            }
        }