<?php
  class CJsFrontAPI extends ApiController {

    function GET($matches=array()) {
      $api = $matches['api'];
      switch ($api) {
        case 'stub':
          set_notice('Stub GET API method.');
          break;
        default:
          set_error('Unknown API process "'.$api.'".');
          break;
      }
      $this->go_back();
    }

    function POST($matches=array()) {
      $api = $matches['api'];
      switch ($api) {
        case 'stub':
          set_notice('Stub POST API method.');
          break;
        default:
          set_error('Unknown API process "'.$api.'".');
          break;
      }
      $this->go_back();
    }
  }