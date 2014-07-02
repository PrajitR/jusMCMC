var mcmc = require('../inference'),
    distribution = require('../distribution'),
    fs = require('fs');

function basic_normal() {
  function lnprob(x) { 
    var s = distribution.normal_pdf;
    return Math.log(.5 * s(x, 14, 1) + .5 * s(x, 35, 2));
  }
  // Affine-Invariant
  var samples = mcmc.run(lnprob, +process.argv[2] || 100, 10, 1, null, 5);
  fs.writeFileSync('normal_data.json', JSON.stringify([].concat.apply([], samples)));

  //M-H
  //var samples = mcmc.mh(lnprob, +process.argv[2] || 1000, 1, null, 5);
  //fs.writeFileSync('normal_data.json', JSON.stringify(samples));
  return samples;
}

basic_normal();
