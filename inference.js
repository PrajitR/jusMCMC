var distribution = require('./distribution');

function affine_invariant(P, n_samples, n_walkers, n_args, args, pos0) {
  var walkers = Array(n_walkers),
      new_pos = [],
      old_probs = [],
      new_prob,
      log_prob,
      p_args,
      samples = Array(n_samples),
      xj,
      z;

  for (var i = 0; i < n_walkers; i++) {
    walkers[i] = initialPosition(null, n_args);
    old_probs[i] = P.apply(this, joinArgs(walkers[i], args));
  }
      
  for (var i = 0; i < n_samples; i++) {
    for (var j = 0; j < n_walkers; j++) {
      new_pos = [];
      xj = walkers[getRandomIndex(j, n_walkers)];
      z = distribution.scaling_factor();
      if (n_args == 1) {
        new_pos = xj + z * (walkers[j] - xj);
      } else {
        for (var k = 0; k < n_args; k++) {
          new_pos[k] = xj[k] + z * (walkers[j][k] - xj[k]);
        }
      }
      new_prob = P.apply(this, joinArgs(new_pos, args));
      if (Math.log(Math.random()) < (new_prob - old_probs[j])) {
        walkers[j] = new_pos;
        old_probs[j] = new_prob;
      }
    }
    samples[i] = walkers.slice();
  }

  return samples;
}

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
  var pos = pos0 || Math.random() * 2 - 1;
  if (!pos0 && n_args > 1) { 
    pos = [];
    for (var i = 0; i < n_args; i++) { 
      pos.push(Math.random() * 2 - 1); 
    } 
  }
  return pos;
}

function joinArgs(main, extra_args) {
  return [main].concat(extra_args || []);
}

function getRandomIndex(j, n_walkers) {
  var idx;
  do {
    idx = Math.random() * n_walkers | 0;
  } while (idx == j);
  return idx;
}

module.exports = { 'run': affine_invariant, 'mh': metropolis_hastings }
