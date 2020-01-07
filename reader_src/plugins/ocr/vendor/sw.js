!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SW=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dir = require('../obj/dir');

function defdir(curscore, mmscore, delscore, inscore) {
  var curdir;

  if (curscore === mmscore) {
    curdir = dir.diag;
  } else if (curscore === delscore) {
    curdir = dir.up;
  } else if (curscore === inscore) {
    curdir = dir.left;
  }

  if (curscore < 0) {
    curdir = dir.none;
  }

  return curdir;
}

module.exports = defdir;
},{"../obj/dir":7}],2:[function(require,module,exports){
/** gss - gap-scoring scheme **/
function deletion(H, i, j, gss) {
  var k;
  var maxidx;
  var max;

  max = -1;

  for (k = i - 1; k >=0; k--) {
    if (max < H[k][j]) {
      max = H[k][j];
      maxidx = k;
    }
  }

  max = max + gss(i - maxidx);

  return max;
}

module.exports = deletion;
},{}],3:[function(require,module,exports){
/** gss - gap-scoring scheme **/
function insertion(H, i, j, gss) {
  var l;
  var max;
  var maxidx;

  max = -1;

  for (l = j - 1; l >= 0; l--) {
    if(max < H[i][l]) {
      max = H[i][l];
      maxidx = l;
    }
  } 

  max = max + gss(j - maxidx);

  return max;
}

module.exports = insertion;
},{}],4:[function(require,module,exports){
function mmatch(H, i, j, seq1, seq2, simfunc) {
  var prevres;
  var curres;
  var seq1cur, seq2cur;
  var simil;

  prevres = H[i - 1][j - 1];

  seq1cur = seq1[i - 1];
  seq2cur = seq2[j - 1];

  simil = simfunc(seq1cur, seq2cur);

  curres = prevres + simil;

  return curres;
}

module.exports = mmatch;
},{}],5:[function(require,module,exports){
var dir = require('../obj/dir');

function restorelm(H, T) {
  var len1, len2;
  var i, j;
  var max;
  var maxi, maxj;

  var walk;

  max = -1;

  len1 = H.length;
  len2 = H[0].length;

  walk = [];

  for (i = 0; i < len1; i++) {
    for (j = 0; j < len2; j++) {
      if (max < H[i][j]) {
        max = H[i][j];
        maxi = i;
        maxj = j;
      }
    }
  }


  for (i = maxi, j = maxj; H[i][j];) {
    walk.push({ i: i - 1, j: j - 1 });

    switch(T[i][j]) {
      case dir.diag:
        i--;
        j--;
        break;
      case dir.left:
        j--;
        break;
      case dir.up:
        i--;
        break;
      default:
        break;
    }
  }

  return walk;
}

module.exports = restorelm;
},{"../obj/dir":7}],6:[function(require,module,exports){
var mmatch = require('./fn/mmatch');
var deletion = require('./fn/deletion');
var insertion = require('./fn/insertion');
var defdir = require('./fn/defdir');
var restorelm = require('./fn/restorelm');

var dir = require('./obj/dir');

function sw(seq1, seq2, gss, simfunc) {
  var len1, len2;
  var i, j;
  var H, T;

  var mmscore;
  var delscore;
  var inscore;

  var longestmatch;

  len1 = seq1.length;
  len2 = seq2.length;

  H = [];
  T = [];
  H[0] = [];
  T[0] = [];

  for (i = 0; i < len2 + 1; i++) {
    H[0][i] = 0;
    T[0][i] = dir.none;
  }

  for (i = 0; i < len1 + 1; i++) {
    if (!H[i]) {
      H[i] = [];
      T[i] = [];
    }

    H[i][0] = 0;
    T[i][0] = dir.none;
  }

  for (i = 1; i < len1 + 1; i++) {
    for (j = 1; j < len2 + 1; j++) {
      mmscore = mmatch(H, i, j, seq1, seq2, simfunc);
      delscore = deletion(H, i, j, gss);
      inscore = insertion(H, i, j, gss);

      H[i][j] = Math.max(0, mmscore, delscore, inscore);
      T[i][j] = defdir(H[i][j], mmscore, delscore, inscore);
    }
  }

  longestmatch = restorelm(H, T);

  return longestmatch;
}

module.exports = sw;
},{"./fn/defdir":1,"./fn/deletion":2,"./fn/insertion":3,"./fn/mmatch":4,"./fn/restorelm":5,"./obj/dir":7}],7:[function(require,module,exports){
var directions = {
	none: 0,
  diag: 1,
  left: 2,
  up: 3
};

module.exports = directions;
},{}]},{},[6])(6)
});