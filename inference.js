var distribution = require('./distribution');

// Affine-Invariant MCMC.
// "Ensemble Samplers with Affine Invariance" by Goodman and Weare
// cims.nyu.edu/~weare/papers/d13.pdf
function affine_invariant(P, n_samples, n_walkers, pos0, args) {
  var walkers = Array(n_walkers), // Positions of all walkers.
      new_pos, // The proposed position.
      old_probs = Array(n_walkers), // Log of probability of current positions of all walkers (prevent recomputation).
      new_prob, // Log of the proposed position's probability.
      log_prob, // Log of acceptance probability.
      p_args, // Arguments to pass into probability function P.
      n_args = pos0.length, // Number of variables we're sampling over.
      samples = Array(n_samples), // Array of samples.
      xj, // Walker other than the current walker.
      z; // Scaling factor.

  // Initialize all walkers.
  for (var i = 0; i < n_walkers; i++) {
    walkers[i] = initialPosition(pos0, n_args);
    old_probs[i] = P.apply(this, joinArgs(walkers[i], args));
  }
      
  for (var i = 0; i < n_samples; i++) {
    // Each iteration updates every walker.
    for (var j = 0; j < n_walkers; j++) {
      // Compute the proposal position.
      new_pos = Array(n_args);
      xj = walkers[differentWalker(j, n_walkers)];
      z = distribution.scaling_factor();
      // Scale the current position.
      for (var k = 0; k < n_args; k++) {
        new_pos[k] = xj[k] + z * (walkers[j][k] - xj[k]);
      }

      // Compute acceptance probability.
      new_prob = P.apply(this, joinArgs(new_pos, args));
      log_prob = (n_args - 1) * Math.log(z) + new_prob - old_probs[j];
      
      // Accept if randomly generated number is less than acceptance probability.
      if (Math.log(Math.random()) < log_prob) {
        walkers[j] = new_pos;
        old_probs[j] = new_prob;
      }
    }

    // Record positions of all walkers.
    samples[i] = walkers.slice();
  }

  return samples;
}

// Metropolis-Hasting MCMC.
function metropolis_hastings(P, n_samples, pos0, args, Q, proposal) {
  Q = Q || function (_) { return 0; } // Log symmetrical distribution. Becomes Metropolis algorithm.
  proposal = proposal || distribution.random_dive; // Random dive proposal. See distribution.js for details.
  var pos = initialPosition(pos0, n_args), // Current position.
      n_args = pos0.length, // Number of variables we're sampling.
      new_pos = Array(n_args), // The proposed position.
      log_prob, // Log of acceptance probability.
      samples = Array(n_samples), // Array of samples.
      p_args = joinArgs(pos, args), // Arguments to pass into probability function P.
      new_prob, // Log of the proposed position's probability.
      old_prob = P.apply(this, p_args) + Q(pos), // Log of current position's probability (prevent recomputation).
      proposal_info; // [new_pos, coefficient]. Required to get coefficient for acceptance probability.

  samples[0] = pos; // Initial position is our first sample.
  for (var i = 1; i < n_samples; i++) { 
    // Generate a new proposal.
    proposal_info = proposal(pos).slice();
    new_pos = proposal_info[0];

    // Compute acceptance probability.
    p_args = joinArgs(new_pos, args);
    new_prob = P.apply(this, p_args) + Q(new_pos);
    log_prob = new_prob - old_prob + Math.log(Math.abs(proposal_info[1])); // See random-dive paper for details.

    // Accept if randomly generated number is less than the acceptance probability.
    if (Math.log(Math.random()) < log_prob) {
      pos = new_pos;
      old_prob = new_prob;
    }

    // Record the sample.
    samples[i] = pos.slice();
  }

  return samples;
}

// Slightly perturb the original position (required for Affine-Invariant).
function initialPosition(pos0, n_args) {
  var pos = pos0.slice();
  for (var i = 0; i < n_args; i++) {
    pos[i] += Math.random() * 2 - 1;
  }
  return pos;
}

// Join proposal with auxilliary arguments needed to compute the probability.
// Note: the auxilliary arguments are constant throughout the sampling process.
// They are there exclusively to help compute each probability.
function joinArgs(main, extra_args) {
  return [main].concat(extra_args || []);
}

// For Affine-Invariant MCMC.
// Pick a different walker randomly from the set of all walkers.
function differentWalker(j, n_walkers) {
  var idx;
  do {
    idx = Math.random() * n_walkers | 0;
  } while (idx == j); // Pick a different walker from the current one.
  return idx;
}

module.exports = { 'run': affine_invariant, 'mh': metropolis_hastings }
