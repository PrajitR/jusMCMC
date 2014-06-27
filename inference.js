var distribution = require('./distribution');

function metropolis_hastings(P, n_samples, n_args, args, pos0, Q, proposal) {
  Q = Q || function (_) { return 0; } // Log symmetrical distribution. Becomes Metropolis algorithm.
  proposal = proposal || distribution.normal_sample;
  var pos = initialPosition(pos0, n_args), 
      new_pos, 
      log_prob, 
      samples = Array(n_samples),
      p_args = joinArgs(pos, args),
      new_prob, 
      old_prob = P.apply(this, p_args) + Q(pos);

  samples[0] = pos;
  for (var i = 1; i < n_samples; i++) { 
    new_pos = proposal(pos);
    p_args = joinArgs(new_pos, args);
    new_prob = P.apply(this, p_args) + Q(new_pos);
    log_prob = new_prob - old_prob;
    if (Math.log(Math.random()) < log_prob) {
      pos = new_pos;
      old_prob = new_prob;
    }
    samples[i] = pos;
  }

  return samples;
}

function initialPosition(pos0, n_args) {
  var pos = pos0 || 0;
  if (!pos0 && n_args > 1) { 
    pos = [];
    for (var i = 0; i < n_args; i++) { 
      pos.push(0); 
    } 
  }
  return pos;
}

function joinArgs(main, extra_args) {
  return [main].concat(extra_args || []);
}

module.exports = { 'run': metropolis_hastings };
