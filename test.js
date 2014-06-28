var mcmc = require('./inference'),
    distribution = require('./distribution'),
    fs = require('fs');

function basic_normal() {
  var samples = mcmc.run(function(x) { 
      return Math.log(distribution.normal_pdf(x, +process.argv[3] || null, +process.argv[4] || null));
    }, +process.argv[2] || 3, 10, 1);
  console.log(JSON.stringify([].concat.apply([], samples)));
  return samples;
}

// From emcee user guide.
function linear_fit() {
  var data = JSON.parse(fs.readFileSync('linear.json'));

  function lnprior(theta) {
    var m = theta[0], b = theta[1], lnf = theta[2];
    if ((-5 < m && m < 5) && (0 < b && b < 10) && (-10 < lnf && lnf < 1)) {
      return 0.0;
    }
    return Number.NEGATIVE_INFINITY;
  }

  function lnlikelihood(theta, x, y, yerr) {
    var m = theta[0], b = theta[1], lnf = theta[2], 
        len = x.length, sum = 0;
    for (var i = 0; i < len; i++) {
      var yhat = m * x[i] + b, 
          inv_sigma = 1.0 / (Math.pow(yhat, 2) + Math.pow(yhat, 2) * Math.exp(2 * lnf));
      sum += Math.pow(y[i] - yhat, 2) * inv_sigma - Math.log(inv_sigma);
    }
    return -0.5 * sum;
  }

  function lnprob(theta, x, y, yerr) {
    var lp = lnprior(theta);
    if (!Number.isFinite(lp)) {
      return lp;
    }
    return lp + lnlikelihood(theta, x, y, yerr);
  }

  var samples = mcmc.run(lnprob, 100, 10, 3, [data['x'], data['y'], data['yerr']], [-1, 4.5, 0.454]);
  console.log(JSON.stringify([].concat.apply([], samples)));
  return samples;
}

//basic_normal();
linear_fit();
