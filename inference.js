var distribution = require('./distribution');

function affine_invariant(P, n_samples, n_walkers, pos0, args) {
  var walkers = Array(n_walkers),
      new_pos,
      old_probs = Array(n_walkers),
      new_prob,
      log_prob,
      p_args,
      n_args = pos0.length,
      samples = Array(n_samples),
      xj,
      z;

  for (var i = 0; i < n_walkers; i++) {
    walkers[i] = initialPosition(pos0, n_args);
    old_probs[i] = P.apply(this, joinArgs(walkers[i], args));
  }
      
  for (var i = 0; i < n_samples; i++) {
    for (var j = 0; j < n_walkers; j++) {
      new_pos = Array(n_args);
      xj = walkers[getRandomIndex(j, n_walkers)];
      z = distribution.scaling_factor();
      for (var k = 0; k < n_args; k++) {
        new_pos[k] = xj[k] + z * (walkers[j][k] - xj[k]);
      }
      new_prob = P.apply(this, joinArgs(new_pos, args));
      log_prob = (n_args - 1) * Math.log(z) + new_prob - old_probs[j];
      if (Math.log(Math.random()) < log_prob) {
        walkers[j] = new_pos;
        old_probs[j] = new_prob;
      }
    }
    samples[i] = walkers.slice();
  }

  return samples;
}

function metropolis_hastings(P, n_samples, pos0, args, Q, proposal) {
  Q = Q || function (_) { return 0; } // Log symmetrical distribution. Becomes Metropolis algorithm.
  proposal = proposal || distribution.random_dive;
  var pos = initialPosition(pos0, n_args), 
      n_args = pos0.length,
      new_pos = Array(n_args),
      log_prob, 
      samples = Array(n_samples),
      p_args = joinArgs(pos, args),
      new_prob, 
      old_prob = P.apply(this, p_args) + Q(pos),
      proposal_info;

  samples[0] = pos;
  for (var i = 1; i < n_samples; i++) { 
    proposal_info = proposal(pos).slice();
    new_pos = proposal_info[0];
    p_args = joinArgs(new_pos, args);
    new_prob = P.apply(this, p_args) + Q(new_pos);
    log_prob = new_prob - old_prob + Math.log(Math.abs(proposal_info[1]));
    if (Math.log(Math.random()) < log_prob) {
      pos = new_pos;
      old_prob = new_prob;
    }
    samples[i] = pos.slice();
  }

  return samples;
}

function initialPosition(pos0, n_args) {
  var pos = pos0.slice();
  for (var i = 0; i < n_args; i++) {
    pos[i] += Math.random() * 2 - 1;
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
