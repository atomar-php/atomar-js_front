<?php
/**
* This is the internal api class that can be used by third party extensions
*/
class JsFrontAPI
{
  public function stub() {

  }
}

/**
 * Extends the system controller with support for a javascript front end
 *
 * @param 
 */
class JSFrontController extends Controller
{

  public function __construct() {
    $this->is_ajax_request = isset($_REQUEST['ajax']) && $_REQUEST['ajax'] == '1';
    parent::__construct();
  }

  /**
     * Renders the view and does some extra processing
     * @param string $view the relative path to the view that will be redered
     * @param array $args custom options that will be sent to the view. You should specify the 'parent_template' in order to correctly use the javascript front
     * @param array $options optional rules regarding how the template will be rendered.
     * @return string the rendered html if 
     */
    public function render_view($view, $args=array(), $options=array()) {
      $args['is_ajax_request'] = $this->is_ajax_request;
      if ($this->is_ajax_request) {
        $args['parent_template'] = 'js_front/views/_js_front_base.html';
      } else {
        S::$js[] = 'includes/extensions/js_front/js/functions.js';
        S::$js[] = 'includes/extensions/js_front/js/router.js';
        S::$js[] = 'includes/extensions/js_front/js/resources.js';
        // use the standard tempalte by default
        if (!isset($args['parent_template'] )) {
          $args['parent_template'] = '_base.html';
        }
      }
      return parent::render_view($view, $args, $options);
    }
}

/**
 * Extends the system lightbox with support for a javascript front end
 *
 * @param 
 */
class JSFrontLightbox extends Lightbox
{

}