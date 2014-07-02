function sample_n_dim(sample) {
  return function(arr) {
    if (!Array.isArray(arr)) {
      return sample(arr);
    } else {
      var samples = Array(arr.length);
      for (var i = 0, len = arr.length; i < len; i++) {
        samples[i] = sample(arr[i]);
      }
      return samples;
    }
  }
}

// Sample from a Gaussian distribution parameterized by mean and variance.
function gaussian_sample(mean, variance, num_samples) {
  // Use Box-Muller transform.
  // From http://stats.stackexchange.com/a/16350
  mean = mean || 0;
  variance = variance || 1;
  num_samples = num_samples || 1;
  var std = Math.sqrt(variance);

  function sample() {
    var w = 1, u, v;
    while (w >= 1) {
      u = 2 * Math.random() - 1;
      v = 2 * Math.random() - 1;
      w = Math.pow(u, 2) + Math.pow(v, 2);
    }
    var z = Math.sqrt((-2 * Math.log(w)) / w);
    return std * (u * z) + mean;
  }

  if (num_samples == 1) {
    return sample();
  } else {
    var samples = [];
    for (var i = 0; i < num_samples; i++) {
      samples.push(sample());
    }
    return samples;
  }
}

function gaussian_pdf(x, mean, std) {
  mean = mean || 0;
  std = std || 1;

  // Taken from jsStat.distribution.normal.pdf
  return Math.exp(-0.5 * Math.log(2 * Math.PI) - Math.log(std) - Math.pow(x - mean, 2) / (2 * std * std));
}

// From "Multiplicative random walk Metropolis-Hastings on the real line"
// arxix.org/abs/1008.5227
function random_dive_sample(x) {
  var epsilon = Math.random() * 2 - 1; // (-1,1)
  if (epsilon == 0) { // Prevent division by 0 errors.
    return 0;
  }
  var coeff = Math.pow(epsilon, (Math.random() < .5 ? 1 : -1)); // Either e or 1/e.
  return [coeff, x * coeff];
}

function scaling_factor(a) {
  // Taken from emcee source code (ensemble.py: _propose_stretch)
  a = a || 2;
  return Math.pow((a - 1) * Math.random() + 1, 2) / a;
}

var distribution = { 
  normal_sample: sample_n_dim(gaussian_sample), 
  normal_pdf: gaussian_pdf,
  scaling_factor: scaling_factor,
  random_dive: sample_n_dim(random_dive_sample)
};
module.exports = distribution;
