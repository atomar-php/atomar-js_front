<?php

/**
 * Implements hook_uninstall()
 */
function js_front_uninstall() {
  // destroy tables and variables
  return true;
}

/**
 * Implements hook_update_version()
 */
function js_front_update_1() {
  // TODO: perform any nessesary database changes when updating to this version.
  return true;
}