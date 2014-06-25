var distribution = require('./distribution');

function metropolis_hastings(P, n_samples, Q, proposal, pos0) {
  Q = Q || function (_) { return 0; } // Log symmetrical distribution. Becomes Metropolis algorithm.
  proposal = proposal || distribution.normal_sample;
  var pos = pos0 || 0, new_pos, log_prob, new_prob, 
      old_prob = P(pos) + Q(pos), samples = [pos];

  for (var i = 1; i < n_samples; i++) { 
    new_pos = proposal(pos);
    new_prob = P(new_pos) + Q(new_pos);
    log_prob = new_prob - old_prob;
    if (Math.log(Math.random()) < log_prob) {
      pos = new_pos;
      old_prob = new_prob;
    }
    samples.push(pos);
  }

  return samples;
}

var samples = metropolis_hastings(function(x) { 
    return Math.log(distribution.normal_pdf(x, +process.argv[3] || null, +process.argv[4] || 0));
  }, +process.argv[2] | 1000);
console.log(JSON.stringify(samples));
