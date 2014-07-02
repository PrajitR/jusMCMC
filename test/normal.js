var mcmc = require('../inference'),
    distribution = require('../distribution'),
    fs = require('fs');

function basic_normal() {
  function lnprob(x) { 
    var s = distribution.normal_pdf;
    return Math.log(.5 * s(x, 14, 1) + .5 * s(x, 35, 2));
  }

  //var samples = mcmc.run(lnprob, +process.argv[2] || 4, 10, [5]); // Affine-Invariant
  var samples = mcmc.mh(lnprob, +process.argv[2] || 1000, [5]); // MH
  fs.writeFileSync('normal_data.json', JSON.stringify(samples));
  return samples;
}

basic_normal();
