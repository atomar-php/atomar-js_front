<?php
/**
 * Implements hook_permission()
 */
function js_front_permission() {
  return array(
    'administer_js_front',
    'access_js_front'
  );
}

/**
 * Implements hook_menu()
 */
function js_front_menu() {
  return array();
}

/**
 * Implements hook_model()
 */
function js_front_model() {
  return array();
}

/**
 * Implements hook_url()
 */
function js_front_url() {
  return array(
    '/!/js_front/(?P<api>[a-zA-Z\_-]+)/?(\?.*)?'=>'CJsFrontAPI'
  );
}

/**
 * Implements hook_libraries()
 */
function js_front_libraries() {
  return array(
    'JsFrontAPI.php'
  );
}

/**
 * Implements hook_cron()
 */
function js_front_cron() {
  // execute actions to be performed on cron
}

/**
 * Implements hook_twig_function()
 */
function js_front_twig_function() {
  // return an array of key value pairs.
  // key: twig_function_name
  // value: actual_function_name
  // You may use object functions as well
  // e.g. ObjectClass::actual_function_name  
  return array();
}

/**
 * Implements hook_preprocess_page()
 */
function js_front_preprocess_page() {
  // execute actions just before the page is rendered.
}

/**
 * Implements hook_preprocess_boot()
 */
function js_front_preprocess_boot() {
  // execute actions after the core has been loaded and before the extensions have been loaded.
}

/**
 * Implements hook_postprocess_boot()
 */
function js_front_postprocess_boot() {
  // execute actions after core and extensions have been loaded.
}